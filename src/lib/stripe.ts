/**
 * Stripe helpers shared by checkout, customer portal, webhook handler.
 *
 * Stripe is optional: when env keys are missing the helpers throw a
 * controlled `STRIPE_NOT_CONFIGURED` error which the API routes catch and
 * surface as a friendly "billing is not configured" response. This keeps
 * the dashboard usable in demo mode.
 */

import "server-only";
import Stripe from "stripe";
import { PLAN_LIMITS } from "@/lib/plans";
import type { SubscriptionPlan } from "@/types/database";

const STRIPE_API_VERSION = "2024-11-20.acacia";

let cached: Stripe | null = null;
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }
  cached = new Stripe(key, {
    apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
    typescript: true,
  });
  return cached;
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function priceIdForPlan(plan: SubscriptionPlan): string | null {
  const envKey = PLAN_LIMITS[plan].stripeEnvKey;
  return process.env[envKey] ?? null;
}

export function planFromPriceId(priceId: string | null): SubscriptionPlan {
  if (!priceId) return "starter";
  for (const plan of Object.keys(PLAN_LIMITS) as SubscriptionPlan[]) {
    if (process.env[PLAN_LIMITS[plan].stripeEnvKey] === priceId) return plan;
  }
  return "starter";
}
