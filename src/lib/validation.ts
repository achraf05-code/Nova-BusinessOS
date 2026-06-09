/**
 * Lightweight zod schemas for every Sprint 1 mutation. Centralizing them
 * keeps validation rules in one place and lets server actions return
 * field-level error maps to the forms.
 */
import { z } from "zod";

const trimmed = z.string().trim();
const email = trimmed.email("Enter a valid email").or(trimmed.length(0));
const optionalText = trimmed.max(2000).optional().or(z.literal(""));
const numberCoerce = z
  .union([z.string(), z.number()])
  .transform((v) => (v === "" || v == null ? 0 : Number(v)));

export const contactSchema = z.object({
  full_name: trimmed.min(1, "Name is required").max(120),
  email: email.optional().or(z.literal("")),
  phone: optionalText,
  company_name: optionalText,
  title: optionalText,
  notes: optionalText,
});
export type ContactInput = z.infer<typeof contactSchema>;

export const dealSchema = z.object({
  title: trimmed.min(1, "Title is required").max(160),
  contact_id: z.string().uuid().or(z.literal("")).optional(),
  value: numberCoerce.pipe(z.number().min(0)),
  probability: numberCoerce.pipe(z.number().min(0).max(100)),
  stage: z.enum([
    "lead",
    "contacted",
    "meeting",
    "proposal",
    "won",
    "lost",
  ]),
  expected_close: trimmed.optional().or(z.literal("")),
});
export type DealInput = z.infer<typeof dealSchema>;

export const projectSchema = z.object({
  name: trimmed.min(1, "Name is required").max(160),
  description: optionalText,
  client_id: z.string().uuid().or(z.literal("")).optional(),
  budget: numberCoerce.pipe(z.number().min(0)).optional(),
  start_date: trimmed.optional().or(z.literal("")),
  due_date: trimmed.optional().or(z.literal("")),
  status: z
    .enum(["planning", "in_progress", "on_hold", "completed", "cancelled"])
    .default("planning"),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const taskSchema = z.object({
  title: trimmed.min(1, "Title is required").max(200),
  description: optionalText,
  project_id: z.string().uuid().or(z.literal("")).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z
    .enum(["todo", "in_progress", "in_review", "done"])
    .default("todo"),
  assigned_to: z.string().uuid().or(z.literal("")).optional(),
  due_date: trimmed.optional().or(z.literal("")),
});
export type TaskInput = z.infer<typeof taskSchema>;

export const invoiceItemSchema = z.object({
  description: trimmed.min(1, "Description is required"),
  quantity: numberCoerce.pipe(z.number().min(0)),
  unit_price: numberCoerce.pipe(z.number().min(0)),
});
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  number: trimmed.min(1, "Invoice number is required").max(40),
  contact_id: z.string().uuid().or(z.literal("")).optional(),
  client_label: optionalText, // free-text fallback when no contact
  status: z
    .enum(["draft", "sent", "paid", "overdue", "cancelled"])
    .default("draft"),
  issue_date: trimmed.min(1, "Issue date is required"),
  due_date: trimmed.optional().or(z.literal("")),
  tax_rate: numberCoerce.pipe(z.number().min(0).max(100)).optional(),
  notes: optionalText,
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const expenseSchema = z.object({
  vendor: trimmed.min(1, "Vendor is required").max(160),
  category: z.enum([
    "marketing",
    "software",
    "hosting",
    "travel",
    "payroll",
    "operations",
    "other",
  ]),
  amount: numberCoerce.pipe(z.number().min(0)),
  spent_at: trimmed.min(1, "Date is required"),
  notes: optionalText,
  receipt_url: trimmed.optional().or(z.literal("")),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const settingsSchema = z.object({
  name: trimmed.min(1, "Company name is required").max(160),
  industry: optionalText,
  currency: trimmed.min(1, "Currency is required").max(8),
  timezone: trimmed.min(1, "Timezone is required").max(64),
  email: email.optional().or(z.literal("")),
  phone: optionalText,
  address: optionalText,
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export function flatFieldErrors<T>(error: z.ZodError<T>) {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_form";
    if (!fields[path]) fields[path] = issue.message;
  }
  return fields;
}
