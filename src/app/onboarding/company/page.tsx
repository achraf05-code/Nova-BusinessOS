import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/tenant";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import NovaLogo from "@/components/brand/NovaLogo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create your company",
  description: "Set up your first Nova BusinessOS workspace.",
};

async function createCompanyAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const currency = String(formData.get("currency") ?? "USD").trim() || "USD";
  if (!name) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) + "-" + Math.random().toString(36).slice(2, 6);

  const { data, error } = await supabase
    .from("companies")
    .insert({
      owner_id: user.id,
      name,
      slug,
      industry,
      currency,
    } as never)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create company");
  }

  const company = data as { id: string };
  const c = await cookies();
  c.set(ACTIVE_COMPANY_COOKIE, company.id, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/dashboard");
}

export default async function CreateCompanyPage() {
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

          <form action={createCompanyAction} className="mt-6 space-y-5">
            <div>
              <Label>Company name</Label>
              <Input name="name" placeholder="Acme Inc." />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>Industry (optional)</Label>
                <Input name="industry" placeholder="SaaS, Agency, …" />
              </div>
              <div>
                <Label>Currency</Label>
                <Input name="currency" defaultValue="USD" />
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
