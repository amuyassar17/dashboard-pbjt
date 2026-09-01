"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, CreditCard, FileText } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api/browser";
import { simpakduHistoryDetailSchema } from "@/lib/api/contracts";
import { queryKeys } from "@/lib/api/query-keys";
import { formatDate, formatTaxPeriod, rupiah } from "@/lib/formatters";
import { MonthlyRevenueAnalysis } from "@/components/sptpd/monthly-revenue-analysis";
import { RevenueChart } from "@/components/sptpd/revenue-chart";
import { ErrorState, LoadingState } from "@/components/ui/states";

const sourceLabels = { LONTARA: "Lontara", PAKINTA: "Pakinta", LEGACY_UNKNOWN: "Sumber lama" } as const;

export function SimpakduHistoryDetailView({ id }: { id: string }) {
  const detail = useQuery({
    queryKey: queryKeys.simpakduHistoryDetail(id),
    queryFn: async () => {
      const payload = await apiFetch<unknown>(`/api/pbjt/simpakdu-history/${encodeURIComponent(id)}`);
      return simpakduHistoryDetailSchema.parse(payload.data);
    },
  });
  if (detail.isPending) return <LoadingState label="Mengambil detail riwayat…" />;
  if (detail.isError || !detail.data) return <ErrorState retry={() => detail.refetch()} />;
  const item = detail.data;
  const priorMonths = item.monthlyTrend.filter((row) => row.masaPajak !== item.masaPajak).map((row) => ({ masaPajak: row.masaPajak, omzet: row.omzet }));
  const dailyRows = item.dailyRevenue.map((row, index) => ({ id: `${item.kdNilaiPajak}-${index}`, sptpdId: item.kdNilaiPajak, tanggal: normalizeDate(row.tanggal), pendapatan: row.omzet, isLibur: row.omzet === 0, createdAt: "", updatedAt: "" }));

  return <>
    <Link href="/history" className="back-link"><ArrowLeft size={17} /> Kembali ke riwayat</Link>
    <header className="archive-detail-head"><div><p className="eyebrow">Arsip SIMPAKDU</p><h1>{item.noSptpd || "Detail SPTPD"}</h1><span>{item.namaOp} · {formatTaxPeriod(item.masaPajak)}</span></div><div className="archive-badges"><span className={`source-badge source-${item.submissionSource.toLowerCase()}`}>{sourceLabels[item.submissionSource]}</span><span className={`payment-state ${item.paymentStatus === "PAID" ? "paid" : "unpaid"}`}>{item.paymentStatus === "PAID" ? "Lunas" : "Belum lunas"}</span></div></header>

    <section className="archive-summary">
      <article><span>Omzet dilaporkan</span><strong>{rupiah.format(item.dasarPengenaan)}</strong><small>Dasar pengenaan periode ini</small></article>
      <article><span>Pajak terutang</span><strong>{rupiah.format(item.pajakTerutang)}</strong><small>Tarif {item.tarifPersen}%</small></article>
      <article><span>Jumlah dibayar</span><strong>{rupiah.format(item.amountPaid)}</strong><small>{item.paymentMethod === "UNKNOWN" ? "Metode belum tercatat" : item.paymentMethod}</small></article>
    </section>

    <MonthlyRevenueAnalysis history={priorMonths} current={item.dasarPengenaan} currentPeriod={item.masaPajak} />

    <section className="detail-grid archive-facts">
      <article className="detail-card"><div className="section-title"><Building2 /><div><h2>Objek pajak</h2><p>Identitas usaha pada SIMPAKDU</p></div></div><dl className="info-grid"><div><dt>NPWPD</dt><dd>{item.npwpd}</dd></div><div><dt>Nomor OP</dt><dd>{item.kdOp}</dd></div><div><dt>Jenis</dt><dd>{item.jenisOp}</dd></div><div className="wide"><dt>Alamat</dt><dd>{item.alamatOp || "—"}</dd></div></dl></article>
      <article className="detail-card"><div className="section-title"><CreditCard /><div><h2>Pembayaran</h2><p>Realisasi dan referensi pembayaran</p></div></div><dl className="info-grid"><div><dt>Status</dt><dd>{item.paymentStatus === "PAID" ? "Lunas" : "Belum lunas"}</dd></div><div><dt>Denda</dt><dd>{rupiah.format(item.denda)}</dd></div><div><dt>Tanggal bayar</dt><dd>{formatLegacyDate(item.paidAt)}</dd></div><div><dt>Referensi</dt><dd>{item.paymentReference || "—"}</dd></div></dl></article>
      <article className="detail-card span-2"><div className="section-title"><FileText /><div><h2>Pemasukan harian</h2><p>Rincian omzet yang tersimpan pada laporan periode ini</p></div></div><RevenueChart rows={dailyRows} /></article>
    </section>
  </>;
}

function normalizeDate(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value.slice(0, 10);
}
function formatLegacyDate(value?: string) { return value ? formatDate(normalizeDate(value)) : "—"; }
