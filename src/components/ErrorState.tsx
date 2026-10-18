import { RefreshCw, TriangleAlert } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  title?: string;
}

export default function ErrorState({ message, onRetry, title = "Data gagal dimuat" }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <TriangleAlert className="h-12 w-12 text-red-600" strokeWidth={1.5} />
      <p className="text-lg font-extrabold text-slate-900">{title}</p>
      <p className="max-w-md text-sm leading-relaxed text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4" /> Coba lagi
      </button>
    </div>
  );
}
