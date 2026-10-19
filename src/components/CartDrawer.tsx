import { useEffect, useRef } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatRupiah } from "../utils/format";
import { buildWhatsAppUrl } from "../utils/whatsapp";
import Photo from "./Photo";
import WhatsAppIcon from "./WhatsAppIcon";

/** Bottom sheet di mobile, side drawer dari kanan di layar >= md. */
export default function CartDrawer() {
  const { items, isOpen, closeCart, setQty, removeItem, clearCart, totalQty, totalPrice } = useCart();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    // Saat tertutup, isi panel tidak boleh bisa difokus lewat keyboard / pembaca layar
    if (panel) panel.inert = !isOpen;
    if (!isOpen) return;

    panel?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // kunci scroll halaman di belakang
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  return (
    <div className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 motion-reduce:transition-none ${
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
        className={`absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white shadow-2xl outline-none transition-transform duration-300 motion-reduce:transition-none md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[420px] md:rounded-none ${
          isOpen ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-lg font-extrabold text-slate-900">Keranjang ({totalQty})</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Tutup keranjang"
            className="grid h-11 w-11 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center text-slate-500">
            <ShoppingBag className="h-12 w-12 text-slate-300" strokeWidth={1.5} />
            <p>Keranjang masih kosong.</p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-5">
              {items.map((item) => {
                const habis = item.qty === 0;
                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 ${habis ? "opacity-50" : ""}`}>
                      <Photo src={item.image_url} alt={item.name} iconClass="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`line-clamp-2 text-sm font-extrabold leading-snug ${habis ? "text-slate-400" : "text-slate-900"}`}>
                        {item.name}
                      </p>
                      {habis ? (
                        <p className="mt-0.5 text-sm font-semibold text-red-600">Stok habis</p>
                      ) : (
                        <p className="mt-0.5 text-sm text-slate-500">{formatRupiah(item.price)}</p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setQty(item.id, item.qty - 1)}
                            disabled={habis}
                            aria-label={`Kurangi ${item.name}`}
                            className="grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(item.id, item.qty + 1)}
                            disabled={item.qty >= item.stock}
                            aria-label={`Tambah ${item.name}`}
                            className="grid h-10 w-10 place-items-center rounded-full text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Hapus ${item.name}`}
                          className="grid h-10 w-10 place-items-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3 border-t border-slate-100 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total</span>
                <span className="text-xl font-extrabold text-slate-900">{formatRupiah(totalPrice)}</span>
              </div>

              {/* <a> (bukan window.open) agar tidak diblokir pop-up blocker di Safari iOS */}
              {totalQty > 0 ? (
                <a
                  href={buildWhatsAppUrl(items, totalPrice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-semibold text-white transition hover:bg-green-700"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Beli via WhatsApp
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 text-sm font-semibold text-slate-400"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Beli via WhatsApp
                </button>
              )}
              <button
                type="button"
                onClick={clearCart}
                className="h-10 w-full text-sm font-medium text-slate-500 transition hover:text-red-600"
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
