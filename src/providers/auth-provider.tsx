"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { staffSchema, type Staff } from "@/lib/api/contracts";
import { apiFetch } from "@/lib/api/browser";
import { queryKeys } from "@/lib/api/query-keys";
import { BrandMark } from "@/components/ui/brand-mark";

const AuthContext = createContext<Staff | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      const response = await apiFetch<unknown>("/api/session");
      return staffSchema.parse(response.data);
    },
    retry: false,
  });

  useEffect(() => {
    if (session.isError) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router, session.isError]);

  if (session.isPending) return <ShellLoading />;
  if (!session.data) return null;
  return <AuthContext.Provider value={session.data}>{children}</AuthContext.Provider>;
}

export function useStaff() {
  const staff = useContext(AuthContext);
  if (!staff) throw new Error("AuthProvider tidak tersedia");
  return staff;
}

function ShellLoading() {
  return (
    <div className="shell-loading" role="status" aria-live="polite">
      <BrandMark variant="institutional" standalone />
      <div className="skeleton-stack" aria-hidden="true"><span className="skeleton-line skeleton-line-short" /><span className="skeleton-line" /></div>
      <p>Memuat sesi petugas…</p>
    </div>
  );
}
