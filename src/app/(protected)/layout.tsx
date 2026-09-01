import { AuthProvider } from "@/providers/auth-provider";
import { AppShell } from "@/components/shell/app-shell";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider><AppShell>{children}</AppShell></AuthProvider>;
}
