"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, CalendarDays, CreditCard, Landmark, MapPin, ReceiptText } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { dashboardSptpdDetailSchema, historySchema } from "@/lib/api/contracts";
import { actionLabel, enumLabel, roleLabels, stageLabels, statusLabels } from "@/lib/api/labels";
import { apiFetch } from "@/lib/api/browser";
import { queryKeys } from "@/lib/api/query-keys";
import { getAllowedActions } from "@/lib/auth/permissions";
import { formatDate, formatTaxPeriod, rupiah } from "@/lib/formatters";
import { useStaff } from "@/providers/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { RevenueChart } from "./revenue-chart";
import { MonthlyRevenueAnalysis } from "./monthly-revenue-analysis";
import { WorkflowDialog } from "./workflow-dialog";

export function SptpdDetailView({ id }: { id: string }) {
  const staff = useStaff();
  const detail = useQuery({ queryKey: queryKeys.sptpdDetail(id), queryFn: async () => dashboardSptpdDetailSchema.parse((await apiFetch<unknown>(`/api/pbjt/sptpd/${id}`)).data) });
  const history = useQuery({ queryKey: queryKeys.sptpdHistory(id), queryFn: async () => z.array(historySchema).parse((await apiFetch<unknown>(`/api/pbjt/sptpd/${id}/history`)).data) });
  if (detail.isPending) return <LoadingState label="Memuat detail SPTPD…" />;
  if (detail.isError || !detail.data) return <ErrorState retry={() => detail.refetch()} />;
  const item = detail.data;
  const actions = getAllowedActions(staff.role, item.status, item.workflowStage);
  const isRestaurantVerification = item.kdPajak === "02" && actions.length > 0;
  const identity = item.noSptpd || item.namaOp;
  return <>
    <Link href="/sptpd" className="back-link"><ArrowLeft size={17} /> Kembali ke daftar</Link>
    <PageHeader eyebrow={`${item.jenisOp} · ${formatTaxPeriod(item.masaPajak)}`} title={isRestaurantVerification ? "Verifikasi laporan omzet" : item.namaOp} description={isRestaurantVerification ? `${item.namaOp} · ${item.noSptpd || "SPTPD belum diterbitkan"}` : item.noSptpd ? `SPTPD ${item.noSptpd}` : "Nomor SPTPD resmi belum diterbitkan"} actions={<div className="badge-stack horizontal"><StatusBadge value={item.status} /><StatusBadge value={item.workflowStage} kind="stage" /></div>} />
    {item.revisionNote && <section className="revision-banner"><strong>Catatan revisi terakhir</strong><p>{item.revisionNote}</p></section>}
    <MonthlyRevenueAnalysis history={item.omzetBulanan} current={item.dasarPengenaan} currentPeriod={item.masaPajak} />
    {actions.length > 0 && <section className="action-bar verification-actions" id="verification-panel"><div><strong>Tindakan verifikasi</strong><p>{actions.includes("kabid-approve") ? "Persetujuan akhir akan memproses SPTPD resmi dan membuat VA/ID billing melalui SIMPAKDU." : "Periksa pola omzet dan data laporan sebelum meneruskan ke Kepala Bidang."}</p></div><div>{actions.map((action) => <WorkflowDialog key={action} action={action} sptpdId={id} identity={identity} />)}</div></section>}
    <div className="detail-grid">
      <section className="detail-card span-2"><div className="section-title"><Building2 /><div><h2>Objek pajak</h2><p>Identitas usaha dan kepemilikan laporan.</p></div></div><dl className="info-grid"><Info label="NPWPD" value={item.npwpd} /><Info label="Nomor objek pajak" value={item.noOp} /><Info label="Jenis pajak" value={item.jenisOp} /><Info label="Masa pajak" value={formatTaxPeriod(item.masaPajak)} /><Info label="Alamat" value={item.alamatOp} wide /></dl></section>
      <section className="detail-card"><div className="section-title"><ReceiptText /><div><h2>Perhitungan pajak</h2><p>Nilai laporan periode ini.</p></div></div><dl className="money-list"><Info label="Dasar pengenaan" value={rupiah.format(item.dasarPengenaan)} /><Info label={`Tarif (${item.tarifPersen}%)`} value={rupiah.format(item.pajakTerutang)} /><Info label="Denda" value={rupiah.format(item.denda)} /><Info label="Diskon" value={rupiah.format(item.discount)} /><div className="money-total"><dt>Total tagihan</dt><dd>{rupiah.format(item.totalTagihan)}</dd></div></dl></section>
      <section className="detail-card"><div className="section-title"><CreditCard /><div><h2>Pembayaran</h2><p>Virtual account dan settlement.</p></div></div><dl className="money-list"><Info label="Nomor VA" value={item.noVa ?? "Belum tersedia"} /><Info label="Berlaku hingga" value={formatDate(item.vaExpiredAt, true)} /><Info label="Dibayar pada" value={formatDate(item.paidAt, true)} /><Info label="Referensi settlement" value={item.settlementRef ?? "—"} /></dl></section>
      <section className="detail-card span-2"><div className="section-title"><Landmark /><div><h2>Sinkronisasi SIMPAKDU</h2><p>Status integrasi laporan dengan sistem Bapenda.</p></div></div><div className="sync-status"><div><small>Status sinkronisasi</small><strong>{item.simpakduSyncStatus.replaceAll("_", " ")}</strong></div>{item.simpakduSyncError && <p>Proses terakhir belum selesai. Gunakan retry bila tahap mengizinkan.</p>}</div></section>
      <section className="detail-card span-2"><div className="section-title"><CalendarDays /><div><h2>Omzet harian</h2><p>Rincian pendapatan yang dilaporkan wajib pajak.</p></div></div><RevenueChart rows={item.omzetHarian} /></section>
      <section className="detail-card span-2"><div className="section-title"><MapPin /><div><h2>Riwayat proses</h2><p>Jejak transisi dan tindakan pada laporan.</p></div></div>{history.isPending ? <LoadingState /> : history.isError ? <ErrorState retry={() => history.refetch()} /> : !history.data?.length ? <EmptyState title="Belum ada riwayat" /> : <ol className="timeline">{history.data.map((event) => <li key={event.id}><span className="timeline-dot" /><div className="timeline-content"><div><strong>{actionLabel(event.action)}</strong><time>{formatDate(event.createdAt, true)} WITA</time></div>{(event.fromStatus || event.toStatus) && <p>{event.fromStatus ? enumLabel(event.fromStatus, statusLabels) : "—"} → {event.toStatus ? enumLabel(event.toStatus, statusLabels) : "—"}</p>}{(event.fromStage || event.toStage) && <small>{event.fromStage ? enumLabel(event.fromStage, stageLabels) : "—"} → {event.toStage ? enumLabel(event.toStage, stageLabels) : "—"}</small>}<small>{event.actorRole && event.actorRole in roleLabels ? roleLabels[event.actorRole as keyof typeof roleLabels] : event.actorType}</small>{event.note && <blockquote>{event.note}</blockquote>}</div></li>)}</ol>}</section>
    </div>
  </>;
}

function Info({ label, value, wide }: { label: string; value?: string; wide?: boolean }) { return <div className={wide ? "wide" : ""}><dt>{label}</dt><dd>{value || "—"}</dd></div>; }
