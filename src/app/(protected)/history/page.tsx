import type { Metadata } from "next";
import { HistoryTaxTypeView } from "@/components/history/history-tax-type-view";

export const metadata: Metadata = { title: "Riwayat SPTPD" };
export default function HistoryPage() { return <HistoryTaxTypeView />; }
