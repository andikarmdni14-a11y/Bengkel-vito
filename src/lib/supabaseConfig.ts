/**
 * Validasi konfigurasi Supabase untuk BROWSER (murni, tanpa efek samping, mudah dites).
 *
 * Tujuan utama: mencegah kunci RAHASIA (service_role / sb_secret_...) ikut terkirim ke browser. Variabel VITE_*
 * ditanam ke dalam bundel JavaScript dan terbaca siapa pun; kunci service_role melewati semua aturan RLS.
 */

export type SupabaseConfigCheck =
  | { ok: true; url: string; key: string }
  | { ok: false; reason: "missing" | "invalid_url" | "secret_key"; message: string };

const MESSAGES = {
  missing:
    "Koneksi database belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env, lalu jalankan ulang aplikasi.",
  invalid_url:
    "VITE_SUPABASE_URL tidak valid. Gunakan alamat proyek berbentuk https://<project-ref>.supabase.co (http hanya diizinkan untuk localhost).",
  secret_key:
    "VITE_SUPABASE_ANON_KEY berisi kunci RAHASIA (service_role / secret). Kunci ini tidak boleh ada di aplikasi browser. " +
    "Ganti dengan kunci anon/publishable, lalu ROTASI kunci rahasia tadi di Supabase Dashboard bila sempat ter-deploy.",
} as const;

/** Ambil klaim `role` dari JWT (tanpa verifikasi tanda tangan; hanya untuk mendeteksi salah pakai kunci). */
export function readJwtRole(key: string): string | null {
  const parts = key.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = (parts[1] ?? "").replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload: unknown = JSON.parse(atob(padded));
    if (typeof payload === "object" && payload !== null && "role" in payload) {
      const role = (payload as { role: unknown }).role;
      return typeof role === "string" ? role : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** True untuk kunci format baru `sb_secret_...` maupun JWT lama dengan role "service_role". */
export function isSecretKey(key: string): boolean {
  return key.startsWith("sb_secret_") || readJwtRole(key) === "service_role";
}

const isAllowedUrl = (value: string): boolean => {
  try {
    const u = new URL(value);
    if (u.protocol === "https:") return true;
    return u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
  } catch {
    return false;
  }
};

export function checkSupabaseConfig(url: string | undefined, key: string | undefined): SupabaseConfigCheck {
  const cleanUrl = url?.trim();
  const cleanKey = key?.trim();
  if (!cleanUrl || !cleanKey) return { ok: false, reason: "missing", message: MESSAGES.missing };
  if (isSecretKey(cleanKey)) return { ok: false, reason: "secret_key", message: MESSAGES.secret_key };
  if (!isAllowedUrl(cleanUrl)) return { ok: false, reason: "invalid_url", message: MESSAGES.invalid_url };
  return { ok: true, url: cleanUrl, key: cleanKey };
}
