import { fetchServices } from "../lib/api";
import type { Service } from "../types";
import { useAsyncResource } from "./useAsyncResource";

const NONE: Service[] = [];

export function useServices() {
  const { data, loading, error, refetch } = useAsyncResource("services", fetchServices);
  return { services: data ?? NONE, loading, error, refetch };
}
