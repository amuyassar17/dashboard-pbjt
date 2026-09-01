import { ArrowRight, Building2, CarFront, Droplets, Feather, House, Landmark, Megaphone, Mountain, Music2, UtensilsCrossed, Zap, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

type TaxType = { code: string; name: string; short: string; description: string; Icon: LucideIcon; note?: string };

const pbjtTypes: TaxType[] = [
  { code: "01", name: "Jasa Perhotelan", short: "Hotel", description: "Hotel, penginapan, dan layanan akomodasi.", Icon: Building2 },
  { code: "02", name: "Makanan dan Minuman", short: "Restoran", description: "Restoran, rumah makan, kafe, dan layanan boga.", Icon: UtensilsCrossed },
  { code: "03", name: "Kesenian dan Hiburan", short: "Hiburan", description: "Penyelenggaraan hiburan dan kegiatan sejenis.", Icon: Music2 },
  { code: "04", name: "Tenaga Listrik", short: "PPJ", description: "Riwayat penerangan jalan dan pemakaian tenaga listrik.", Icon: Zap },
  { code: "05", name: "Jasa Parkir", short: "Parkir", description: "Penyelenggaraan dan pengelolaan tempat parkir.", Icon: CarFront },
];

const otherTypes: TaxType[] = [
  { code: "06", name: "Pajak Reklame", short: "Reklame", description: "Penyelenggaraan media reklame dan turunannya.", Icon: Megaphone },
  { code: "07", name: "Pajak Air Tanah", short: "Air Tanah", description: "Pengambilan dan pemanfaatan air bawah tanah.", Icon: Droplets },
  { code: "08", name: "Pajak Mineral Bukan Logam dan Batuan", short: "MBLB", description: "Riwayat pajak mineral bukan logam dan batuan.", Icon: Mountain },
  { code: "09", name: "Pajak Sarang Burung Walet", short: "Walet", description: "Pengambilan dan pengusahaan sarang burung walet.", Icon: Feather },
  { code: "10", name: "Bea Perolehan Hak atas Tanah dan Bangunan", short: "BPHTB", description: "Perolehan hak atas tanah dan bangunan.", Icon: Landmark },
  { code: "11", name: "Pajak Bumi dan Bangunan Perdesaan dan Perkotaan", short: "PBB-P2", description: "Arsip historis transaksi PBB yang tersimpan di SIMPAKDU.", note: "Pengelolaan aktif melalui e-SISMIOP", Icon: House },
];

export function HistoryTaxTypeView() {
  return <>
    <PageHeader eyebrow="Arsip SIMPAKDU" title="Riwayat SPTPD" description="Pilih kelompok dan jenis pajak agar pencarian tetap cepat pada arsip transaksi yang besar." />
    <div className="archive-groups">
      <TaxGroup title="Pajak Barang dan Jasa Tertentu (PBJT)" description="Lima layanan PBJT dengan riwayat pelaporan masing-masing." items={pbjtTypes} start={1} />
      <TaxGroup title="Pajak daerah lainnya" description="Arsip pajak non-PBJT yang tercatat pada SIMPAKDU." items={otherTypes} start={6} />
    </div>
  </>;
}

function TaxGroup({ title, description, items, start }: { title: string; description: string; items: TaxType[]; start: number }) {
  return <section className="archive-index" aria-label={title}>
    <header><span>{title}</span><p>{description}</p></header>
    <div>{items.map(({ code, name, short, description: detail, note, Icon }, index) => <Link key={code} href={`/history/type/${code}`} className="archive-index-row"><span className="archive-index-number">{String(start + index).padStart(2, "0")}</span><span className="archive-index-icon"><Icon aria-hidden /></span><span className="archive-index-copy"><strong>{name}</strong><small>{detail}</small>{note && <em>{note}</em>}</span><span className="archive-index-action"><small>Buka arsip</small><strong>{short}</strong><ArrowRight aria-hidden /></span></Link>)}</div>
  </section>;
}
