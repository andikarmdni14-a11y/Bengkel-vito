/**
 * Satu tempat untuk semua query key, supaya invalidasi / prefetch tidak bergantung pada string yang
 * diketik ulang di banyak file. Urutkan dari yang paling umum ke paling spesifik.
 */
export const queryKeys = {
  products: ["products"] as const,
  services: ["services"] as const,
} as const;
