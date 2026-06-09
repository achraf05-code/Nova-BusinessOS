/**
 * Lightweight formatting helpers shared across modules.
 */

export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
  locale = "en-US"
) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(value: number | null | undefined, locale = "en-US") {
  return new Intl.NumberFormat(locale).format(Number(value ?? 0));
}

export function formatDate(
  value: string | Date | null | undefined,
  locale = "en-US"
) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(
  value: string | Date | null | undefined,
  locale = "en-US"
) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function percent(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}
