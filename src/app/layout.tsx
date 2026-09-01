import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: { default: "PBJT Bapenda Kota Makassar", template: "%s · PBJT Bapenda Makassar" },
  description: "Dashboard operasional PBJT Badan Pendapatan Daerah Kota Makassar",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="id" className={jakarta.variable}><body><QueryProvider>{children}</QueryProvider></body></html>;
}
