"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck2, CircleDollarSign, Clock3, FileCheck2 } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { dashboardSptpdDetailSchema, historySchema } from "@/lib/api/contracts";
import { actionLabel, roleLabels } from "@/lib/api/labels";
import { apiFetch } from "@/lib/api/browser";
import { queryKeys } from "@/lib/api/query-keys";
import { getAllowedActions } from "@/lib/auth/permissions";
import { formatDate, formatTaxPeriod, rupiah } from "@/lib/formatters";
import { useStaff } from "@/providers/auth-provider";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState, LoadingState } from "@/components/ui/states";
import { StatusBadge } from "@/components/ui/status-badge";
import { MonthlyRevenueAnalysis } from "./monthly-revenue-analysis";
import { DailyRevenueDialog } from "./daily-revenue-dialog";
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
  const dailyRows = item.omzetHarian.filter((row) => row.pendapatan > 0 || row.isLibur);
  const reportedDays = item.omzetHarian.filter((row) => row.pendapatan > 0).length;
  const latestHistory = history.data?.slice(-3).reverse() ?? [];
  return <>
    <div className="detail-page-head">
      <Link href="/sptpd" className="back-link"><ArrowLeft size={16} /> Daftar SPTPD</Link>
      <PageHeader eyebrow={`${item.jenisOp} · ${formatTaxPeriod(item.masaPajak)}`} title={isRestaurantVerification ? "Verifikasi laporan omzet" : item.namaOp} description={isRestaurantVerification ? `${item.namaOp} · ${item.noSptpd || "SPTPD belum diterbitkan"}` : item.noSptpd ? `SPTPD ${item.noSptpd}` : "Nomor SPTPD resmi belum diterbitkan"} actions={<div className="badge-stack horizontal"><StatusBadge value={item.status} /><StatusBadge value={item.workflowStage} kind="stage" /></div>} />
    </div>
    {item.revisionNote && <section className="revision-banner"><strong>Catatan revisi terakhir</strong><p>{item.revisionNote}</p></section>}
    <main className="verification-cockpit">
      <MonthlyRevenueAnalysis history={item.omzetBulanan} current={item.dasarPengenaan} currentPeriod={item.masaPajak} />
      <aside className="decision-rail" aria-label="Ringkasan keputusan">
        <section className="decision-block tax"><header><CircleDollarSign /><span>Nilai penetapan</span></header><strong>{rupiah.format(item.pajakTerutang)}</strong><dl><Info label="Omzet dilaporkan" value={rupiah.format(item.dasarPengenaan)} /><Info label="Tarif" value={`${item.tarifPersen}%`} />{item.denda > 0 && <Info label="Denda" value={rupiah.format(item.denda)} />}</dl></section>
        <section className="decision-block daily"><header><CalendarCheck2 /><span>Kelengkapan harian</span></header><div className="daily-completeness"><strong>{reportedDays}</strong><span>dari {item.omzetHarian.length} hari beromzet</span></div><p>{dailyRows.length ? `${dailyRows.length} hari memiliki omzet atau ditandai libur.` : "Belum ada omzet harian yang dilaporkan."}</p><DailyRevenueDialog rows={item.omzetHarian} /></section>
        <section className="decision-block identity"><header><FileCheck2 /><span>Referensi laporan</span></header><dl><Info label="NPWPD" value={item.npwpd} /><Info label="Nomor objek" value={item.noOp} /><Info label="Alamat" value={item.alamatOp} /></dl></section>
        <section className="decision-block process"><header><Clock3 /><span>Jejak terakhir</span></header>{history.isPending ? <LoadingState /> : history.isError ? <button className="text-action" onClick={() => history.refetch()}>Muat ulang riwayat</button> : <ol>{latestHistory.map((event) => <li key={event.id}><span /><div><strong>{actionLabel(event.action)}</strong><small>{event.actorRole && event.actorRole in roleLabels ? roleLabels[event.actorRole as keyof typeof roleLabels] : event.actorType} · {formatDate(event.createdAt, true)} WITA</small></div></li>)}</ol>}</section>
      </aside>
    </main>
    {actions.length > 0 && <section className="action-bar verification-actions compact" id="verification-panel"><div><strong>{actions.includes("kabid-approve") ? "Keputusan Kepala Bidang" : "Pemeriksaan awal"}</strong><p>{actions.includes("kabid-approve") ? "Setujui untuk menerbitkan SPTPD dan ID billing melalui SIMPAKDU." : "Teruskan laporan yang sesuai atau kembalikan dengan catatan revisi."}</p></div><div>{actions.map((action) => <WorkflowDialog key={action} action={action} sptpdId={id} identity={identity} />)}</div></section>}
    {actions.length === 0 && item.noVa && <section className="settlement-inline"><span>ID billing <strong>{item.noVa}</strong></span><span>Total <strong>{rupiah.format(item.totalTagihan)}</strong></span></section>}
  </>;
}

function Info({ label, value, wide }: { label: string; value?: string; wide?: boolean }) { return <div className={wide ? "wide" : ""}><dt>{label}</dt><dd>{value || "—"}</dd></div>; }
