import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { SummaryView } from "@/components/dashboard/summary-view";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "Ringkasan" };

export default function DashboardPage() {
  return <>
    <PageHeader eyebrow="Pusat kendali PBJT" title="Ringkasan operasional" description="Antrean yang perlu ditindak, progres SIMPAKDU, dan pembayaran pajak daerah." actions={<Link href="/sptpd" className="text-link">Buka semua SPTPD <ArrowRight size={17} /></Link>} />
    <SummaryView />
    <aside className="dashboard-footnote"><span>Alur kerja</span><p>SPTPD restoran melalui Verifier dan Kepala Bidang. Laporan lain mengikuti ketentuan jenis pajaknya, dan seluruh perubahan tersimpan pada jejak proses.</p><Link href="/history">Buka riwayat pajak <ArrowRight size={15} /></Link></aside>
  </>;
}
