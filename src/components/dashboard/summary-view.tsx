"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, BadgeCheck, Banknote, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { summarySchema } from "@/lib/api/contracts";
import { apiFetch } from "@/lib/api/browser";
import { queryKeys } from "@/lib/api/query-keys";
import { useStaff } from "@/providers/auth-provider";
import { ErrorState, LoadingState } from "@/components/ui/states";

export function SummaryView() {
  const staff = useStaff();
  const summary = useQuery({ queryKey: queryKeys.summary, queryFn: async () => summarySchema.parse((await apiFetch<unknown>("/api/pbjt/summary")).data) });
  if (summary.isPending) return <LoadingState label="Memuat ringkasan antrean…" />;
  if (summary.isError || !summary.data) return <ErrorState retry={() => summary.refetch()} />;
  const d = summary.data;
  const roleQueue = staff.role === "PBJT_KABID"
    ? { label: "Antrean persetujuan Anda", value: d.waitingKabid, href: "/sptpd?stage=WAITING_KABID", detail: "Laporan telah melewati pemeriksaan Verifier dan menunggu keputusan Kepala Bidang.", Icon: Clock3 }
    : { label: "Antrean pemeriksaan Anda", value: d.waitingAdmin, href: "/sptpd?stage=WAITING_ADMIN", detail: "Laporan baru yang perlu diperiksa sebelum diteruskan ke tahap berikutnya.", Icon: ShieldCheck };
  const RoleIcon = roleQueue.Icon;

  return <section className="command-board" aria-label="Ringkasan operasional PBJT">
    <div className="command-focus">
      <Link href={roleQueue.href} className="command-hero">
        <span className="command-kicker">Prioritas hari ini</span>
        <span className="command-hero-icon"><RoleIcon aria-hidden /></span>
        <strong>{roleQueue.value.toLocaleString("id-ID")}</strong>
        <div><h2>{roleQueue.label}</h2><p>{roleQueue.detail}</p></div>
        <span className="command-open">Buka antrean <ArrowRight aria-hidden /></span>
      </Link>
      <Link href="/sptpd?stage=SYNC_FAILED" className={`command-alert ${d.syncFailed === 0 ? "is-clear" : ""}`}>
        <span className="command-alert-icon"><AlertTriangle aria-hidden /></span>
        <div><span>Perlu perhatian</span><strong>{d.syncFailed.toLocaleString("id-ID")} sinkronisasi gagal</strong><small>{d.syncFailed === 0 ? "Tidak ada gangguan sinkronisasi saat ini." : "Periksa dan ulangi pengiriman data ke SIMPAKDU."}</small></div>
        <ArrowRight aria-hidden />
      </Link>
    </div>
    <div className="command-queue">
      <header><div><span>Meja verifikasi</span><h2>Posisi laporan saat ini</h2></div><Link href="/sptpd">Lihat semua <ArrowRight /></Link></header>
      <div className="queue-ledger">
        <QueueRow label="Menunggu Verifier" value={d.waitingAdmin} href="/sptpd?stage=WAITING_ADMIN" Icon={ShieldCheck} />
        <QueueRow label="Menunggu Kepala Bidang" value={d.waitingKabid} href="/sptpd?stage=WAITING_KABID" Icon={Clock3} />
        <QueueRow label="Sedang dikirim ke SIMPAKDU" value={d.processingSimpakdu} href="/sptpd?stage=PROCESSING_SIMPAKDU" Icon={RefreshCw} />
      </div>
    </div>
    <div className="command-settlement">
      <header><span>Penyelesaian</span><h2>Dari penetapan hingga lunas</h2></header>
      <div className="settlement-track">
        <Link href="/sptpd?status=MENUNGGU_PEMBAYARAN"><span className="settlement-icon waiting"><Banknote /></span><div><small>Menunggu pembayaran</small><strong>{d.waitingPayment.toLocaleString("id-ID")}</strong></div><ArrowRight /></Link>
        <span className="settlement-divider" aria-hidden />
        <Link href="/sptpd?status=LUNAS"><span className="settlement-icon paid"><BadgeCheck /></span><div><small>Sudah lunas</small><strong>{d.paid.toLocaleString("id-ID")}</strong></div><ArrowRight /></Link>
      </div>
    </div>
  </section>;
}

function QueueRow({ label, value, href, Icon }: { label: string; value: number; href: string; Icon: typeof ShieldCheck }) {
  return <Link href={href}><span className="queue-icon"><Icon aria-hidden /></span><span>{label}</span><strong>{value.toLocaleString("id-ID")}</strong><ArrowRight aria-hidden /></Link>;
}
