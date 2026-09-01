"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Filter, Info, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { apiFetch } from "@/lib/api/browser";
import { paginationSchema, simpakduHistorySchema } from "@/lib/api/contracts";
import { queryKeys } from "@/lib/api/query-keys";
import { formatTaxPeriod, rupiah } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";

const sourceLabels = { LONTARA: "Lontara", PAKINTA: "Pakinta", LEGACY_UNKNOWN: "Sumber lama" } as const;

const taxLabels: Record<string, string> = {
  "01": "Hotel", "02": "Restoran", "03": "Hiburan", "04": "Tenaga Listrik", "05": "Parkir",
  "06": "Reklame", "07": "Air Tanah", "08": "Mineral Bukan Logam dan Batuan",
  "09": "Sarang Burung Walet", "10": "BPHTB", "11": "PBB-P2",
};

export function SimpakduHistoryView({ lockedKdPajak }: { lockedKdPajak: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchText, setSearchText] = useState(searchParams.get("search") ?? "");
  const queryString = searchParams.toString();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  function patch(values: Record<string, string | null>, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    if (resetPage) next.set("page", "1");
    router.replace(`/history/type/${lockedKdPajak}?${next.toString()}`);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((searchParams.get("search") ?? "") !== searchText) patch({ search: searchText.trim() || null });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const history = useQuery({
    queryKey: queryKeys.simpakduHistory(`${lockedKdPajak}:${queryString}`),
    queryFn: async () => {
      const params = new URLSearchParams(searchParams);
      if (!params.has("page")) params.set("page", "1");
      if (!params.has("limit")) params.set("limit", "20");
      params.set("kdPajak", lockedKdPajak);
      const payload = await apiFetch<unknown>(`/api/pbjt/simpakdu-history?${params}`);
      return { items: z.array(simpakduHistorySchema).parse(payload.data), meta: paginationSchema.parse(payload.meta) };
    },
    placeholderData: keepPreviousData,
  });
  const filtered = useMemo(() => ["source", "paymentStatus", "masaPajak", "search"].some((key) => searchParams.has(key)), [searchParams]);

  return <>
    <Link href="/history" className="back-link"><ArrowLeft size={17} /> Pilih jenis pajak lain</Link>
    <PageHeader eyebrow={`Arsip ${taxLabels[lockedKdPajak]}`} title={`Riwayat Pajak ${taxLabels[lockedKdPajak]}`} description="Telusuri pelaporan dan pembayaran terdahulu serta lihat kanal asal yang dapat diverifikasi." />
    <aside className="history-note"><Info aria-hidden /><p><strong>Label sumber memakai bukti transaksi.</strong> Data lama tanpa penanda Pakinta atau Lontara tetap ditampilkan sebagai “Sumber lama”, bukan ditebak.</p></aside>
    <section className="filter-panel history-filters">
      <div className="search-field"><Search aria-hidden /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Cari SPTPD, usaha, NPWPD, atau nomor OP" aria-label="Cari riwayat SPTPD" /></div>
      <select value={searchParams.get("source") ?? ""} onChange={(event) => patch({ source: event.target.value || null })} aria-label="Sumber pelaporan"><option value="">Semua sumber</option><option value="LONTARA">Lontara</option><option value="PAKINTA">Pakinta</option><option value="LEGACY_UNKNOWN">Sumber lama</option></select>
      <select value={searchParams.get("paymentStatus") ?? ""} onChange={(event) => patch({ paymentStatus: event.target.value || null })} aria-label="Status pembayaran"><option value="">Semua pembayaran</option><option value="PAID">Lunas</option><option value="UNPAID">Belum lunas</option></select>
      <input type="month" value={searchParams.get("masaPajak") ?? ""} onChange={(event) => patch({ masaPajak: event.target.value || null })} aria-label="Masa pajak" />
      {filtered && <Button variant="ghost" onClick={() => { setSearchText(""); router.replace(`/history/type/${lockedKdPajak}`); }}><Filter size={17} /> Reset</Button>}
    </section>

    {history.isPending ? <LoadingState label="Mengambil riwayat SIMPAKDU…" /> : history.isError || !history.data ? <ErrorState retry={() => history.refetch()} /> : history.data.items.length === 0 ? <EmptyState title="Riwayat tidak ditemukan" detail={filtered ? "Ubah filter untuk memperluas hasil pencarian." : "Belum ada transaksi yang dapat ditampilkan dari SIMPAKDU."} /> : <>
      <section className="data-panel history-panel">
        <div className="table-wrap"><table><caption className="sr-only">Riwayat SPTPD SIMPAKDU</caption><thead><tr><th>SPTPD / Usaha</th><th>Masa & Jenis</th><th>Sumber</th><th>Pembayaran</th><th className="numeric-cell">Pajak</th><th>Referensi</th><th><span className="sr-only">Aksi</span></th></tr></thead><tbody>{history.data.items.map((item) => <tr key={item.kdNilaiPajak}><td><strong>{item.noSptpd || "Tanpa nomor"}</strong><small>{item.namaOp}</small><small>{item.npwpd} · {item.kdOp}</small></td><td>{formatTaxPeriod(item.masaPajak)}<small>{item.jenisOp}</small></td><td><span className={`source-badge source-${item.submissionSource.toLowerCase()}`} title={item.sourceEvidence}>{sourceLabels[item.submissionSource]}</span></td><td><span className={`payment-state ${item.paymentStatus === "PAID" ? "paid" : "unpaid"}`}>{item.paymentStatus === "PAID" ? "Lunas" : "Belum lunas"}</span><small>{item.paymentMethod === "UNKNOWN" ? "Metode belum tercatat" : item.paymentMethod}</small></td><td className="numeric-cell"><strong>{rupiah.format(item.pajakTerutang)}</strong>{item.paymentStatus === "PAID" && <small>Dibayar {rupiah.format(item.amountPaid)}</small>}</td><td>{item.paymentReference || "—"}<small>{item.kdNilaiPajak}</small></td><td><Link className="history-detail-button" href={`/history/${encodeURIComponent(item.kdNilaiPajak)}`}><span>Lihat detail</span><ArrowUpRight aria-hidden /></Link></td></tr>)}</tbody></table></div>
        <div className="mobile-list">{history.data.items.map((item) => <article className="mobile-card history-mobile-card" key={item.kdNilaiPajak}><div className="mobile-card-head"><div><strong>{item.namaOp}</strong><small>{item.noSptpd || "Tanpa nomor SPTPD"}</small></div><span className={`source-badge source-${item.submissionSource.toLowerCase()}`}>{sourceLabels[item.submissionSource]}</span></div><dl><div><dt>Masa pajak</dt><dd>{formatTaxPeriod(item.masaPajak)}</dd></div><div><dt>Jenis</dt><dd>{item.jenisOp}</dd></div><div><dt>Status</dt><dd>{item.paymentStatus === "PAID" ? "Lunas" : "Belum lunas"}</dd></div><div><dt>Pajak</dt><dd>{rupiah.format(item.pajakTerutang)}</dd></div><div><dt>NPWPD</dt><dd>{item.npwpd}</dd></div><div><dt>Metode</dt><dd>{item.paymentMethod === "UNKNOWN" ? "—" : item.paymentMethod}</dd></div></dl><Link className="history-detail-button history-detail-mobile" href={`/history/${encodeURIComponent(item.kdNilaiPajak)}`}><span>Lihat detail dan tren</span><ArrowUpRight aria-hidden /></Link></article>)}</div>
      </section>
      <footer className="pagination"><p>Menampilkan {(page - 1) * history.data.meta.limit + 1}–{Math.min(page * history.data.meta.limit, history.data.meta.total)} dari {history.data.meta.total}</p><div><Button variant="secondary" disabled={page <= 1} onClick={() => patch({ page: String(page - 1) }, false)}><ChevronLeft size={17} /> Sebelumnya</Button><span>Halaman {page}</span><Button variant="secondary" disabled={page * history.data.meta.limit >= history.data.meta.total} onClick={() => patch({ page: String(page + 1) }, false)}>Berikutnya <ChevronRight size={17} /></Button></div></footer>
    </>}
  </>;
}
