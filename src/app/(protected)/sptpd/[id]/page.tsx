import type { Metadata } from "next";
import { SptpdDetailView } from "@/components/sptpd/sptpd-detail-view";

export const metadata: Metadata = { title: "Detail SPTPD" };
export default async function SptpdDetailPage({ params }: PageProps<"/sptpd/[id]">) {
  const { id } = await params;
  return <SptpdDetailView id={id} />;
}
