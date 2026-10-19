import { create } from "zustand";
import type { CartableProduct, CartItem } from "@/types";

/**
 * Store keranjang (Zustand), satu-satunya tempat logika keranjang.
 *
 * Kenapa lebih sedikit render ulang dibanding Context:
 * - Komponen memilih potongan state lewat selector (mis. `selectTotalQty`) dan hanya render ulang bila
 *   HASIL selector berubah.
 * - Aksi (addItem, ...) berupa referensi stabil, tidak perlu useCallback.
 */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  /** Produk stok habis diabaikan; qty dibatasi stok. Produk yang sudah ada: qty dijumlahkan dan data produk disegarkan. */
  addItem: (product: CartableProduct, qty?: number) => void;
  /** qty dibatasi 0..stok. qty 0 TIDAK menghapus item (ditandai "Stok habis"); hapus lewat removeItem. */
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  /**
   * Samakan harga/stok/nama/foto dengan katalog terbaru; qty dibatasi stok terbaru; barang yang sudah tidak ada
   * di katalog dikeluarkan. Mengembalikan jumlah barang yang dikeluarkan (untuk pemberitahuan di UI).
   * Tanpa perubahan, `items` tidak diganti sehingga tidak ada render ulang.
   */
  syncProducts: (products: CartableProduct[]) => number;
  /** Isi awal dari localStorage (lihat useCartPersistence). */
  hydrate: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (product, qty = 1) => {
    if (product.stock <= 0) return;
    const { id, name, price, stock, image_url } = product;
    const items = get().items;

    if (!items.some((i) => i.id === id)) {
      set({ items: [...items, { id, name, price, stock, image_url, qty: Math.min(qty, stock) }] });
      return;
    }
    // Data produk dinamis: segarkan harga/stok item lama dengan data terbaru saat ditambah lagi.
    set({
      items: items.map((i) =>
        i.id === id ? { ...i, name, price, stock, image_url, qty: Math.min(i.qty + qty, stock) } : i
      ),
    });
  },

  setQty: (id, qty) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, qty: Math.max(0, Math.min(qty, i.stock)) } : i)),
    })),

  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  clearCart: () => set({ items: [] }),

  syncProducts: (products) => {
    const byId = new Map(products.map((p) => [p.id, p]));
    const next: CartItem[] = [];
    let changed = false;
    let removed = 0;

    for (const item of get().items) {
      const p = byId.get(item.id);
      if (!p) {
        changed = true;
        removed += 1;
        continue;
      }
      const qty = Math.min(item.qty, p.stock);
      if (
        qty !== item.qty ||
        p.price !== item.price ||
        p.stock !== item.stock ||
        p.name !== item.name ||
        p.image_url !== item.image_url
      ) {
        changed = true;
        next.push({ id: item.id, name: p.name, price: p.price, stock: p.stock, image_url: p.image_url, qty });
      } else {
        next.push(item);
      }
    }

    if (changed) set({ items: next });
    return removed;
  },

  hydrate: (items) => set({ items }),
}));

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
