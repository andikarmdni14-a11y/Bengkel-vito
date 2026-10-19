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
  /** "contain": gambar tampil utuh tanpa terpotong (PNG transparan / foto produk). Default "cover". */
  fit?: "cover" | "contain";
  /** Placeholder tanpa warna latar, agar menyatu dengan permukaan di belakangnya (mis. kartu produk). */
  bare?: boolean;
  /** Dimensi intrinsik gambar (px). Membantu browser menyisihkan ruang sebelum gambar terunduh (mengurangi layout shift). */
  width?: number;
  height?: number;
  /** Versi beresolusi berbeda dari gambar yang sama, mis. "/a-400.webp 400w, /a-800.webp 800w". */
  srcSet?: string;
  /** Lebar tampil gambar per breakpoint; dipakai bersama srcSet, mis. "(min-width: 1024px) 25vw, 50vw". */
  sizes?: string;
  /**
   * Format modern dengan fallback otomatis: dirender sebagai <picture>. Urutkan dari format terbaik, mis.
   * [{ type: "image/avif", srcSet: "/a.avif" }, { type: "image/webp", srcSet: "/a.webp" }]. `src` menjadi fallback <img>.
   */
  sources?: ReadonlyArray<{ type: string; srcSet: string; sizes?: string }>;
}

// Nama kelas ditulis utuh (bukan dirangkai) agar terdeteksi Tailwind.
const FIT = { cover: "object-cover", contain: "object-contain" } as const;

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
  fit = "cover",
  bare = false,
  width,
  height,
  srcSet,
  sizes,
  sources,
}: PhotoProps) {
  // Simpan URL yang GAGAL (bukan boolean): bila `src` berganti (mis. data produk diperbarui), gambar baru
  // dicoba lagi. Dengan boolean, satu kegagalan membuat placeholder "menempel" selamanya.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc !== null && failedSrc === src;

  if (!src || failed || isDummyImage(src)) {
    return (
      <div
        role="img"
        aria-label={alt}
        // Ikon slate-500 di atas slate-100 (~4,4:1) dan slate-400 di atas slate-800 (~5,7:1): terbaca jelas.
        className={`grid h-full w-full place-items-center ${
          dark ? "bg-slate-800 text-slate-400" : bare ? "text-neutral-500" : "bg-slate-100 text-slate-500"
        } ${className}`}
      >
        <Icon className={iconClass ?? (dark ? "h-24 w-24" : "h-12 w-12")} strokeWidth={1.5} />
      </div>
    );
  }

  const img = (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      width={width}
      height={height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`h-full w-full ${FIT[fit]} ${className}`}
    />
  );

  if (!sources || sources.length === 0) return img;

  // <picture>: browser memilih <source> pertama yang formatnya didukung; <img> di dalamnya = fallback + pemicu onError.
  return (
    <picture className="contents">
      {sources.map((source) => (
        <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={source.sizes ?? sizes} />
      ))}
      {img}
    </picture>
  );
}
