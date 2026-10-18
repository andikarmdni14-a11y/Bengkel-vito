import { QueryCache, QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errors";
import { SupabaseConfigError } from "./supabase";

/** Percobaan ulang otomatis untuk query yang gagal (selain percobaan pertama). */
export const MAX_RETRIES = 2;

/** Jangan mengulang galat konfigurasi (env belum diisi): hasilnya pasti sama, hanya menunda pesan galat. */
export const shouldRetry = (failureCount: number, error: unknown): boolean =>
  !(error instanceof SupabaseConfigError) && failureCount < MAX_RETRIES;

/** Backoff eksponensial: 1 dtk, 2 dtk, 4 dtk ... maksimal 8 dtk. */
export const retryDelay = (attempt: number): number => Math.min(1000 * 2 ** attempt, 8000);

/**
 * Pabrik QueryClient. WAJIB dipanggil per render di server (entry-server.tsx) supaya cache tidak bocor
 * antar permintaan; di browser cukup dibuat sekali (main.tsx).
 *
 * Nilai bawaan:
 * - staleTime 60 dtk: setara TTL cache lama (useAsyncResource). Pindah halaman bolak-balik tidak memicu
 *   request ulang, tetapi harga & stok tetap cukup segar. Layanan jarang berubah -> staleTime lebih lama
 *   (lihat queries/services.ts).
 * - gcTime 5 menit: data tetap di memori sebentar setelah tak dipakai komponen mana pun.
 * - retry 2x dengan backoff: tahan terhadap jaringan HP yang putus-nyambung.
 * - Mutation TIDAK di-retry otomatis: insert booking bukan idempotent, retry bisa membuat booking ganda.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Beri tahu pengguna hanya bila ada komponen yang sedang menunggu data ini (observer aktif) DAN tidak
        // ada data lama untuk ditampilkan. Sinkronisasi latar (mis. cek harga saat keranjang dibuka) tetap senyap.
        if (query.state.data !== undefined || query.getObserversCount() === 0) return;
        // id tetap -> toast yang sama tidak muncul berulang bila beberapa komponen gagal bersamaan
        toast.error(getErrorMessage(error, "Terjadi kesalahan saat memuat data."), {
          id: `${String(query.queryKey[0])}-error`,
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        retryDelay,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}
