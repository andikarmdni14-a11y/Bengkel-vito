import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { selectQtyOf, useCartStore } from "../features/cart/cartStore";
import type { Product } from "../types";
import { formatRupiah } from "../utils/format";
import Photo from "./Photo";

/**
 * Kartu produk gaya Scandinavian: satu permukaan off-white (#F5F5F5) tanpa border dan tanpa shadow.
 *
 * Gambar: produk (idealnya PNG transparan, rasio ~1:1) "melayang" di atas garis lantai dengan bayangan
 * kontak elips yang lembut. Saat kartu di-hover, produk terangkat sedikit dan bayangannya mengecil.
 * `mix-blend-multiply` membuat foto ber-latar putih (JPG) tetap menyatu dengan permukaan kartu.
 *
 * Tombol: bulat, charcoal. Merah FitoMotor hanya muncul sebagai aksen saat hover.
 * Menambah produk langsung membuka panel keranjang (CartDrawer) dari kanan.
 */
export default function ProductCard({ product }: { product: Product }) {
  // Hanya kartu yang jumlahnya berubah yang render ulang (dulu: semua kartu tiap isi keranjang berubah).
  const inCart = useCartStore(selectQtyOf(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [added, setAdded] = useState(false);

  const soldOut = product.stock === 0;
  const maxed = !soldOut && inCart >= product.stock;
  const lowStock = product.stock > 0 && product.stock <= 5;

  // Ikon centang singkat setelah tombol ditekan (terlihat saat panel keranjang ditutup kembali)
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(t);
  }, [added]);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    openCart();
  };

  const addLabel = soldOut
    ? `${product.name}, stok habis`
    : maxed && !added
      ? `${product.name}, jumlah di keranjang sudah mencapai stok`
      : `Tambah ${product.name} ke keranjang`;

  return (
    <article className="group flex h-full flex-col rounded-xl bg-neutral-100 p-4 sm:p-5">
      {/* Panggung gambar: area luas, produk di atas, "lantai" di bawah */}
      <div className="relative aspect-square">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[7%] left-1/2 h-3 w-[46%] -translate-x-1/2 rounded-[50%] bg-neutral-900/25 blur-md transition duration-500 ease-out group-hover:scale-x-75 group-hover:opacity-60 motion-reduce:transition-none"
        />
        <div
          className={`absolute inset-x-0 top-0 bottom-[12%] p-3 mix-blend-multiply transition-transform duration-500 ease-out group-hover:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:p-5 ${
            soldOut ? "opacity-50" : ""
          }`}
        >
          <Photo src={product.image_url} alt={product.name} fit="contain" bare iconClass="h-14 w-14" />
        </div>
      </div>

      <div className="mt-5 flex flex-1 flex-col">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-neutral-900 sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-neutral-600">{product.category}</p>

        {/* Harga + stok di kiri, tombol bulat di kanan bawah. flex-wrap: di layar sempit tombol turun ke baris sendiri */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3 pt-6">
          <div>
            <p className="text-base font-semibold tabular-nums text-neutral-900 sm:text-lg">
              {formatRupiah(product.price)}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-600">
              {/* Indikator stok halus: titik kecil, bukan warna peringatan. Maknanya tetap dibawa oleh teks. */}
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${
                  soldOut ? "border border-neutral-400" : lowStock ? "bg-neutral-900" : "bg-neutral-400"
                }`}
              />
              {soldOut ? "Stok habis" : lowStock ? `Stok tinggal ${product.stock}` : `Stok ${product.stock}`}
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || (maxed && !added)}
            aria-label={addLabel}
            title={addLabel}
            className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-full bg-neutral-900 text-white transition-colors duration-200 hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:active:scale-100"
          >
            {added ? <Check className="h-5 w-5" aria-hidden="true" /> : <ShoppingBag className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </article>
  );
}
