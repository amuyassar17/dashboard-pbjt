import type { OmzetBulanan } from "@/lib/api/contracts";

export type RevenueTrendStatus = "NORMAL" | "ABOVE" | "BELOW" | "INSUFFICIENT";

export type RevenueAnalysis = {
  baseline: OmzetBulanan[];
  mean: number | null;
  lower: number | null;
  upper: number | null;
  changePercent: number | null;
  status: RevenueTrendStatus;
};

export function analyzeMonthlyRevenue(history: OmzetBulanan[], current: number): RevenueAnalysis {
  const baseline = [...history].sort((a, b) => a.masaPajak.localeCompare(b.masaPajak)).slice(-6);
  const previous = baseline.at(-1)?.omzet ?? null;
  const changePercent = previous && previous !== 0 ? ((current - previous) / previous) * 100 : null;

  if (baseline.length < 3) {
    return { baseline, mean: null, lower: null, upper: null, changePercent, status: "INSUFFICIENT" };
  }

  const mean = baseline.reduce((sum, item) => sum + item.omzet, 0) / baseline.length;
  const variance = baseline.reduce((sum, item) => sum + (item.omzet - mean) ** 2, 0) / baseline.length;
  const deviation = Math.sqrt(variance);
  const lower = Math.max(0, mean - 2 * deviation);
  const upper = mean + 2 * deviation;
  const status: RevenueTrendStatus = current > upper ? "ABOVE" : current < lower ? "BELOW" : "NORMAL";

  return { baseline, mean, lower, upper, changePercent, status };
}
