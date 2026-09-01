"use client";

import { AlertCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, Minus } from "lucide-react";
import { CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OmzetBulanan } from "@/lib/api/contracts";
import { formatTaxPeriod, rupiah } from "@/lib/formatters";
import { analyzeMonthlyRevenue, type RevenueTrendStatus } from "@/lib/revenue-analysis";

const statusCopy: Record<RevenueTrendStatus, { label: string; description: string; Icon: typeof CheckCircle2; tone: string }> = {
  NORMAL: { label: "Dalam batas historis", description: "Omzet bulan berjalan masih berada di dalam rentang toleransi enam bulan terakhir.", Icon: CheckCircle2, tone: "normal" },
  ABOVE: { label: "Di atas batas atas", description: "Omzet bulan berjalan melampaui pola historis dan perlu dikonfirmasi sebelum disetujui.", Icon: ArrowUpRight, tone: "attention" },
  BELOW: { label: "Di bawah batas bawah", description: "Omzet bulan berjalan turun di bawah pola historis dan perlu diperiksa lebih lanjut.", Icon: ArrowDownRight, tone: "warning" },
  INSUFFICIENT: { label: "Histori belum cukup", description: "Minimal tiga periode historis diperlukan untuk menentukan batas toleransi.", Icon: AlertCircle, tone: "neutral" },
};

export function MonthlyRevenueAnalysis({ history, current, currentPeriod }: { history: OmzetBulanan[]; current: number; currentPeriod: string }) {
  const analysis = analyzeMonthlyRevenue(history, current);
  const status = statusCopy[analysis.status];
  const StatusIcon = status.Icon;
  const chartData = [...history, { masaPajak: currentPeriod, omzet: current, current: true }]
    .sort((a, b) => a.masaPajak.localeCompare(b.masaPajak))
    .slice(-13);

  return <section className="revenue-analysis" aria-labelledby="revenue-analysis-title">
    <header className="revenue-analysis-head">
      <div><p>Analisis verifikasi</p><h2 id="revenue-analysis-title">Pola omzet bulanan</h2><span>Perbandingan laporan berjalan dengan histori objek pajak yang sama.</span></div>
      <span className={`trend-status trend-${status.tone}`}><StatusIcon aria-hidden />{status.label}</span>
    </header>

    <div className="revenue-analysis-layout">
      <div className="revenue-analysis-summary">
        <article className="revenue-current"><span>Omzet bulan ini</span><strong>{rupiah.format(current)}</strong><small>{analysis.changePercent === null ? "Belum ada pembanding bulan sebelumnya" : <><TrendIcon value={analysis.changePercent} /> {Math.abs(analysis.changePercent).toLocaleString("id-ID", { maximumFractionDigits: 1 })}% dari bulan sebelumnya</>}</small></article>
        <dl className="revenue-band-values">
          <div><dt>Rata-rata historis</dt><dd>{analysis.mean === null ? "—" : rupiah.format(analysis.mean)}</dd></div>
          <div><dt>Batas atas</dt><dd>{analysis.upper === null ? "—" : rupiah.format(analysis.upper)}</dd></div>
          <div><dt>Batas bawah</dt><dd>{analysis.lower === null ? "—" : rupiah.format(analysis.lower)}</dd></div>
        </dl>
        <div className={`trend-explanation trend-${status.tone}`}><StatusIcon aria-hidden /><p><strong>{status.label}</strong>{status.description}</p></div>
      </div>

      <figure className="monthly-chart" aria-label="Grafik histori omzet bulanan dan batas toleransi">
        <figcaption><strong>Histori hingga 12 bulan</strong><span>Pita berwarna menunjukkan batas bawah dan atas berdasarkan enam periode terakhir.</span></figcaption>
        {chartData.length <= 1 ? <div className="monthly-chart-empty"><AlertCircle /><p>Belum ada histori omzet bulanan untuk objek pajak ini.</p></div> : <div className="monthly-chart-canvas"><ResponsiveContainer width="100%" height="100%"><ComposedChart accessibilityLayer data={chartData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="masaPajak" tickFormatter={shortPeriod} tick={{ fontSize: 10, fill: "var(--chart-axis)" }} tickLine={false} axisLine={{ stroke: "var(--chart-grid)" }} minTickGap={18} /><YAxis width={68} tickFormatter={compactRupiah} tick={{ fontSize: 10, fill: "var(--chart-axis)" }} tickLine={false} axisLine={false} />{analysis.lower !== null && analysis.upper !== null && <ReferenceArea y1={analysis.lower} y2={analysis.upper} fill="var(--blue-soft)" fillOpacity={.72} strokeOpacity={0} />}{analysis.mean !== null && <ReferenceLine y={analysis.mean} stroke="var(--blue)" strokeDasharray="4 4" strokeOpacity={.48} />}<Tooltip labelFormatter={(value) => formatTaxPeriod(String(value))} formatter={(value) => [rupiah.format(Number(value)), "Omzet"]} contentStyle={{ borderRadius: 8, borderColor: "var(--line)", color: "var(--ink)", background: "var(--surface)", fontSize: 11 }} /><Line type="monotone" dataKey="omzet" stroke="var(--chart-series)" strokeWidth={2.25} dot={{ r: 3, fill: "var(--surface)", stroke: "var(--chart-series)", strokeWidth: 2 }} activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} /></ComposedChart></ResponsiveContainer></div>}
      </figure>
    </div>
  </section>;
}

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <ArrowUpRight aria-hidden />;
  if (value < 0) return <ArrowDownRight aria-hidden />;
  return <Minus aria-hidden />;
}

function shortPeriod(value: string) {
  const [year, month] = value.split("-");
  const label = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(new Date(Number(year), Number(month) - 1, 1));
  return `${label} '${year.slice(2)}`;
}

function compactRupiah(value: number) {
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (Math.abs(value) >= 1_000_000) return `${Math.round(value / 1_000_000)} jt`;
  return `${Math.round(value / 1_000)} rb`;
}
