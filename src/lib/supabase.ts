import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Kunci HANYA dibaca dari variabel lingkungan (lihat .env.example). Jangan di-hardcode.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Koneksi database belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env, lalu jalankan ulang aplikasi."
    );
    this.name = "SupabaseConfigError";
  }
}

/**
 * Klien Supabase. Bernilai null jika env belum diisi, supaya aplikasi tidak crash saat
 * start (halaman statis tetap tampil; bagian yang butuh data menampilkan pesan galat).
 * Situs ini hanya memakai akses anonim, jadi sesi auth tidak perlu disimpan.
 */
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

/** Ambil klien, atau lempar SupabaseConfigError yang jelas bila env belum diisi. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) throw new SupabaseConfigError();
  return supabase;
}
