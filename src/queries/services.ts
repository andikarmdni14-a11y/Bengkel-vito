import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchServices } from "../lib/api";
import type { Service } from "../types";
import { queryKeys } from "./keys";
import { useQueryStatus } from "./useQueryStatus";

export const servicesQueryOptions = queryOptions({
  queryKey: queryKeys.services,
  queryFn: fetchServices,
  staleTime: 10 * 60_000, // daftar layanan jarang berubah
});

const NONE: Service[] = [];

export function useServices() {
  const query = useQuery(servicesQueryOptions);
  const status = useQueryStatus(query, "Terjadi kesalahan saat memuat data.");
  return { services: query.data ?? NONE, ...status };
}
