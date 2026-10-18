import { create } from "zustand";
import type { CartAction, CartableProduct, CartItem } from "@/types";
import { cartReducer } from "./cartReducer";

/**
 * Store keranjang (Zustand). Logika perubahan item tetap di `cartReducer` (murni, sudah dites) supaya
 * migrasi dari Context tidak mengubah perilaku; store hanya menjadi "rumah" state + aksi.
 *
 * Kenapa lebih sedikit render ulang dibanding Context:
 * - Komponen memilih potongan state lewat selector (mis. `selectTotalQty`), dan hanya render ulang bila
 *   HASIL selector berubah. Dengan Context, setiap komponen pemakai `useCart()` render ulang pada tiap
 *   perubahan apa pun (buka/tutup drawer, ubah qty satu item, dst.).
 * - Aksi (addItem, ...) berupa referensi stabil, tidak perlu useCallback.
 */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: CartableProduct, qty?: number) => void;
  /** qty 0 TIDAK menghapus item (ditandai "Stok habis"); hapus lewat removeItem. */
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  /** Samakan harga/stok/nama/foto dengan katalog terbaru; barang yang sudah tidak ada dikeluarkan. */
  syncProducts: (products: CartableProduct[]) => void;
  /** Isi awal dari localStorage (lihat useCartPersistence). */
  hydrate: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()((set) => {
  // Jalankan reducer; bila hasilnya referensi yang sama (tidak ada perubahan), jangan notifikasi subscriber.
  const apply = (action: CartAction) =>
    set((state) => {
      const items = cartReducer(state.items, action);
      return items === state.items ? state : { items };
    });

  return {
    items: [],
    isOpen: false,
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
    addItem: (product, qty = 1) => apply({ type: "ADD", product, qty }),
    setQty: (id, qty) => apply({ type: "SET_QTY", id, qty }),
    removeItem: (id) => apply({ type: "REMOVE", id }),
    clearCart: () => apply({ type: "CLEAR" }),
    syncProducts: (products) => apply({ type: "SYNC", products }),
    hydrate: (items) => apply({ type: "LOAD", items }),
  };
});

/* ---------- Selector turunan ----------
 * Hasilnya bilangan (primitif): komponen hanya render ulang bila angkanya berubah. JANGAN membuat selector yang
 * mengembalikan objek/array baru tiap dipanggil (di Zustand v5 itu memicu loop render); pakai `useShallow` bila perlu.
 */
export const selectTotalQty = (s: CartState): number => s.items.reduce((sum, i) => sum + i.qty, 0);
export const selectTotalPrice = (s: CartState): number => s.items.reduce((sum, i) => sum + i.qty * i.price, 0);
/** Jumlah satu produk di keranjang (0 bila belum ada). Dipakai ProductCard: hanya kartu terkait yang render ulang. */
export const selectQtyOf =
  (id: string) =>
  (s: CartState): number =>
    s.items.find((i) => i.id === id)?.qty ?? 0;
