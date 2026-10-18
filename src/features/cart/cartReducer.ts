import type { CartAction, CartItem } from "@/types";

/** Reducer murni keranjang (tanpa React) supaya mudah dites. */
export function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const { product, qty } = action;
      if (product.stock <= 0) return items;
      const exists = items.some((i) => i.id === product.id);
      if (!exists) {
        const { id, name, price, stock, image_url } = product;
        return [...items, { id, name, price, stock, image_url, qty: Math.min(qty, stock) }];
      }
      // Data produk kini dinamis: segarkan harga/stok item lama dengan data terbaru saat ditambah lagi.
      return items.map((i) =>
        i.id === product.id
          ? {
              ...i,
              name: product.name,
              price: product.price,
              stock: product.stock,
              image_url: product.image_url,
              qty: Math.min(i.qty + qty, product.stock),
            }
          : i
      );
    }
    case "SET_QTY":
      // qty 0 TIDAK menghapus item: tetap ada di keranjang dan ditandai "Stok habis".
      // Hapus item hanya lewat aksi REMOVE (tombol tempat sampah).
      return items.map((i) =>
        i.id === action.id ? { ...i, qty: Math.max(0, Math.min(action.qty, i.stock)) } : i
      );
    case "SYNC": {
      // Samakan isi keranjang dengan data katalog terbaru: harga, stok, nama, foto.
      // Barang yang sudah tidak ada di katalog dikeluarkan; qty dibatasi stok terbaru.
      const byId = new Map(action.products.map((p) => [p.id, p]));
      let changed = false;
      const next: CartItem[] = [];
      for (const item of items) {
        const p = byId.get(item.id);
        if (!p) {
          changed = true;
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
      return changed ? next : items; // referensi sama bila tidak ada perubahan -> tanpa render ulang
    }
    case "LOAD":
      // Isi awal dari localStorage, dipanggil sekali setelah mount (lihat useCartPersistence).
      return action.items;
    case "REMOVE":
      return items.filter((i) => i.id !== action.id);
    case "CLEAR":
      return [];
    default:
      return items;
  }
}
