/**
 * Detects whether Supabase is configured for this deployment. When the
 * required env vars are missing, the helpers in `client.ts`, `server.ts`
 * and `middleware.ts` no-op so the UI keeps rendering against the
 * curated sample dataset in `lib/queries.ts`.
 */
export const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
