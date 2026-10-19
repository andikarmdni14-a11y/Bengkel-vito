/**
 * Galat yang SENGAJA dilempar trigger database lewat `raise exception` (kode P0001), mis. pembatasan jumlah
 * booking per nomor (supabase/optional_rate_limit.sql). Pesannya ditulis untuk pengguna, jadi boleh ditampilkan.
 */
export function isUserFacingDbError(err: unknown): err is { code: string; message: string } {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { code?: unknown; message?: unknown };
  return e.code === "P0001" && typeof e.message === "string" && e.message.length > 0;
}
