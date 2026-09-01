"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { OmzetHarian } from "@/lib/api/contracts";
import { formatDate, rupiah } from "@/lib/formatters";
import { EmptyState } from "@/components/ui/states";

export function RevenueChart({ rows }: { rows: OmzetHarian[] }) {
  const data = [...rows].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  if (!data.length) return <EmptyState title="Belum ada omzet harian" />;
  return <figure className="revenue-block" aria-labelledby="revenue-chart-title" aria-describedby="revenue-chart-description">
    <div className="chart-panel">
      <div className="chart-heading"><h3 id="revenue-chart-title">Pergerakan omzet harian</h3><p id="revenue-chart-description">Grafik garis pendapatan usaha berdasarkan tanggal pelaporan.</p></div>
      <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><LineChart accessibilityLayer data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}><CartesianGrid stroke="var(--chart-grid)" vertical={false} /><XAxis dataKey="tanggal" tickFormatter={(v) => String(Number(String(v).slice(8, 10)))} tick={{ fontSize: 11, fill: "var(--chart-axis)" }} tickLine={false} axisLine={{ stroke: "var(--chart-grid)" }} minTickGap={22} /><YAxis width={70} tickFormatter={(v) => `${Math.round(v / 1_000_000)} jt`} tick={{ fontSize: 11, fill: "var(--chart-axis)" }} tickLine={false} axisLine={false} /><Tooltip cursor={{ stroke: "var(--chart-crosshair)", strokeWidth: 1 }} labelFormatter={(v) => formatDate(String(v))} formatter={(v) => [rupiah.format(Number(v)), "Omzet"]} contentStyle={{ borderRadius: 8, borderColor: "var(--line)", color: "var(--ink)", background: "var(--surface)" }} /><Line type="monotone" dataKey="pendapatan" stroke="var(--chart-series)" strokeWidth={2} dot={data.length <= 12 ? { r: 4, fill: "var(--chart-series)", stroke: "var(--surface)", strokeWidth: 2 } : false} activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }} /></LineChart></ResponsiveContainer></div>
    </div>
    <div className="table-wrap compact"><table><caption>Data omzet harian</caption><thead><tr><th>Tanggal</th><th className="numeric-cell">Omzet</th><th>Keterangan</th></tr></thead><tbody>{data.map((row) => <tr key={row.id}><td>{formatDate(row.tanggal)}</td><td className="numeric-cell">{rupiah.format(row.pendapatan)}</td><td>{row.isLibur ? "Libur" : "Operasional"}</td></tr>)}</tbody></table></div>
  </figure>;
}
