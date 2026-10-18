import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../lib/api";
import type { Product } from "../types";
import { queryKeys } from "./keys";
import { useQueryStatus } from "./useQueryStatus";

/** Dipakai juga di luar komponen (mis. sinkronisasi keranjang lewat queryClient.fetchQuery). */
export const productsQueryOptions = queryOptions({
  queryKey: queryKeys.products,
  queryFn: fetchProducts,
  staleTime: 60_000, // stok & harga bisa berubah: cukup segar, tapi tidak fetch tiap pindah halaman
});

const NONE: Product[] = []; // referensi stabil agar useMemo di halaman tidak terhitung ulang

export function useProducts() {
  const query = useQuery(productsQueryOptions);
  const status = useQueryStatus(query, "Terjadi kesalahan saat memuat data.");
  return { products: query.data ?? NONE, ...status };
}
