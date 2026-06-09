"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { getStore, isoNow, newId } from "@/lib/demoStore";
import { withAction, actionOk, actionFail } from "@/lib/actions";
import { expenseSchema, flatFieldErrors } from "@/lib/validation";
import { logActivity } from "@/lib/activity";
import type { Expense } from "@/types/database";

const PATHS = ["/dashboard/expenses", "/dashboard/accounting", "/dashboard"];

export async function createExpenseAction(form: Record<string, unknown>) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const parsed = expenseSchema.safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid expense data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const row = {
      company_id: ctx.company.id,
      category: v.category,
      vendor: v.vendor,
      amount: v.amount,
      currency: ctx.company.currency,
      spent_at: v.spent_at,
      receipt_url: v.receipt_url || null,
      notes: v.notes || null,
      created_by: ctx.user.id,
    };

    let expense: Expense;
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("expenses")
        .insert(row as never)
        .select("*")
        .single();
      if (error || !data) return actionFail(error?.message ?? "Insert failed");
      expense = data as Expense;
    } else {
      expense = {
        id: newId(),
        ...row,
        created_at: isoNow(),
      } as Expense;
      getStore().expenses.unshift(expense);
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "expense.created",
      entityType: "expense",
      entityId: expense.id,
      metadata: { vendor: expense.vendor, amount: expense.amount },
    });
    return actionOk(expense);
  });
}

export async function updateExpenseAction(
  id: string,
  form: Record<string, unknown>
) {
  return withAction({ revalidate: PATHS }, async (ctx) => {
    const parsed = expenseSchema.partial().safeParse(form);
    if (!parsed.success) {
      return actionFail("Invalid expense data", flatFieldErrors(parsed.error));
    }
    const v = parsed.data;
    const patch: Record<string, unknown> = {};
    if (v.category !== undefined) patch.category = v.category;
    if (v.vendor !== undefined) patch.vendor = v.vendor;
    if (v.amount !== undefined) patch.amount = v.amount;
    if (v.spent_at !== undefined) patch.spent_at = v.spent_at;
    if (v.notes !== undefined) patch.notes = v.notes || null;
    if (v.receipt_url !== undefined) patch.receipt_url = v.receipt_url || null;

    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("expenses")
        .update(patch as never)
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const existing = store.expenses.find(
        (e) => e.id === id && e.company_id === ctx.company.id
      );
      if (!existing) return actionFail("Expense not found");
      Object.assign(existing, patch);
    }

    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "expense.updated",
      entityType: "expense",
      entityId: id,
    });
    return actionOk({ id });
  });
}

export async function deleteExpenseAction(id: string) {
  return withAction({ revalidate: PATHS, requiredRole: "manager" }, async (ctx) => {
    if (supabaseConfigured) {
      const supabase = await createClient();
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("company_id", ctx.company.id);
      if (error) return actionFail(error.message);
    } else {
      const store = getStore();
      const before = store.expenses.length;
      store.expenses = store.expenses.filter(
        (e) => !(e.id === id && e.company_id === ctx.company.id)
      );
      if (store.expenses.length === before) return actionFail("Expense not found");
    }
    await logActivity({
      companyId: ctx.company.id,
      actorId: ctx.user.id,
      action: "expense.deleted",
      entityType: "expense",
      entityId: id,
    });
    return actionOk({ id });
  });
}
