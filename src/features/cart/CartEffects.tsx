import { useCartPersistence, useCartPriceSync } from "./useCartEffects";

/** Komponen tanpa tampilan: menjalankan efek samping keranjang (simpan ke localStorage, sinkron harga/stok). */
export default function CartEffects() {
  useCartPersistence();
  useCartPriceSync();
  return null;
}
