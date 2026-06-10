import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  createAdminClient,
  createClient,
} from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/tenant";
import { getStore, isoNow, newId, DEMO } from "@/lib/demoStore";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import NovaLogo from "@/components/brand/NovaLogo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your company",
  description: "Set up your first MaBusinessOS workspace.",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

async function createCompanyAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const currency =
    String(formData.get("currency") ?? "USD").trim().toUpperCase() || "USD";

  if (!name) {
    redirect("/onboarding/company?error=name_required");
  }

  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 48) +
    "-" +
    Math.random().toString(36).slice(2, 6);

  // ---- Demo mode ----
  if (!supabaseConfigured) {
    const store = getStore();
    const id = newId();
    store.company = {
      id,
      owner_id: DEMO.USER_ID,
      name,
      slug,
      logo_url: null,
      industry,
      currency,
      timezone: "UTC",
      created_at: isoNow(),
      updated_at: isoNow(),
    };
    const c = await cookies();
    c.set(ACTIVE_COMPANY_COOKIE, id, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    redirect("/dashboard");
  }

  // ---- Real Supabase ----
  // 1. Verify the user with the SSR-cookie client (so we never trust the
  //    request body for ownership).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/onboarding/company");
  }

  // 2. Insert via the **service-role** client. The user-scoped client may
  //    fail RLS in some Supabase configurations because the JWT context
  //    isn't always present in Server Actions running outside of the
  //    request lifecycle. We've already validated the user above, so this
  //    is safe — `owner_id` is set to the verified `user.id` and the
  //    `ensure_owner_membership` trigger seeds the matching membership row.
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("companies")
    .insert({
      owner_id: user.id,
      name,
      slug,
      industry,
      currency,
    } as never)
    .select("id")
    .single();

  if (error || !data) {
    const code = encodeURIComponent(
      error?.message?.slice(0, 200) ?? "unknown_error"
    );
    redirect(`/onboarding/company?error=${code}`);
  }

  // 3. Belt-and-braces: ensure the owner membership row exists even if
  //    the trigger ever gets dropped or disabled.
  const company = data as { id: string };
  await admin
    .from("company_members")
    .upsert(
      { company_id: company.id, user_id: user.id, role: "owner" } as never,
      { onConflict: "company_id,user_id" } as never
    );

  // 4. Set active-company cookie and redirect.
  const c = await cookies();
  c.set(ACTIVE_COMPANY_COOKIE, company.id, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/dashboard");
}

export default async function CreateCompanyPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-xl">
        <NovaLogo className="text-gray-900 dark:text-white" />
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Create your company
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Each company is its own workspace. You can create more later.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-300">
              {decodeFriendly(error)}
            </div>
          )}

          <form action={createCompanyAction} className="mt-6 space-y-5">
            <div>
              <Label htmlFor="name">Company name</Label>
              <Input id="name" name="name" placeholder="Acme Inc." />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="industry">Industry (optional)</Label>
                <Input id="industry" name="industry" placeholder="SaaS, Agency, …" />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue="USD" />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600"
            >
              Create company
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function decodeFriendly(code: string) {
  if (code === "name_required") return "Please enter a company name.";
  return decodeURIComponent(code);
}
