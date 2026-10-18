import { useCallback } from "react";
import { getErrorMessage } from "../utils/errors";

/** Bagian UseQueryResult yang dipakai di sini (struktural, supaya tidak terikat generik TData/TError). */
export interface QueryLike {
  data: unknown;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
}

/**
 * Logika murni (tanpa React, mudah dites): menerjemahkan state TanStack Query ke { loading, error }.
 * Perilaku sama dengan useAsyncResource lama:
 * - loading: hanya selama BELUM ada data (refetch latar tidak mengganti isi layar dengan skeleton).
 *   Termasuk saat offline dan query "paused" (isPending true): skeleton, bukan daftar kosong.
 * - error: hanya bila belum ada data sama sekali (data lama tetap ditampilkan saat refetch gagal),
 *   dan tidak selama percobaan ulang manual sedang berjalan.
 */
export function deriveQueryState(
  query: Pick<QueryLike, "data" | "isPending" | "isFetching" | "isError" | "error">,
  fallbackMessage: string
): { loading: boolean; error: string | null } {
  const noData = query.data === undefined;
  return {
    loading: noData && (query.isPending || query.isFetching),
    error: noData && query.isError && !query.isFetching ? getErrorMessage(query.error, fallbackMessage) : null,
  };
}

/** Hook tipis di atas deriveQueryState + refetch yang stabil dan tidak mengembalikan Promise. */
export function useQueryStatus(query: QueryLike, fallbackMessage: string) {
  const { refetch: queryRefetch } = query;

  const refetch = useCallback(() => {
    void queryRefetch();
  }, [queryRefetch]);

  return { ...deriveQueryState(query, fallbackMessage), refetch };
}
