/** Tipe domain utama. Nama field sama dengan kolom tabel Supabase (snake_case). */

export interface Product {
  id: string;
  name: string;
  /** Dipakai filter chip di halaman Katalog. */
  category: string;
  /** Harga dalam Rupiah (bilangan bulat). */
  price: number;
  description: string;
  image_url: string | null;
  stock: number;
}

export interface Service {
  id: string;
  name: string;
  /** Harga/tarif dasar dalam Rupiah (bilangan bulat). */
  price: number;
  /** Estimasi durasi pengerjaan dalam menit. */
  duration: number;
  description: string;
  /** Kunci ikon (lihat components/serviceIcons.ts), mis. "wrench". */
  icon: string | null;
  /** Poin-poin rincian layanan yang tampil di halaman Layanan. */
  details: string[];
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  user_name: string;
  phone: string;
  service_id: string;
  motor: string;
  /** Format YYYY-MM-DD. */
  date: string;
  /** Format HH:mm. */
  time: string;
  status: BookingStatus;
  created_at?: string;
}

/** Data yang dikirim klien saat membuat booking. id, status, created_at diisi database. */
export type BookingInsert = Omit<Booking, "id" | "status" | "created_at">;

/** Bahan baku pesan WhatsApp untuk booking. */
export interface BookingMessageInput {
  name: string;
  phone: string;
  motor: string;
  date: string;
  time: string;
  service: string;
}

/* ---------- Keranjang ---------- */

export type CartableProduct = Pick<Product, "id" | "name" | "price" | "stock" | "image_url">;

export interface CartItem extends CartableProduct {
  qty: number;
}

export type CartAction =
  | { type: "ADD"; product: CartableProduct; qty: number }
  | { type: "SET_QTY"; id: string; qty: number }
  | { type: "REMOVE"; id: string }
  | { type: "SYNC"; products: CartableProduct[] }
  | { type: "LOAD"; items: CartItem[] }
  | { type: "CLEAR" };

/* ---------- Konfigurasi situs ---------- */

export interface NavLinkItem {
  to: string;
  label: string;
  end?: boolean;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  waNumber: string;
  address: string[];
  hours: [string, string];
  mapsUrl: string;
  mapEmbedUrl: string;
  heroImage: string;
}
