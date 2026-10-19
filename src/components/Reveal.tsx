import type { CSSProperties, ReactNode } from "react";
import { useInView } from "../hooks/useInView";

export type RevealVariant = "up" | "left" | "right" | "scale" | "fade";

interface RevealProps {
  children: ReactNode;
  /** Arah/gaya masuk. Default "up" (naik sambil memudar masuk). */
  variant?: RevealVariant;
  /** Jeda sebelum animasi mulai (ms). Pakai untuk efek berurutan (stagger). */
  delay?: number;
  className?: string;
}

/**
 * Animasi saat di-scroll: konten memudar masuk begitu terlihat di layar (sekali saja).
 * Gaya ada di index.css (.reveal). Pengguna dengan "reduce motion" langsung melihat konten tanpa animasi.
 * Catatan: gunakan className="h-full" bila anak harus mengisi tinggi sel grid.
 */
export default function Reveal({ children, variant = "up", delay = 0, className = "" }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const style: CSSProperties | undefined = delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <div
      ref={ref}
      data-reveal={variant}
      style={style}
      className={`reveal${inView ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </div>
  );
}
