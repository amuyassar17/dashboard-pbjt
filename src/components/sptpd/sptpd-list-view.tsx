"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { dashboardSptpdSchema, paginationSchema, type DashboardSPTPD, type StaffRole } from "@/lib/api/contracts";
import { apiFetch } from "@/lib/api/browser";
import { queryKeys } from "@/lib/api/query-keys";
import { getAllowedActions } from "@/lib/auth/permissions";
import { formatDate, formatTaxPeriod, rupiah } from "@/lib/formatters";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { useStaff } from "@/providers/auth-provider";

export function SptpdListView() {
  const staff = useStaff();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchText, setSearchText] = useState(searchParams.get("search") ?? "");
  const queryString = searchParams.toString();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  function patch(params: Record<string, string | null>, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (resetPage) next.set("page", "1");
    router.replace(`/sptpd?${next.toString()}`);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((searchParams.get("search") ?? "") !== searchText) patch({ search: searchText.trim() || null });
    }, 400);
    return () => clearTimeout(timer);
    // Search params deliberately omitted to avoid restarting debounce on URL replacement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const list = useQuery({
    queryKey: queryKeys.sptpdList(queryString),
    queryFn: async () => {
      const params = new URLSearchParams(searchParams);
      if (!params.has("page")) params.set("page", "1");
      if (!params.has("limit")) params.set("limit", "20");
      const payload = await apiFetch<unknown>(`/api/pbjt/sptpd?${params}`);
      return { items: z.array(dashboardSptpdSchema).parse(payload.data), meta: paginationSchema.parse(payload.meta) };
    },
    placeholderData: keepPreviousData,
  });

  const filtered = useMemo(() => ["status", "stage", "kdPajak", "masaPajak", "search"].some((key) => searchParams.has(key)), [searchParams]);

  return <>
    <PageHeader eyebrow="Pelaporan PBJT" title="Daftar SPTPD" description="Cari, filter, dan buka laporan pajak Hotel atau Restoran." />
    <section className="filter-panel">
      <div className="search-field"><Search aria-hidden /><input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Cari usaha, NPWPD, nomor OP, atau SPTPD" aria-label="Cari SPTPD" /></div>
      <select value={searchParams.get("stage") ?? ""} onChange={(e) => patch({ stage: e.target.value || null })} aria-label="Tahap workflow"><option value="">Semua tahap</option><option value="WAITING_ADMIN">Antrean Verifier</option><option value="WAITING_KABID">Antrean Kabid</option><option value="PROCESSING_SIMPAKDU">Proses SIMPAKDU</option><option value="SYNC_FAILED">Sinkronisasi gagal</option><option value="COMPLETED">Selesai</option></select>
      <select value={searchParams.get("status") ?? ""} onChange={(e) => patch({ status: e.target.value || null })} aria-label="Status publik"><option value="">Semua status</option><option value="REVISI">Revisi</option><option value="MENUNGGU_VERIFIKASI">Menunggu verifikasi</option><option value="MENUNGGU_PEMBAYARAN">Menunggu pembayaran</option><option value="LUNAS">Lunas</option></select>
      <select value={searchParams.get("kdPajak") ?? ""} onChange={(e) => patch({ kdPajak: e.target.value || null })} aria-label="Jenis pajak"><option value="">Semua jenis</option><option value="01">Hotel</option><option value="02">Restoran</option></select>
      <input type="month" value={searchParams.get("masaPajak") ?? ""} onChange={(e) => patch({ masaPajak: e.target.value || null })} aria-label="Masa pajak" />
      {filtered && <Button variant="ghost" onClick={() => { setSearchText(""); router.replace("/sptpd"); }}><Filter size={17} /> Reset</Button>}
    </section>

    {list.isPending ? <LoadingState label="Memuat daftar SPTPD…" /> : list.isError || !list.data ? <ErrorState retry={() => list.refetch()} /> : list.data.items.length === 0 ? <EmptyState title={filtered ? "Tidak ada hasil sesuai filter" : "Belum ada SPTPD"} detail={filtered ? "Ubah atau hapus filter untuk melihat laporan lain." : "Laporan akan muncul setelah wajib pajak mengirim SPTPD."} /> : <>
      <section className="data-panel">
        <div className="table-wrap"><table><caption className="sr-only">Daftar laporan SPTPD sesuai filter aktif</caption><thead><tr><th>SPTPD / Usaha</th><th>NPWPD</th><th>Jenis & Masa</th><th>Status</th><th className="numeric-cell">Tagihan</th><th>Diperbarui</th><th><span className="sr-only">Aksi</span></th></tr></thead><tbody>{list.data.items.map((item) => <tr key={item.id}><td><strong>{item.noSptpd || "Belum terbit"}</strong><small>{item.namaOp}</small></td><td>{item.npwpd || "—"}<small>{item.noOp}</small></td><td>{item.jenisOp}<small>{formatTaxPeriod(item.masaPajak)}</small></td><td><div className="badge-stack"><StatusBadge value={item.status} /><StatusBadge value={item.workflowStage} kind="stage" /></div></td><td className="numeric-cell">{rupiah.format(item.totalTagihan)}</td><td>{formatDate(item.updatedAt, true)}</td><td><SptpdActions item={item} role={staff.role} /></td></tr>)}</tbody></table></div>
        <div className="mobile-list">{list.data.items.map((item) => <article className="mobile-card" key={item.id}><div className="mobile-card-head"><div><strong>{item.namaOp}</strong><small>{item.noSptpd || "SPTPD belum terbit"}</small></div><SptpdActions item={item} role={staff.role} /></div><div className="badge-stack"><StatusBadge value={item.status} /><StatusBadge value={item.workflowStage} kind="stage" /></div><dl><div><dt>NPWPD</dt><dd>{item.npwpd || "—"}</dd></div><div><dt>Masa</dt><dd>{formatTaxPeriod(item.masaPajak)}</dd></div><div><dt>Jenis</dt><dd>{item.jenisOp}</dd></div><div><dt>Tagihan</dt><dd>{rupiah.format(item.totalTagihan)}</dd></div></dl></article>)}</div>
      </section>
      <footer className="pagination"><p>Menampilkan {(page - 1) * list.data.meta.limit + 1}–{Math.min(page * list.data.meta.limit, list.data.meta.total)} dari {list.data.meta.total}</p><div><Button variant="secondary" disabled={page <= 1} onClick={() => patch({ page: String(page - 1) }, false)}><ChevronLeft size={17} /> Sebelumnya</Button><span>Halaman {page}</span><Button variant="secondary" disabled={page * list.data.meta.limit >= list.data.meta.total} onClick={() => patch({ page: String(page + 1) }, false)}>Berikutnya <ChevronRight size={17} /></Button></div></footer>
    </>}
  </>;
}

function SptpdActions({ item, role }: { item: DashboardSPTPD; role: StaffRole }) {
  const canVerify = item.kdPajak === "02" && getAllowedActions(role, item.status, item.workflowStage).length > 0;
  return <div className="row-actions"><Link className="history-detail-button" href={`/sptpd/${item.id}`}><span>Lihat detail</span><ArrowUpRight aria-hidden /></Link>{canVerify && <Link className="sptpd-verify-button" href={`/sptpd/${item.id}#verification-panel`}><span>Verifikasi</span><CheckCircle2 aria-hidden /></Link>}</div>;
}
