/**
 * Inline-styled HTML email templates. Kept here (rather than via React
 * Email) to avoid a heavy build dependency — these are tiny, branded,
 * mobile-friendly, and render across every major client.
 */

import { nova } from "@/config/nova";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? nova.url;
const BRAND = "#465fff";
const BG = "#f7f8fb";
const FG = "#101828";
const MUTED = "#667085";

function shell(title: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;background:${BG};font-family:Inter,'Segoe UI',Arial,sans-serif;color:${FG}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${BG};padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(16,24,40,0.05)">
        <tr><td style="background:${BRAND};padding:18px 28px;color:#fff;font-weight:600;font-size:14px;letter-spacing:.04em;text-transform:uppercase">${escapeHtml(nova.name)}</td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 12px;font-size:20px;color:${FG}">${escapeHtml(title)}</h1>
          ${body}
        </td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid #eef0f3;color:${MUTED};font-size:12px">
          ${escapeHtml(nova.tagline)} · <a href="${APP_URL}" style="color:${BRAND};text-decoration:none">mabusinessos.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:${BRAND};color:#fff;padding:12px 22px;border-radius:8px;font-weight:600;text-decoration:none">${escapeHtml(label)}</a>`;
}

function muted(text: string) {
  return `<p style="margin:12px 0;color:${MUTED};font-size:13px;line-height:1.6">${text}</p>`;
}

function p(text: string) {
  return `<p style="margin:12px 0;color:${FG};font-size:14px;line-height:1.6">${text}</p>`;
}

export function escapeHtml(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export interface InvitationEmailArgs {
  companyName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
}
export function invitationEmail(args: InvitationEmailArgs) {
  const subject = `You're invited to ${args.companyName} on ${nova.name}`;
  const html = shell(
    `Join ${escapeHtml(args.companyName)} on ${escapeHtml(nova.name)}`,
    `
      ${p(`${escapeHtml(args.inviterName)} has invited you to join <strong>${escapeHtml(args.companyName)}</strong> as <strong>${escapeHtml(args.role)}</strong>.`)}
      ${p(button(args.acceptUrl, "Accept invitation"))}
      ${muted(`If the button doesn't work, paste this link in your browser:<br><a href="${args.acceptUrl}" style="color:${BRAND};word-break:break-all">${args.acceptUrl}</a>`)}
      ${muted("This invite expires in 14 days.")}
    `
  );
  return { subject, html };
}

export interface InvoiceSentEmailArgs {
  invoiceNumber: string;
  total: string;
  dueDate: string | null;
  companyName: string;
  invoiceUrl: string;
}
export function invoiceSentEmail(args: InvoiceSentEmailArgs) {
  const subject = `Invoice ${args.invoiceNumber} from ${args.companyName}`;
  const html = shell(
    `Invoice ${escapeHtml(args.invoiceNumber)}`,
    `
      ${p(`<strong>${escapeHtml(args.companyName)}</strong> sent you a new invoice for <strong>${escapeHtml(args.total)}</strong>${args.dueDate ? `, due <strong>${escapeHtml(args.dueDate)}</strong>` : ""}.`)}
      ${p(button(args.invoiceUrl, "View invoice"))}
      ${muted("Reply to this email if you have any questions.")}
    `
  );
  return { subject, html };
}

export interface InvoicePaidEmailArgs {
  invoiceNumber: string;
  total: string;
  companyName: string;
}
export function invoicePaidEmail(args: InvoicePaidEmailArgs) {
  const subject = `Payment received — Invoice ${args.invoiceNumber}`;
  const html = shell(
    `Payment received`,
    `
      ${p(`Thank you. Your payment of <strong>${escapeHtml(args.total)}</strong> for invoice <strong>${escapeHtml(args.invoiceNumber)}</strong> has been recorded.`)}
      ${muted(`This is an automated confirmation from ${escapeHtml(args.companyName)}.`)}
    `
  );
  return { subject, html };
}

export interface WelcomeEmailArgs {
  fullName: string | null;
  companyName: string;
  dashboardUrl: string;
}
export function welcomeEmail(args: WelcomeEmailArgs) {
  const subject = `Welcome to ${args.companyName} on ${nova.name}`;
  const html = shell(
    `Welcome${args.fullName ? `, ${escapeHtml(args.fullName)}` : ""}`,
    `
      ${p(`You're now a member of <strong>${escapeHtml(args.companyName)}</strong>. Sign in to your workspace whenever you're ready.`)}
      ${p(button(args.dashboardUrl, "Open dashboard"))}
      ${muted("Tip: open the AI CFO panel for an instant business briefing.")}
    `
  );
  return { subject, html };
}

export interface AiCfoEmailArgs {
  companyName: string;
  summary: string;
  reportUrl: string;
}
export function aiCfoEmail(args: AiCfoEmailArgs) {
  const subject = `Your weekly AI CFO briefing — ${args.companyName}`;
  const html = shell(
    `Weekly AI CFO briefing`,
    `
      ${p(escapeHtml(args.summary))}
      ${p(button(args.reportUrl, "Open full report"))}
      ${muted("You can disable this digest in Notification preferences.")}
    `
  );
  return { subject, html };
}
