import { useMutation } from "@tanstack/react-query";
import { createBooking } from "../lib/api";
import type { BookingInsert } from "../types";

/**
 * Kirim booking baru. Tidak di-retry otomatis (lihat createQueryClient): insert bukan idempotent.
 * Galat ditangani pemanggil lewat try/catch pada mutateAsync (toast + form tetap terisi).
 */
export function useCreateBooking() {
  return useMutation<void, Error, BookingInsert>({ mutationFn: createBooking });
}
