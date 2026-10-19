import { z } from "zod";
import { todayISO } from "../utils/date";

const digitsOnly = (v: string) => v.replace(/\D/g, "");

export const bookingSchema = z.object({
  user_name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(80, "Nama maksimal 80 karakter."),
  phone: z
    .string()
    .trim()
    .min(1, "Nomor telepon wajib diisi.")
    .regex(/^\+?[0-9\s-]+$/, "Nomor telepon hanya boleh berisi angka.")
    .refine((v) => digitsOnly(v).length >= 10, "Nomor telepon minimal 10 digit.")
    .refine((v) => digitsOnly(v).length <= 15, "Nomor telepon maksimal 15 digit."),
  motor: z
    .string()
    .trim()
    .min(1, "Tipe motor wajib diisi.")
    .max(80, "Tipe motor maksimal 80 karakter."),
  date: z
    .string()
    .min(1, "Pilih tanggal kunjungan.")
    .refine((v) => v >= todayISO(), "Tanggal tidak boleh sebelum hari ini."),
  time: z.string().min(1, "Pilih jam kunjungan."),
  service_id: z.string().min(1, "Pilih jenis layanan."),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
