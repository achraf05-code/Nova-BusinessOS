"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow } from "@/lib/demoStore";
import { withAction, actionOk, actionFail } from "@/lib/actions";
import { flatFieldErrors, settingsSchema } from "@/lib/validation";
import { logActivity } from "@/lib/activity";

const PATHS = ["/dashboard/settings", "/dashboard"];

export async function updateCompanySettingsAction(
  form: Record<string, unknown>
) {
  return withAction(
    { revalidate: PATHS, requiredRole: "admin" },
    async (ctx) => {
      const parsed = settingsSchema.safeParse(form);
      if (!parsed.success) {
        return actionFail(
          "Invalid company settings",
          flatFieldErrors(parsed.error)
        );
      }
      const v = parsed.data;
      const patch = {
        name: v.name,
        industry: v.industry || null,
        currency: v.currency,
        timezone: v.timezone,
      };

      if (supabaseConfigured) {
        const supabase = await createClient();
        const { error } = await supabase
          .from("companies")
          .update(patch as never)
          .eq("id", ctx.company.id);
        if (error) return actionFail(error.message);
      } else {
        const store = getStore();
        Object.assign(store.company, patch, { updated_at: isoNow() });
      }

      await logActivity({
        companyId: ctx.company.id,
        actorId: ctx.user.id,
        action: "company.settings_updated",
        entityType: "company",
        entityId: ctx.company.id,
        metadata: {
          name: v.name,
          email: v.email,
          phone: v.phone,
          address: v.address,
        },
      });
      return actionOk({ id: ctx.company.id });
    }
  );
}
