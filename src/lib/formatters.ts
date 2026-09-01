export const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatDate(value?: string | null, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Makassar",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

export function formatTaxPeriod(value: string) {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(
    new Date(Number(year), Number(month) - 1, 1),
  );
}
