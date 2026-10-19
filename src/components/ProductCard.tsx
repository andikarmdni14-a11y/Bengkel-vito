import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";
import { formatRupiah } from "../utils/format";
import Photo from "./Photo";

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem } = useCart();
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.id === product.id)?.qty ?? 0;
  const soldOut = product.stock === 0;
  const maxed = !soldOut && inCart >= product.stock;
  const lowStock = product.stock > 0 && product.stock <= 5;

  // Umpan balik singkat "Ditambahkan" setelah tombol diketuk
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1200);
    return () => clearTimeout(t);
  }, [added]);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    // id per produk: ketukan beruntun memperbarui toast yang sama, bukan menumpuk
    toast.success(`${product.name} ditambahkan ke keranjang`, { id: `cart-add-${product.id}` });
  };

  let label = "Tambah";
  if (soldOut) label = "Stok habis";
  else if (added) label = "Ditambahkan";
  else if (maxed) label = "Maks. stok";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-lg hover:shadow-slate-900/10">
      <div className="aspect-square bg-slate-100">
        <Photo src={product.image_url} alt={product.name} />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-sm font-extrabold leading-snug text-slate-900 sm:text-base">{product.name}</h3>
        <p className="mt-1 text-xs text-slate-500">{product.category}</p>
        <p className="mt-3 text-lg font-extrabold text-red-600">{formatRupiah(product.price)}</p>
        <p className={`mt-1 text-xs font-medium ${soldOut ? "text-red-600" : lowStock ? "text-amber-600" : "text-slate-500"}`}>
          {soldOut ? "Stok habis" : lowStock ? `Stok tinggal ${product.stock}` : `Stok: ${product.stock}`}
        </p>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={soldOut || (maxed && !added)}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100"
          >
            {added ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {label}
          </button>
        </div>
      </div>
    </article>
  );
}
