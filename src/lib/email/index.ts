/**
 * Provider-agnostic email layer.
 *
 * Picks an implementation based on env:
 *   - `RESEND_API_KEY` → Resend (preferred for Beta)
 *   - otherwise       → in-memory transport (writes to demoStore.emails)
 *
 * All call sites use `sendEmail({ to, subject, react|html, template })`.
 * Templates live in `src/lib/email/templates.ts` and emit branded HTML with
 * inline styles so they render in every email client.
 */

import "server-only";
import { getStore, isoNow, newId, type SentEmail } from "@/lib/demoStore";

export type EmailTemplate =
  | "invitation"
  | "invoice_sent"
  | "invoice_paid"
  | "welcome"
  | "ai_cfo_report";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  template: EmailTemplate;
}

export interface EmailResult {
  ok: boolean;
  id?: string;
  error?: string;
  provider: "resend" | "memory";
}

const FROM =
  process.env.EMAIL_FROM ?? "MaBusinessOS <hello@mabusinessos.com>";

export async function sendEmail(input: SendEmailInput): Promise<EmailResult> {
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const client = new Resend(process.env.RESEND_API_KEY);
      const res = await client.emails.send({
        from: FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
      });
      if (res.error) {
        return { ok: false, error: res.error.message, provider: "resend" };
      }
      return { ok: true, id: res.data?.id, provider: "resend" };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "send_failed",
        provider: "resend",
      };
    }
  }

  // Memory transport — the entire delivery is recorded in the demo store
  // so it's visible from /dashboard/system. This keeps demos and CI green
  // without leaking real outbound traffic.
  const sent: SentEmail = {
    id: newId(),
    to: input.to,
    subject: input.subject,
    html: input.html,
    template: input.template,
    created_at: isoNow(),
  };
  getStore().emails.unshift(sent);
  return { ok: true, id: sent.id, provider: "memory" };
}

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}
