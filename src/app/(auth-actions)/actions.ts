"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/tenant";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const c = await cookies();
  c.delete(ACTIVE_COMPANY_COOKIE);
  redirect("/login");
}

export async function setActiveCompanyAction(formData: FormData) {
  const id = String(formData.get("company_id") ?? "");
  if (!id) return;
  const c = await cookies();
  c.set(ACTIVE_COMPANY_COOKIE, id, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect("/dashboard");
}
