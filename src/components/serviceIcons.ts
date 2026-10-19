import { Cog, CircleGauge, Wrench, type LucideIcon } from "lucide-react";

/** Kolom `icon` di tabel services berisi kunci string; komponen ikonnya dipetakan di sini. */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  wrench: Wrench,
  // Ban + tekanan angin. Gaya garis (outline) sama dengan ikon lain.
  "circle-gauge": CircleGauge,
  // Kunci lama: baris services yang sudah terlanjur tersimpan di Supabase tetap tampil benar tanpa migrasi data.
  "circle-dashed": CircleGauge,
  cog: Cog,
};

export const getServiceIcon = (key: string | null): LucideIcon => (key && SERVICE_ICONS[key]) || Wrench;
