/* Placeholder loading. Dimensi & kelasnya meniru ProductCard / ServiceCard agar tata letak tidak melompat. */

const pulse = "animate-pulse motion-reduce:animate-none";

export function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className={`aspect-square bg-slate-100 ${pulse}`} />
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className={`h-4 w-3/4 rounded bg-slate-200 ${pulse}`} />
        <div className={`mt-2 h-3 w-1/3 rounded bg-slate-100 ${pulse}`} />
        <div className={`mt-4 h-6 w-1/2 rounded bg-slate-200 ${pulse}`} />
        <div className={`mt-2 h-3 w-1/4 rounded bg-slate-100 ${pulse}`} />
        <div className="mt-auto pt-4">
          <div className={`h-11 w-full rounded-xl bg-slate-200 ${pulse}`} />
        </div>
      </div>
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div aria-hidden="true" className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm">
      <div className={`h-16 w-16 rounded-2xl bg-slate-100 ${pulse}`} />
      <div className={`mt-8 h-6 w-2/3 rounded bg-slate-200 ${pulse}`} />
      <div className="mt-4 space-y-2">
        <div className={`h-4 w-full rounded bg-slate-100 ${pulse}`} />
        <div className={`h-4 w-5/6 rounded bg-slate-100 ${pulse}`} />
        <div className={`h-4 w-2/3 rounded bg-slate-100 ${pulse}`} />
      </div>
    </div>
  );
}
