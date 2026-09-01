import Link from "next/link";
import { BrandMark } from "@/components/ui/brand-mark";

export default function NotFound() {
  return <main className="standalone-state"><BrandMark variant="institutional" standalone /><p className="eyebrow">Kode 404</p><h1>Halaman tidak ditemukan</h1><p>Alamat mungkin berubah atau tautan yang digunakan tidak tepat.</p><Link className="button button-primary" href="/dashboard">Kembali ke dashboard</Link></main>;
}
