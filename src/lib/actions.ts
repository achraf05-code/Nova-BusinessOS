/**
 * Helpers shared by every server action in `src/app/dashboard/.../actions.ts`.
 *
 * - `withAction()` wraps a handler with: tenant resolution, RBAC guard, error
 *   serialization, and revalidation of dependent paths.
 * - `actionOk()` / `actionFail()` build the typed response shape consumed by
 *   client components.
 */

import "server-only";
import { revalidatePath } from "next/cache";
import { requireActiveCompany } from "@/lib/tenant";
import type { CompanyRole } from "@/types/database";
import { hasRole } from "@/lib/tenant";

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; fields?: Record<string, string> };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}
export function actionFail(
  error: string,
  fields?: Record<string, string>
): ActionResult<never> {
  return { ok: false, error, fields };
}

export interface ActionContext {
  user: { id: string; email: string | null };
  company: { id: string; name: string; currency: string };
  role: CompanyRole;
  revalidate: (path: string) => void;
}

export async function withAction<T>(
  options: {
    requiredRole?: CompanyRole;
    revalidate?: string[];
  },
  fn: (ctx: ActionContext) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  let ctx: Awaited<ReturnType<typeof requireActiveCompany>>;
  try {
    ctx = await requireActiveCompany();
  } catch {
    return actionFail("You must be signed in with an active workspace.");
  }

  if (options.requiredRole && !hasRole(ctx.role, options.requiredRole)) {
    return actionFail(
      `This action requires the ${options.requiredRole} role or higher.`
    );
  }

  try {
    const result = await fn({
      user: ctx.user,
      company: {
        id: ctx.company.id,
        name: ctx.company.name,
        currency: ctx.company.currency,
      },
      role: ctx.role,
      revalidate: revalidatePath,
    });
    if (result.ok) {
      for (const path of options.revalidate ?? []) {
        revalidatePath(path);
      }
    }
    return result;
  } catch (err) {
    return actionFail(
      err instanceof Error ? err.message : "Something went wrong."
    );
  }
}
