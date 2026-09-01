import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SimpakduHistoryView } from "@/components/history/simpakdu-history-view";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "Riwayat per Jenis Pajak" };
export default async function TaxHistoryPage({ params }: { params: Promise<{ kdPajak: string }> }) {
  const { kdPajak } = await params;
  if (!["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"].includes(kdPajak)) notFound();
  return <Suspense fallback={<LoadingState />}><SimpakduHistoryView lockedKdPajak={kdPajak} /></Suspense>;
}
