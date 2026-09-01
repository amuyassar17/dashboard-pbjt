"use client";

import { useEffect } from "react";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="standalone-state"><BrandMark variant="institutional" standalone /><p className="eyebrow">Gangguan sistem</p><h1>Halaman gagal ditampilkan</h1><p>Coba muat ulang. Hubungi administrator bila gangguan berulang.</p><Button onClick={() => retry()}>Coba lagi</Button></main>;
}
