import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { checkSupabaseConfig } from "./supabaseConfig";

// Kunci HANYA dibaca dari variabel lingkungan (lihat .env.example). Jangan di-hardcode.
const config = checkSupabaseConfig(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export class SupabaseConfigError extends Error {
  constructor(message: string = "Koneksi database belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env, lalu jalankan ulang aplikasi.") {
    super(message);
    this.name = "SupabaseConfigError";
  }
}

// Env kosong itu wajar saat pengembangan awal (cukup pesan ramah di UI). Kunci rahasia / URL salah adalah
// kesalahan nyata: suarakan keras di console supaya tidak terlewat.
if (!config.ok && config.reason !== "missing") {
  console.error(`[supabase] ${config.message}`);
}

/**
 * Klien Supabase. Bernilai null jika konfigurasi belum diisi / tidak aman, supaya aplikasi tidak crash saat
 * start (halaman statis tetap tampil; bagian yang butuh data menampilkan pesan galat).
 * Situs ini hanya memakai akses anonim, jadi sesi auth tidak perlu disimpan atau dipulihkan dari URL.
 * Keamanan data BUKAN ditentukan oleh kerahasiaan anon key (ia publik), melainkan oleh RLS: lihat supabase/rls_hardening.sql.
 */
export const supabase: SupabaseClient | null = config.ok
  ? createClient(config.url, config.key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null;

/** Ambil klien, atau lempar SupabaseConfigError yang jelas bila konfigurasi belum benar. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new SupabaseConfigError(config.ok ? undefined : config.message);
  return supabase;
}
