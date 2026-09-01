import Image from "next/image";

type Props = {
  variant?: "compact" | "institutional";
  standalone?: boolean;
  priority?: boolean;
};

export function BrandMark({ variant = "compact", standalone = false, priority = false }: Props) {
  return (
    <div className={`brand-lockup brand-lockup-${variant}`}>
      <Image
        className="brand-crest"
        src="/brand/bapenda-makassar.png"
        width={120}
        height={144}
        sizes={variant === "institutional" ? "72px" : "44px"}
        alt={standalone ? "Lambang Pemerintah Kota Makassar" : ""}
        priority={priority}
      />
      {!standalone && (
        <div className="brand-copy">
          <span>Pemerintah Kota Makassar</span>
          <strong>Badan Pendapatan Daerah</strong>
          <small>Sistem PBJT</small>
        </div>
      )}
    </div>
  );
}
