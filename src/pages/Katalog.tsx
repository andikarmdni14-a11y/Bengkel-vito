import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import ErrorState from "../components/ErrorState";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import Seo from "../components/Seo";
import { ProductCardSkeleton } from "../components/Skeletons";
import { useProducts } from "../hooks/useProducts";

const ALL = "Semua";

// Grid katalog: 2 kolom di HP, 3 di tablet, 4 di desktop. Jarak antarkartu dilebarkan bertahap agar tetap lega.
const GRID =
  "mt-10 grid grid-cols-2 gap-x-3 gap-y-6 sm:mt-12 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10";

const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900";

export default function Katalog() {
  const { products, loading, error, refetch } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);

  // Kategori diturunkan dari data produk (urutan kemunculan pertama), bukan daftar hardcode.
  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );
  // Jika kategori terpilih hilang setelah data dimuat ulang, kembali ke "Semua".
  const activeCategory = categories.includes(category) ? category : ALL;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (activeCategory === ALL || p.category === activeCategory) && (!q || p.name.toLowerCase().includes(q))
    );
  }, [products, query, activeCategory]);

  const resetFilter = () => {
    setQuery("");
    setCategory(ALL);
  };

  return (
    // Latar putih (bukan slate-50 milik layout) supaya kartu off-white #F5F5F5 terpisah jelas dari halaman.
    // min-h: tinggi layar dikurangi navbar (h-16), agar hasil filter yang sedikit tidak memperlihatkan pita abu di bawah.
    <div className="min-h-[calc(100dvh-4rem)] bg-white">
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-16">
        <Seo
          title="Katalog Sparepart & Aksesoris Motor | FitoMotor"
          description="Katalog ban motor, helm, oli, kampas rem, dan aksesoris di FitoMotor. Cek harga & stok, lalu pesan cepat lewat WhatsApp."
        />
        <Reveal>
          <SectionHead
            as="h1"
            title="Sparepart & Aksesoris Original"
            desc="Stok siap ambil di bengkel. Pesan cepat lewat WhatsApp, kami siapkan sebelum Anda tiba."
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-10 space-y-5">
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari ban, helm, oli..."
                aria-label="Cari produk"
                className="h-12 w-full rounded-full bg-neutral-100 pl-12 pr-5 text-base text-neutral-900 outline-none transition placeholder:text-neutral-500 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-neutral-900"
              />
            </div>

            {/* Mobile: chip bisa digeser; layar lebih lebar: turun baris */}
            <div
              role="group"
              aria-label="Filter kategori"
              className="-mx-5 flex gap-2 overflow-x-auto px-5 py-1 sm:mx-0 sm:flex-wrap sm:px-0"
            >
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={activeCategory === c}
                  className={`h-11 shrink-0 rounded-full px-5 text-sm font-medium transition-colors ${FOCUS} ${
                    activeCategory === c
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {error ? (
          <ErrorState title="Katalog gagal dimuat" message={error} onRetry={refetch} />
        ) : loading ? (
          <div className={GRID} aria-busy="true">
            <span role="status" className="sr-only">
              Memuat produk...
            </span>
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-base font-semibold text-neutral-900">Produk tidak ditemukan</p>
            <p className="mt-2 text-sm text-neutral-600">Coba kata kunci lain atau tampilkan semua kategori.</p>
            <button
              type="button"
              onClick={resetFilter}
              className={`mt-6 inline-flex h-11 items-center rounded-full bg-neutral-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-red-600 ${FOCUS}`}
            >
              Tampilkan semua produk
            </button>
          </div>
        ) : (
          <div className={GRID}>
            {filtered.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 60} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
