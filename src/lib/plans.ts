import type { SubscriptionPlan } from "@/types/database";

export interface PlanLimits {
  /** -1 = unlimited */
  max_users: number;
  max_contacts: number;
  max_projects: number;
  /** Display copy */
  description: string;
  /** Headline price (USD / month) */
  price: number;
  /** Stripe price id env var key */
  stripeEnvKey: string;
  features: string[];
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  starter: {
    max_users: 5,
    max_contacts: 100,
    max_projects: 20,
    description: "For solo founders and small teams getting started.",
    price: 0,
    stripeEnvKey: "STRIPE_PRICE_STARTER",
    features: [
      "5 team members",
      "100 contacts",
      "20 projects",
      "AI CFO weekly digest",
      "CSV exports",
    ],
  },
  business: {
    max_users: 25,
    max_contacts: 2000,
    max_projects: -1,
    description: "Scaling teams running real revenue, expenses and pipeline.",
    price: 49,
    stripeEnvKey: "STRIPE_PRICE_BUSINESS",
    features: [
      "25 team members",
      "2,000 contacts",
      "Unlimited projects",
      "Unlimited invoices + PDF",
      "Excel + PDF reports",
      "Priority support",
    ],
  },
  enterprise: {
    max_users: -1,
    max_contacts: -1,
    max_projects: -1,
    description: "Multi-entity companies that need governance and SLAs.",
    price: 149,
    stripeEnvKey: "STRIPE_PRICE_ENTERPRISE",
    features: [
      "Unlimited team members",
      "Unlimited contacts and projects",
      "Advanced RBAC + audit log",
      "Custom SLAs",
      "SSO & SCIM (early access)",
      "Dedicated success manager",
    ],
  },
};

export function planLabel(plan: SubscriptionPlan) {
  return plan[0].toUpperCase() + plan.slice(1);
}

export function isUnlimited(value: number) {
  return value < 0;
}
