import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, planFromPriceId, stripeConfigured } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { logActivity, notifyCompany } from "@/lib/activity";
import { getStore, isoNow } from "@/lib/demoStore";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!stripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 501 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing_signature" }, { status: 400 });

  const stripe = getStripe();
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "invalid_signature",
        message: err instanceof Error ? err.message : "verification_failed",
      },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const companyId = session.metadata?.company_id;
        if (!companyId) break;
        const subscriptionId = session.subscription as string | null;
        const customerId = session.customer as string | null;
        let plan: SubscriptionPlan = "starter";
        let periodEnd: string | null = null;
        let status: SubscriptionStatus = "active";
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          plan = planFromPriceId(sub.items.data[0]?.price?.id ?? null);
          status = sub.status as SubscriptionStatus;
          periodEnd = new Date(sub.current_period_end * 1000).toISOString();
        }
        await upsertSubscription(companyId, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status,
          current_period_end: periodEnd,
          cancel_at_period_end: false,
        });
        await logActivity({
          companyId,
          actorId: null,
          action: "billing.checkout_completed",
          entityType: "subscription",
          metadata: { plan, subscription_id: subscriptionId },
        });
        await notifyCompany({
          companyId,
          type: "system",
          title: `Subscription activated · ${plan}`,
          body: "Welcome to Nova BusinessOS!",
          href: "/dashboard/billing",
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const companyId =
          (sub.metadata?.company_id as string | undefined) ??
          (await findCompanyIdByCustomer(sub.customer as string));
        if (!companyId) break;
        const plan = planFromPriceId(sub.items.data[0]?.price?.id ?? null);
        const status = sub.status as SubscriptionStatus;
        await upsertSubscription(companyId, {
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer as string,
          plan,
          status,
          current_period_end: new Date(
            sub.current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end,
        });
        await logActivity({
          companyId,
          actorId: null,
          action:
            event.type === "customer.subscription.deleted"
              ? "billing.subscription_deleted"
              : "billing.subscription_updated",
          entityType: "subscription",
          metadata: { status, plan, cancel_at_period_end: sub.cancel_at_period_end },
        });
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const companyId =
          (invoice.metadata?.company_id as string | undefined) ??
          (await findCompanyIdByCustomer(invoice.customer as string));
        if (!companyId) break;
        await logActivity({
          companyId,
          actorId: null,
          action: "billing.invoice_paid",
          entityType: "subscription",
          metadata: {
            stripe_invoice_id: invoice.id,
            amount_paid: invoice.amount_paid,
          },
        });
        await notifyCompany({
          companyId,
          type: "invoice_paid",
          title: "Subscription invoice paid",
          body: `Stripe charged ${(invoice.amount_paid / 100).toFixed(
            2
          )} ${invoice.currency.toUpperCase()}.`,
          href: "/dashboard/billing",
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    return NextResponse.json(
      { error: "handler_failed", message: err instanceof Error ? err.message : "" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  companyId: string,
  patch: {
    stripe_customer_id?: string | null;
    stripe_subscription_id?: string | null;
    plan?: SubscriptionPlan;
    status?: SubscriptionStatus;
    current_period_end?: string | null;
    cancel_at_period_end?: boolean;
  }
) {
  if (!supabaseConfigured) {
    const store = getStore();
    let row = store.subscriptions.find((s) => s.company_id === companyId);
    if (!row) {
      row = {
        id: cryptoRandom(),
        company_id: companyId,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        plan: "starter",
        status: "trialing",
        current_period_end: null,
        cancel_at_period_end: false,
        trial_end: null,
        created_at: isoNow(),
        updated_at: isoNow(),
      };
      store.subscriptions.push(row);
    }
    Object.assign(row, patch, { updated_at: isoNow() });
    return;
  }
  const supabase = createAdminClient();
  await supabase
    .from("subscriptions")
    .upsert(
      { company_id: companyId, ...patch } as never,
      { onConflict: "company_id" } as never
    );
}

async function findCompanyIdByCustomer(customerId: string) {
  if (!supabaseConfigured) {
    const store = getStore();
    return (
      store.subscriptions.find((s) => s.stripe_customer_id === customerId)
        ?.company_id ?? null
    );
  }
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("company_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return (data as { company_id: string } | null)?.company_id ?? null;
}

function cryptoRandom() {
  return globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}
