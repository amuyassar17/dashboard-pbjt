import type { Metadata } from "next";
import { Suspense } from "react";
import { SptpdListView } from "@/components/sptpd/sptpd-list-view";
import { LoadingState } from "@/components/ui/states";

export const metadata: Metadata = { title: "SPTPD" };
export default function SptpdPage() { return <Suspense fallback={<LoadingState />}><SptpdListView /></Suspense>; }
