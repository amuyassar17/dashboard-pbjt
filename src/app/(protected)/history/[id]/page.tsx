import type { Metadata } from "next";
import { SimpakduHistoryDetailView } from "@/components/history/simpakdu-history-detail-view";

export const metadata: Metadata = { title: "Detail Riwayat SPTPD" };
export default async function HistoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SimpakduHistoryDetailView id={id} />;
}
