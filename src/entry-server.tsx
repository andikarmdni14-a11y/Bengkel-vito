import { renderToString } from "react-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { CartProvider } from "./context/CartContext";

export interface RenderResult {
  /** Markup untuk dimasukkan ke dalam <div id="root">. */
  html: string;
  /** Tag <head> hasil <Helmet> (title, meta, link, ...) yang sudah berupa string HTML. */
  head: string;
  /** Judul halaman, dipakai skrip prerender untuk memastikan Helmet benar-benar terbaca. */
  title: string;
}

/**
 * Dipanggil oleh scripts/prerender.mjs saat build (Node, bukan browser).
 * Susunan provider harus sama dengan src/main.tsx, hanya BrowserRouter diganti StaticRouter.
 */
export function render(url: string): RenderResult {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <CartProvider>
          <App />
        </CartProvider>
      </StaticRouter>
    </HelmetProvider>
  );

  const helmet = helmetContext.helmet;
  const head = helmet
    ? [helmet.title, helmet.priority, helmet.meta, helmet.link, helmet.script, helmet.style]
        .map((tag) => tag.toString())
        .filter(Boolean)
        .join("\n    ")
    : "";

  // helmet.title.toString() -> '<title data-rh="true">...</title>'; ambil teks di dalamnya saja.
  const title = helmet?.title.toString().replace(/<[^>]*>/g, "").trim() ?? "";

  return { html, head, title };
}
