import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/ui/brand-mark";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return <main className="login-page">
    <section className="login-story" aria-labelledby="login-story-title">
      <div className="civic-motif" aria-hidden />
      <BrandMark variant="institutional" priority />
      <div className="login-brand"><p className="eyebrow">Pelayanan pajak daerah</p><h1 id="login-story-title">Tertib pelaporan.<br />Jelas pengawasan.</h1><p>Ruang kerja petugas Bapenda untuk memverifikasi laporan usaha, mengawal sinkronisasi SIMPAKDU, dan menjaga jejak audit PBJT.</p></div>
      <div className="login-footnote"><span>Kota Makassar</span><strong>Pajak Barang dan Jasa Tertentu</strong></div>
    </section>
    <section className="login-panel" aria-label="Masuk ke dashboard"><Suspense fallback={<div className="login-loading" role="status">Memuat form login…</div>}><LoginForm /></Suspense></section>
  </main>;
}
