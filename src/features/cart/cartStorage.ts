import type { CartItem } from "@/types";

// v2: id produk kini berasal dari database (uuid), jadi keranjang lama (id "p1", ...) tidak dipakai lagi.
// Format di localStorage tetap array CartItem polos, jadi keranjang pengunjung lama tetap terbaca setelah migrasi ke Zustand.
export const CART_STORAGE_KEY = "fitomotor:cart:v2";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export const isCartItem = (x: unknown): x is CartItem => {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.stock === "number" &&
    typeof o.qty === "number" &&
    (typeof o.image_url === "string" || o.image_url === null)
  );
};

/** Baca keranjang tersimpan. Data rusak / tidak valid -> keranjang kosong (tidak pernah melempar galat). */
export function loadCart(storage: ReadableStorage = localStorage): CartItem[] {
  try {
    const saved: unknown = JSON.parse(storage.getItem(CART_STORAGE_KEY) ?? "null");
    return Array.isArray(saved) ? saved.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

/** Simpan keranjang. Penyimpanan penuh / mode privat: diabaikan (keranjang tetap jalan di memori). */
export function saveCart(items: readonly CartItem[], storage: WritableStorage = localStorage): void {
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* penyimpanan penuh / mode privat: abaikan */
  }
}
