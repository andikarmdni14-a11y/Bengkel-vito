import type { SiteConfig } from "../types";

/* Satu tempat untuk data bengkel. Ganti sesuai kondisi sebenarnya.
   Produk & layanan TIDAK lagi di sini: keduanya diambil dari Supabase (tabel products & services). */
export const SITE: SiteConfig = {
  name: "FitoMotor",
  tagline: "Bengkel motor terpercaya untuk servis, ban, dan suku cadang.",
  // Isi lewat file .env (VITE_WA_NUMBER). Format 62..., tanpa +, 0, atau spasi.
  waNumber: import.meta.env.VITE_WA_NUMBER || "6281234567890",
  address: ["Jl. Raya Contoh No. 123, Kelurahan Contoh,", "Kecamatan Contoh, Jakarta 12345"],
  hours: ["Senin – Sabtu, 08:00 – 17:00 WIB", "Minggu & hari libur tutup"],
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=FitoMotor+Bengkel+Motor",
  // URL embed Google Maps (isi src dari <iframe>) agar peta tampil di halaman Kontak.
  // Cara ambil: Google Maps -> cari bengkel -> Bagikan -> Sematkan peta -> salin nilai src="https://www.google.com/maps/embed?pb=...".
  // Selama kosong, halaman Kontak menampilkan ilustrasi peta beserta alamat (tanpa teks developer).
  mapEmbedUrl: "",
  // Foto hero Beranda. Bawaan: ilustrasi di public/hero-mekanik.svg.
  // Ganti dengan foto asli: taruh file di public/ (mis. public/hero-mekanik.jpg) lalu ubah nilai ini ke "/hero-mekanik.jpg".
  heroImage: "/hero-mekanik.svg",
};
