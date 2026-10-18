/** Ambil pesan yang aman ditampilkan ke pengguna dari objek galat apa pun. */
export function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
