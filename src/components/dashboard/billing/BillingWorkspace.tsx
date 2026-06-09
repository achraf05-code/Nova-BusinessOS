"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/badge/Badge";
import ConfirmDialog from "@/components/ui/dialog/ConfirmDialog";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { PLAN_LIMITS, planLabel, isUnlimited } from "@/lib/plans";
import {
  cancelSubscriptionAction,
  openCustomerPortalAction,
  startCheckoutAction,
} from "@/app/dashboard/billing/actions";
import type { SubscriptionPlan, SubscriptionStatus } from "@/types/database";
import { formatDate } from "@/lib/format";

interface Usage {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  contacts: { used: number; limit: number };
  projects: { used: number; limit: number };
  users: { used: number; limit: number };
}

interface Props {
  usage: Usage;
  currency: string;
  stripeReady: boolean;
}

export default function BillingWorkspace({ usage, currency, stripeReady }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [busy, setBusy] = useState(false);

  const choosePlan = (plan: SubscriptionPlan) => {
    setPendingPlan(plan);
    startTransition(async () => {
      const res = await startCheckoutAction({ plan });
      setPendingPlan(null);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (res.data.url.startsWith("http")) {
        window.location.href = res.data.url;
      } else {
        toast.success(`Plan switched to ${planLabel(plan)} (demo mode)`);
        router.refresh();
      }
    });
  };

  const openPortal = () => {
    startTransition(async () => {
      const res = await openCustomerPortalAction();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      window.location.href = res.data.url;
    });
  };

  const onCancelConfirm = () => {
    setBusy(true);
    startTransition(async () => {
      const res = await cancelSubscriptionAction();
      setBusy(false);
      setConfirmCancel(false);
      if (!res.ok) toast.error("Couldn't cancel", res.error);
      else {
        toast.success(
          "Subscription will end at the current period end."
        );
        router.refresh();
      }
    });
  };

  const renderLimit = (n: number) => (isUnlimited(n) ? "Unlimited" : n);

  return (
    <div className="space-y-6">
      {/* Current plan summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Current plan
            </p>
            <h3 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {planLabel(usage.plan)}{" "}
              <span className="ml-2">
                <Badge
                  size="sm"
                  color={
                    usage.status === "active"
                      ? "success"
                      : usage.status === "trialing"
                      ? "info"
                      : usage.status === "past_due"
                      ? "warning"
                      : "error"
                  }
                >
                  {usage.status}
                </Badge>
              </span>
              {usage.cancelAtPeriodEnd && (
                <span className="ml-2">
                  <Badge size="sm" color="warning">
                    cancels at period end
                  </Badge>
                </span>
              )}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {usage.currentPeriodEnd
                ? `Next renewal: ${formatDate(usage.currentPeriodEnd)}`
                : "No renewal date yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {stripeReady && (
              <button
                type="button"
                onClick={openPortal}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Manage in Stripe
              </button>
            )}
            {!usage.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="rounded-lg border border-error-200 bg-white px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:border-error-500/40 dark:bg-gray-800 dark:hover:bg-error-500/10"
              >
                Cancel subscription
              </button>
            )}
          </div>
        </div>
        {!stripeReady && (
          <p className="mt-4 rounded-lg border border-blue-light-200 bg-blue-light-50 px-3 py-2 text-xs text-blue-light-800 dark:border-blue-light-500/40 dark:bg-blue-light-500/10 dark:text-blue-light-200">
            Demo mode: set <code>STRIPE_SECRET_KEY</code> and price IDs to enable real checkout.
          </p>
        )}
      </div>

      {/* Usage */}
      <div className="grid gap-4 sm:grid-cols-3">
        <UsageCard label="Team members" used={usage.users.used} limit={usage.users.limit} />
        <UsageCard label="Contacts" used={usage.contacts.used} limit={usage.contacts.limit} />
        <UsageCard label="Projects" used={usage.projects.used} limit={usage.projects.limit} />
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Available plans
        </h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {(Object.keys(PLAN_LIMITS) as SubscriptionPlan[]).map((plan) => {
            const limits = PLAN_LIMITS[plan];
            const current = usage.plan === plan;
            return (
              <div
                key={plan}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  current
                    ? "border-brand-500 bg-brand-50/40 dark:bg-brand-500/10"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {planLabel(plan)}
                  </h4>
                  {current && (
                    <Badge color="primary" size="sm">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {limits.description}
                </p>
                <p className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white">
                  ${limits.price}
                  <span className="text-sm font-normal text-gray-500">
                    {" "}
                    / company / mo
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>👥 {renderLimit(limits.max_users)} users</li>
                  <li>📒 {renderLimit(limits.max_contacts)} contacts</li>
                  <li>📁 {renderLimit(limits.max_projects)} projects</li>
                </ul>
                <button
                  type="button"
                  disabled={current || pendingPlan === plan}
                  onClick={() => choosePlan(plan)}
                  className={`mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    current
                      ? "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
                      : "bg-brand-500 text-white hover:bg-brand-600"
                  } disabled:opacity-60`}
                >
                  {pendingPlan === plan
                    ? "Redirecting…"
                    : current
                    ? "Active"
                    : `Choose ${planLabel(plan)}`}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          All amounts in {currency}. Switching plans takes effect immediately.
        </p>
      </div>

      <ConfirmDialog
        isOpen={confirmCancel}
        title="Cancel your subscription?"
        description="You'll keep access until the end of the current period. You can resubscribe anytime."
        confirmLabel="Cancel subscription"
        loading={busy}
        onConfirm={onCancelConfirm}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}

function UsageCard({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const unlimited = isUnlimited(limit);
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
        {used}
        <span className="text-sm font-normal text-gray-500">
          {" "}
          / {unlimited ? "∞" : limit}
        </span>
      </p>
      {!unlimited && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className={`h-full ${
              pct >= 100
                ? "bg-error-500"
                : pct >= 80
                ? "bg-warning-500"
                : "bg-brand-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}
