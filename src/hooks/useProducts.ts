import { fetchProducts } from "../lib/api";
import type { Product } from "../types";
import { useAsyncResource } from "./useAsyncResource";

const NONE: Product[] = [];

export function useProducts() {
  const { data, loading, error, refetch } = useAsyncResource("products", fetchProducts);
  return { products: data ?? NONE, loading, error, refetch };
}
