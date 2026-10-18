import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errors";

/**
 * Pengambil data generik dengan state loading/error, cache memori (TTL 60 dtk) dan
 * deduplikasi request yang sedang berjalan. Berpindah halaman bolak-balik tidak memicu
 * fetch ulang beruntun, tetapi stok tetap cukup segar.
 */

const TTL_MS = 60_000;

interface CacheEntry {
  data: unknown;
  at: number;
}

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function request<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const running = inflight.get(key);
  if (running) return running as Promise<T>;

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, at: Date.now() });
      return data;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}

/** Ambil data dari cache bila masih segar, jika tidak fetch (dan dedupe dengan request yang sedang berjalan). */
export function loadFresh<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.at < TTL_MS) return Promise.resolve(entry.data as T);
  return request(key, fetcher);
}

export interface ResourceState<T> {
  data: T | undefined;
  loading: boolean;
  /** Hanya terisi bila belum ada data sama sekali (data lama tetap ditampilkan saat refetch gagal). */
  error: string | null;
  refetch: () => void;
}

/** `fetcher` harus stabil (fungsi modul), karena menjadi dependensi efek. */
export function useAsyncResource<T>(key: string, fetcher: () => Promise<T>): ResourceState<T> {
  const cached = cache.get(key);
  const [data, setData] = useState<T | undefined>(cached?.data as T | undefined);
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const forceRef = useRef(false);

  const refetch = useCallback(() => {
    forceRef.current = true;
    setLoading(true);
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    const force = forceRef.current;
    forceRef.current = false;

    const entry = cache.get(key);
    if (entry && !force && Date.now() - entry.at < TTL_MS) {
      setData(entry.data as T);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    request(key, fetcher)
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!active) return;
        const message = getErrorMessage(err, "Terjadi kesalahan saat memuat data.");
        setError(message);
        // id tetap -> toast yang sama tidak muncul berulang bila beberapa komponen gagal bersamaan
        toast.error(message, { id: `${key}-error` });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [key, fetcher, attempt]);

  return { data, loading, error: data === undefined ? error : null, refetch };
}
