import type { Booking, BookingInsert, Product, Service } from "../types";
import { requireSupabase, SupabaseConfigError } from "./supabase";

/**
 * Semua pemanggilan Supabase lewat sini. Setiap fungsi membungkus panggilannya dalam
 * try...catch dan melempar Error berpesan ramah (Bahasa Indonesia); pemanggil (hook /
 * komponen) menampilkannya lewat toast + state galat. Detail teknis hanya ke console.
 */

function toApiError(userMessage: string, err: unknown): Error {
  if (err instanceof SupabaseConfigError) return err;
  console.error(`[api] ${userMessage}`, err);
  return new Error(`${userMessage}. Periksa koneksi internet Anda lalu coba lagi.`);
}

/* ---------- Pemetaan baris database -> tipe aplikasi ---------- */

type Row = Record<string, unknown>;

const toProduct = (r: Row): Product => ({
  id: String(r.id),
  name: String(r.name),
  category: String(r.category ?? ""),
  price: Number(r.price),
  description: String(r.description ?? ""),
  image_url: typeof r.image_url === "string" && r.image_url ? r.image_url : null,
  stock: Number(r.stock),
});

const toService = (r: Row): Service => ({
  id: String(r.id),
  name: String(r.name),
  price: Number(r.price),
  duration: Number(r.duration),
  description: String(r.description ?? ""),
  icon: typeof r.icon === "string" && r.icon ? r.icon : null,
  details: Array.isArray(r.details) ? r.details.map(String) : [],
});

/* ---------- Query ---------- */

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await requireSupabase()
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: unknown) => toProduct(r as Row));
  } catch (err) {
    throw toApiError("Gagal memuat katalog produk", err);
  }
}

export async function fetchServices(): Promise<Service[]> {
  try {
    const { data, error } = await requireSupabase()
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r: unknown) => toService(r as Row));
  } catch (err) {
    throw toApiError("Gagal memuat daftar layanan", err);
  }
}

/**
 * Simpan booking baru (status otomatis "pending"). Sengaja TANPA .select(): akses anonim
 * hanya boleh INSERT, tidak boleh membaca isi tabel bookings (berisi nomor telepon pelanggan).
 */
export async function createBooking(input: BookingInsert): Promise<void> {
  try {
    const payload: Omit<Booking, "id" | "status" | "created_at"> = {
      user_name: input.user_name,
      phone: input.phone,
      service_id: input.service_id,
      motor: input.motor,
      date: input.date,
      time: input.time,
    };
    const { error } = await requireSupabase().from("bookings").insert(payload);
    if (error) throw error;
  } catch (err) {
    throw toApiError("Gagal menyimpan booking", err);
  }
}
