import { useEffect, useRef } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { selectTotalPrice, selectTotalQty, useCartStore } from "./cartStore";
import { formatRupiah } from "@/utils/format";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import Photo from "@/components/ui/Photo";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900";

/**
 * Panel keranjang yang meluncur dari sisi kanan layar (di semua ukuran layar).
 * Dibuka otomatis saat produk ditambahkan (lihat ProductCard), jadi pembeli tidak berpindah halaman.
 * Di HP, panel menyisakan strip overlay di kiri; ketuk strip itu untuk menutup.
 */
export default function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const totalQty = useCartStore(selectTotalQty);
  const totalPrice = useCartStore(selectTotalPrice);
  // Aksi bersifat stabil; useShallow membuat objek hasil selector tidak dianggap "baru" tiap render.
  const { closeCart, setQty, removeItem, clearCart } = useCartStore(
    useShallow((s) => ({ closeCart: s.closeCart, setQty: s.setQty, removeItem: s.removeItem, clearCart: s.clearCart }))
  );
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    // Saat tertutup, isi panel tidak boleh bisa difokus lewat keyboard / pembaca layar
    if (panel) panel.inert = !isOpen;
    if (!isOpen) return;

    // Simpan elemen pemicu (mis. tombol keranjang di kartu) untuk dikembalikan fokusnya saat panel ditutup
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // kunci scroll halaman di belakang
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [isOpen, closeCart]);

  return (
    <div className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-neutral-900/40 transition-opacity duration-300 motion-reduce:transition-none ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        className={`absolute inset-y-0 right-0 flex w-[calc(100%-3rem)] max-w-[26rem] flex-col bg-white shadow-2xl outline-none transition-transform duration-300 ease-out motion-reduce:transition-none ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900">
            Keranjang <span className="font-normal text-neutral-500">({totalQty})</span>
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Tutup keranjang"
            className={`grid h-11 w-11 place-items-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 ${FOCUS}`}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center text-neutral-600">
            <ShoppingBag className="h-12 w-12 text-neutral-300" strokeWidth={1.5} />
            <p>Keranjang masih kosong.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-neutral-100 overflow-y-auto px-5">
              {items.map((item) => {
                const habis = item.qty === 0;
                return (
                  <li key={item.id} className="flex gap-4 py-5">
                    <div className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 p-2 ${habis ? "opacity-50" : ""}`}>
                      <Photo
                        src={item.image_url}
                        alt={item.name}
                        fit="contain"
                        bare
                        iconClass="h-7 w-7"
                        className="mix-blend-multiply"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`line-clamp-2 text-sm font-semibold leading-snug ${habis ? "text-neutral-400" : "text-neutral-900"}`}>
                        {item.name}
                      </p>
                      {habis ? (
                        <p className="mt-0.5 text-sm font-medium text-neutral-700">Stok habis</p>
                      ) : (
                        <p className="mt-0.5 text-sm tabular-nums text-neutral-600">{formatRupiah(item.price)}</p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-full bg-neutral-100">
                          <button
                            type="button"
                            onClick={() => setQty(item.id, item.qty - 1)}
                            disabled={habis}
                            aria-label={`Kurangi ${item.name}`}
                            className={`grid h-10 w-10 place-items-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent ${FOCUS}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.id, item.qty + 1)}
                            disabled={item.qty >= item.stock}
                            aria-label={`Tambah ${item.name}`}
                            className={`grid h-10 w-10 place-items-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent ${FOCUS}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Hapus ${item.name}`}
                          className={`grid h-10 w-10 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-red-600 ${FOCUS}`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3 border-t border-neutral-100 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Total</span>
                <span className="text-xl font-semibold tabular-nums text-neutral-900">{formatRupiah(totalPrice)}</span>
              </div>

              {/* <a> (bukan window.open) agar tidak diblokir pop-up blocker di Safari iOS */}
              {totalQty > 0 ? (
                <a
                  href={buildWhatsAppUrl(items, totalPrice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-900 text-sm font-semibold text-white transition-colors hover:bg-red-600 ${FOCUS}`}
                >
                  <WhatsAppIcon className="h-5 w-5" /> Beli via WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-neutral-200 text-sm font-semibold text-neutral-400"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Beli via WhatsApp
                </button>
              )}
              <button
                type="button"
                onClick={clearCart}
                className={`h-10 w-full text-sm font-medium text-neutral-600 transition-colors hover:text-red-600 ${FOCUS}`}
              >
                Kosongkan keranjang
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
