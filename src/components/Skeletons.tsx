/* Placeholder loading. Dimensi & kelasnya meniru ProductCard / ServiceCard agar tata letak tidak melompat. */

const pulse = "animate-pulse motion-reduce:animate-none";

export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col rounded-xl bg-neutral-100 p-4 sm:p-5">
      <div className="relative aspect-square">
        <div className={`absolute inset-x-0 top-0 bottom-[12%] m-3 rounded-lg bg-neutral-200/70 sm:m-5 ${pulse}`} />
      </div>
      <div className="mt-5 flex flex-1 flex-col">
        <div className={`h-5 w-3/4 rounded bg-neutral-200 ${pulse}`} />
        <div className={`mt-2 h-3 w-1/3 rounded bg-neutral-200/70 ${pulse}`} />
        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <div className={`h-5 w-24 rounded bg-neutral-200 ${pulse}`} />
            <div className={`mt-2 h-3 w-14 rounded bg-neutral-200/70 ${pulse}`} />
          </div>
          <div className={`h-11 w-11 rounded-full bg-neutral-200 ${pulse}`} />
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
