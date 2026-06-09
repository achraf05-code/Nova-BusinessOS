"use server";

import { redirect } from "next/navigation";
import { withAction, actionFail, actionOk } from "@/lib/actions";
import { getStripe, priceIdForPlan, stripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow } from "@/lib/demoStore";
import { logActivity } from "@/lib/activity";
import { nova } from "@/config/nova";
import { z } from "zod";
import type { SubscriptionPlan } from "@/types/database";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? nova.url;

const planSchema = z.object({
  plan: z.enum(["starter", "business", "enterprise"]),
});

export async function startCheckoutAction(form: Record<string, unknown>) {
  return withAction({ requiredRole: "admin" }, async (ctx) => {
    const parsed = planSchema.safeParse(form);
    if (!parsed.success) return actionFail("Invalid plan");
    const plan = parsed.data.plan as SubscriptionPlan;

    if (!stripeConfigured()) {
      // Demo: just flip the plan in the store and pretend Stripe answered.
      if (!supabaseConfigured) {
        const store = getStore();
        const sub = store.subscriptions.find(
          (s) => s.company_id === ctx.company.id
        );
        if (sub) {
          sub.plan = plan;
          sub.status = "active";
          sub.current_period_end = new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString();
          sub.cancel_at_period_end = false;
          sub.updated_at = isoNow();
        }
      }
      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "billing.plan_switched_demo",
        entityType: "subscription",
        metadata: { plan },
      });
      return actionOk({ url: "/dashboard/billing?demo=1" });
    }

    const priceId = priceIdForPlan(plan);
    if (!priceId)
      return actionFail(
        `STRIPE_PRICE_${plan.toUpperCase()} is not set on the server.`
      );

    const stripe = getStripe();

    // Find or create the customer
    let customerId: string | null = null;
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("company_id", ctx.company.id)
        .maybeSingle();
      customerId =
        (data as { stripe_customer_id: string | null } | null)
          ?.stripe_customer_id ?? null;
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: ctx.user.email ?? undefined,
        metadata: {
          company_id: ctx.company.id,
          company_name: ctx.company.name,
        },
      });
      customerId = customer.id;
      if (supabaseConfigured) {
        const supabase = await createClient();
        await supabase
          .from("subscriptions")
          .upsert(
            {
              company_id: ctx.company.id,
              stripe_customer_id: customerId,
              plan: "starter",
              status: "incomplete",
            } as never,
            { onConflict: "company_id" } as never
          );
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/dashboard/billing?canceled=1`,
      allow_promotion_codes: true,
      metadata: {
        company_id: ctx.company.id,
        plan,
      },
      subscription_data: {
        metadata: { company_id: ctx.company.id, plan },
      },
    });
    if (!session.url) return actionFail("Stripe did not return a URL.");
    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "billing.checkout_started",
      entityType: "subscription",
      metadata: { plan, session_id: session.id },
    });
    return actionOk({ url: session.url });
  });
}

export async function openCustomerPortalAction() {
  return withAction({ requiredRole: "admin" }, async (ctx) => {
    if (!stripeConfigured()) {
      return actionFail(
        "Customer portal is unavailable in demo mode. Set STRIPE_SECRET_KEY."
      );
    }
    const supabase = supabaseConfigured ? await createClient() : null;
    let customerId: string | null = null;
    if (supabase) {
      const { data } = await supabase
        .from("subscriptions")
        .select("stripe_customer_id")
        .eq("company_id", ctx.company.id)
        .maybeSingle();
      customerId =
        (data as { stripe_customer_id: string | null } | null)
          ?.stripe_customer_id ?? null;
    }
    if (!customerId)
      return actionFail("No Stripe customer for this workspace yet.");
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${APP_URL}/dashboard/billing`,
    });
    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "billing.portal_opened",
      entityType: "subscription",
    });
    return actionOk({ url: portal.url });
  });
}

export async function cancelSubscriptionAction() {
  return withAction(
    { requiredRole: "admin", revalidate: ["/dashboard/billing"] },
    async (ctx) => {
      if (stripeConfigured()) {
        const supabase = supabaseConfigured ? await createClient() : null;
        let subId: string | null = null;
        if (supabase) {
          const { data } = await supabase
            .from("subscriptions")
            .select("stripe_subscription_id")
            .eq("company_id", ctx.company.id)
            .maybeSingle();
          subId =
            (data as { stripe_subscription_id: string | null } | null)
              ?.stripe_subscription_id ?? null;
        }
        if (!subId) return actionFail("No active subscription to cancel.");
        const stripe = getStripe();
        await stripe.subscriptions.update(subId, {
          cancel_at_period_end: true,
        });
      } else if (!supabaseConfigured) {
        const store = getStore();
        const sub = store.subscriptions.find(
          (s) => s.company_id === ctx.company.id
        );
        if (sub) {
          sub.cancel_at_period_end = true;
          sub.updated_at = isoNow();
        }
      }
      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "billing.subscription_canceled",
        entityType: "subscription",
      });
      return actionOk({ ok: true });
    }
  );
}

export async function redirectToBillingPlan(plan: SubscriptionPlan) {
  const res = await startCheckoutAction({ plan });
  if (!res.ok) {
    redirect(`/dashboard/billing?error=${encodeURIComponent(res.error)}`);
  }
  redirect(res.data.url);
}
