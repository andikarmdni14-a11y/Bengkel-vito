import { useState } from "react";
import { Image as ImageIcon, type LucideIcon } from "lucide-react";

// Gambar dengan fallback: jika URL kosong/gagal dimuat, tampil blok placeholder rapi (bukan ikon rusak).
interface PhotoProps {
  src?: string | null;
  alt: string;
  icon?: LucideIcon;
  dark?: boolean;
  iconClass?: string;
  /** Kelas tambahan untuk <img>, mis. "rounded-xl". */
  className?: string;
  /** Gambar di bagian atas halaman (hero): dimuat segera, tidak lazy. */
  priority?: boolean;
}

// Foto contoh dari placehold.co menggambar teks ("Ban Tubeless", dll.) di dalam gambarnya dengan warna pudar,
// dan itu tidak bisa diperbaiki lewat CSS. Anggap saja belum ada foto: tampilkan ikon dengan kontras yang jelas.
const isDummyImage = (src: string): boolean => /^https?:\/\/([\w-]+\.)?placehold\.co\//i.test(src);

export default function Photo({
  src,
  alt,
  icon: Icon = ImageIcon,
  dark = false,
  iconClass,
  className = "",
  priority = false,
}: PhotoProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed || isDummyImage(src)) {
    return (
      <div
        role="img"
        aria-label={alt}
        // Ikon slate-500 di atas slate-100 (~4,4:1) dan slate-400 di atas slate-800 (~5,7:1): terbaca jelas.
        className={`grid h-full w-full place-items-center ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"} ${className}`}
      >
        <Icon className={iconClass ?? (dark ? "h-24 w-24" : "h-12 w-12")} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}
