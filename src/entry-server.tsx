import { Writable } from "node:stream";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderToPipeableStream } from "react-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { StaticRouter } from "react-router-dom";
import App from "./App";
import { createQueryClient } from "./lib/queryClient";

export interface RenderResult {
  /** Markup untuk dimasukkan ke dalam <div id="root">. */
  html: string;
  /** Tag <head> hasil <Helmet> (title, meta, link, ...) yang sudah berupa string HTML. */
  head: string;
  /** Judul halaman, dipakai skrip prerender untuk memastikan Helmet benar-benar terbaca. */
  title: string;
}

/** Batas waktu render satu route. Bila ada halaman lazy yang tak kunjung selesai, build gagal (bukan menggantung). */
const RENDER_TIMEOUT_MS = 15_000;

/**
 * Dipanggil oleh scripts/prerender.mjs saat build (Node, bukan browser).
 * Susunan provider harus sama dengan src/main.tsx, hanya BrowserRouter diganti StaticRouter.
 *
 * Memakai renderToPipeableStream + onAllReady (bukan renderToString) karena halaman dimuat lewat React.lazy:
 * onAllReady menunggu semua chunk halaman selesai, sehingga HTML berisi halaman lengkap, bukan fallback Suspense.
 * Galat di dalam batas Suspense TIDAK boleh diam-diam menjadi "render ulang di klien": di sini ia membuat build gagal.
 */
export function render(url: string): Promise<RenderResult> {
  return new Promise<RenderResult>((resolve, reject) => {
    const helmetContext: { helmet?: HelmetServerState } = {};
    // QueryClient BARU per render: cache tidak boleh dipakai bersama antar route. Render server tidak menjalankan
    // efek, jadi tidak ada fetch; query berstatus "pending" sehingga markup = skeleton, sama dengan render awal klien.
    const queryClient = createQueryClient();

    const chunks: Buffer[] = [];
    const sink = new Writable({
      write(chunk: Buffer | string, _encoding, done) {
        chunks.push(Buffer.from(chunk));
        done();
      },
    });

    let failure: unknown;
    const timer = setTimeout(() => {
      failure ??= new Error(`Render ${url} melebihi ${RENDER_TIMEOUT_MS} ms (ada halaman yang tidak selesai dimuat?)`);
      abort();
    }, RENDER_TIMEOUT_MS);

    const { pipe, abort } = renderToPipeableStream(
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </QueryClientProvider>
      </HelmetProvider>,
      {
        onAllReady() {
          pipe(sink);
        },
        onShellError(error) {
          clearTimeout(timer);
          reject(error);
        },
        onError(error) {
          failure ??= error;
        },
      }
    );

    sink.on("finish", () => {
      clearTimeout(timer);
      // Hapus cache + timer GC (gcTime 5 menit) milik QueryClient ini. Tanpa ini proses Node prerender baru
      // berhenti ~5 menit setelah semua route selesai, karena timer tersebut menahan event loop.
      queryClient.clear();
      if (failure !== undefined) {
        reject(failure instanceof Error ? failure : new Error(String(failure)));
        return;
      }

      const helmet = helmetContext.helmet;
      const head = helmet
        ? [helmet.title, helmet.priority, helmet.meta, helmet.link, helmet.script, helmet.style]
            .map((tag) => tag.toString())
            .filter(Boolean)
            .join("\n    ")
        : "";

      // helmet.title.toString() -> '<title data-rh="true">...</title>'; ambil teks di dalamnya saja.
      const title = helmet?.title.toString().replace(/<[^>]*>/g, "").trim() ?? "";

      resolve({ html: Buffer.concat(chunks).toString("utf8"), head, title });
    });
  });
}
