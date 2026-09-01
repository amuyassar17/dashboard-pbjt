import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "./button";

export function LoadingState({ label = "Memuat data…" }: { label?: string }) {
  return (
    <div className="state-box loading-state" role="status" aria-live="polite">
      <div className="skeleton-stack" aria-hidden="true">
        <span className="skeleton-line skeleton-line-short" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-line-medium" />
      </div>
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message = "Data gagal dimuat.", retry }: { message?: string; retry?: () => void }) {
  return <div className="state-box state-error" role="alert"><AlertCircle aria-hidden /><p>{message}</p>{retry && <Button variant="secondary" onClick={retry}>Coba lagi</Button>}</div>;
}

export function EmptyState({ title = "Belum ada data", detail }: { title?: string; detail?: string }) {
  return <div className="state-box"><Inbox aria-hidden /><strong>{title}</strong>{detail && <p>{detail}</p>}</div>;
}
