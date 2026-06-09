import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { supabaseConfigured } from "./env";

/**
 * Server-side Supabase client. Reads/writes auth cookies for SSR.
 * Use in Server Components, Server Actions, and Route Handlers.
 *
 * When Supabase is not configured a stub client is returned that
 * resolves to "no user / no rows" — keeping the UI fully demoable.
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (!supabaseConfigured) {
    return makeStubClient();
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot set cookies.
          }
        },
      },
    }
  );
}

/**
 * Service-role client. Server only. Bypasses RLS — use sparingly
 * (e.g. webhooks, scheduled jobs, admin tooling).
 */
export function createAdminClient() {
  if (!supabaseConfigured) {
    return makeStubClient();
  }
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/* -------------------------------------------------------------------- */
/* Stub client                                                          */
/* -------------------------------------------------------------------- */

type Resolved<T> = Promise<{ data: T; error: null }>;
function makeStubClient() {
  const queryStub = {
    select: () => queryStub,
    eq: () => queryStub,
    in: () => queryStub,
    order: () => queryStub,
    limit: () => queryStub,
    range: () => queryStub,
    single: (): Resolved<null> => Promise.resolve({ data: null, error: null }),
    maybeSingle: (): Resolved<null> =>
      Promise.resolve({ data: null, error: null }),
    insert: () => queryStub,
    update: () => queryStub,
    delete: () => queryStub,
    upsert: () => queryStub,
    then: (
      onfulfilled?: (
        value: { data: unknown[]; error: null }
      ) => unknown
    ) =>
      Promise.resolve({ data: [], error: null }).then(onfulfilled),
  };

  const stub = {
    from: () => queryStub,
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
      getSession: async () => ({
        data: { session: null },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({
        error: { message: "Supabase is not configured." },
        data: null,
      }),
      signUp: async () => ({
        error: { message: "Supabase is not configured." },
        data: null,
      }),
      resetPasswordForEmail: async () => ({
        error: { message: "Supabase is not configured." },
        data: null,
      }),
    },
  };

  return stub as unknown as ReturnType<typeof createServerClient<Database>>;
}
