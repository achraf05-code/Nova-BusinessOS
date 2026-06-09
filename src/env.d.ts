/**
 * Strongly-typed `process.env` for the Nova BusinessOS app.
 *
 * Anything declared here is **purely a type-level hint** — values still
 * come from the runtime environment. Required variables are validated at
 * boot via `lib/supabase/env.ts`, `lib/stripe.ts`, etc.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare namespace NodeJS {
  interface ProcessEnv {
    // App
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_APP_NAME?: string;

    // Supabase
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;

    // Email (Resend)
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;

    // Stripe
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
    STRIPE_PRICE_STARTER?: string;
    STRIPE_PRICE_BUSINESS?: string;
    STRIPE_PRICE_ENTERPRISE?: string;

    // AI CFO
    OPENAI_API_KEY?: string;
  }
}

export {};
