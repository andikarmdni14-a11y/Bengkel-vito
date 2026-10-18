import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productsQueryOptions } from "@/queries/products";
import { loadCart, saveCart } from "./cartStorage";
import { useCartStore } from "./cartStore";

/**
 * Simpan keranjang ke localStorage.
 *
 * Store SELALU mulai kosong (sama dengan HTML hasil prerender), lalu diisi dari localStorage setelah mount.
 * Membaca localStorage saat store dibuat akan membuat render pertama klien berbeda dari HTML server
 * (badge jumlah barang) -> hydration mismatch bagi pengunjung yang keranjangnya sudah terisi.
 * Langganan penyimpanan dipasang SETELAH pemulihan, supaya keranjang tersimpan tidak tertimpa [].
 */
export function useCartPersistence(): void {
  useEffect(() => {
    useCartStore.getState().hydrate(loadCart());
    return useCartStore.subscribe((state, prev) => {
      if (state.items !== prev.items) saveCart(state.items);
    });
  }, []);
}

/**
 * Harga & stok di keranjang adalah salinan saat barang ditambahkan. Karena katalog dinamis, segarkan
 * setiap kali keranjang dibuka. fetchQuery memakai cache TanStack Query (staleTime 60 dtk), jadi hemat request.
 */
export function useCartPriceSync(): void {
  const queryClient = useQueryClient();
  const isOpen = useCartStore((s) => s.isOpen);

  useEffect(() => {
    if (!isOpen || useCartStore.getState().items.length === 0) return;
    let active = true;

    queryClient
      .fetchQuery(productsQueryOptions)
      .then((products) => {
        if (!active) return;
        const { items, syncProducts } = useCartStore.getState(); // isi keranjang TERBARU, bukan saat efek dipasang
        const removed = items.filter((i) => !products.some((p) => p.id === i.id)).length;
        syncProducts(products);
        if (removed > 0) {
          toast(`${removed} barang sudah tidak tersedia dan dikeluarkan dari keranjang`, { id: "cart-sync" });
        }
      })
      .catch((err: unknown) => {
        // Gagal sinkron bukan kendala bagi pembeli: stok final tetap dikonfirmasi admin via WhatsApp.
        console.warn("[cart] sinkronisasi harga/stok dilewati:", err);
      });

    return () => {
      active = false;
    };
  }, [isOpen, queryClient]);
}
