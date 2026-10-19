/**
 * Prerender statis: dijalankan setelah `vite build` (klien) dan `vite build --ssr` (server).
 * Untuk tiap route, render React ke HTML lewat dist-ssr/entry-server, lalu tulis ke dist/<route>/index.html
 * lengkap dengan <title>/<meta> hasil <Helmet>. Tidak butuh browser headless (Puppeteer/Chromium).
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Route publik statis yang di-prerender. Tambahkan di sini bila ada halaman baru.
const ROUTES = ["/", "/layanan", "/katalog", "/kontak"];

const root = fileURLToPath(new URL("..", import.meta.url));
const distDir = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");

const fail = (message) => {
  console.error(`\n[prerender] GAGAL: ${message}\n`);
  process.exit(1);
};

const ssrEntry = ["entry-server.js", "entry-server.mjs"].map((f) => path.join(ssrDir, f)).find(existsSync);
if (!ssrEntry) fail("dist-ssr/entry-server.js tidak ditemukan. Jalankan `npm run build:server` dulu.");
if (!existsSync(path.join(distDir, "index.html"))) fail("dist/index.html tidak ditemukan. Jalankan `npm run build:client` dulu.");

const { render } = await import(pathToFileURL(ssrEntry).href);

// Template klien dibaca SEKALI ke memori: dist/index.html akan ditimpa oleh hasil prerender route "/".
const template = await readFile(path.join(distDir, "index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) fail('Template tidak memuat `<div id="root"></div>` persis.');

/** Susun HTML final: buang <title>/<meta description> bawaan template (diganti milik Helmet), sisipkan markup. */
function buildPage({ html, head }, routePath) {
  const prerenderAttr = routePath === null ? "" : ` data-prerender-path="${routePath}"`;
  return (
    template
      .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
      .replace(/<meta\s+name="description"[^>]*>\s*/i, "")
      // Pakai fungsi (bukan string) agar karakter "$" di dalam html/head tidak ditafsirkan sebagai pola replace.
      .replace("</head>", () => `    ${head}\n  </head>`)
      .replace('<div id="root"></div>', () => `<div id="root"${prerenderAttr}>${html}</div>`)
  );
}

const outFile = (routePath) => {
  const file =
    routePath === "/" ? path.join(distDir, "index.html") : path.join(distDir, routePath.replace(/^\//, ""), "index.html");
  // Jangan pernah menulis di luar dist/ (mis. bila ROUTES kelak diisi dari sumber yang tidak tepercaya).
  if (!path.resolve(file).startsWith(distDir + path.sep)) fail(`Route ${routePath} mengarah ke luar dist/.`);
  return file;
};

for (const route of ROUTES) {
  const result = await render(route); // async: menunggu chunk halaman lazy (lihat src/entry-server.tsx)
  if (!result.title) fail(`Route ${route}: <title> dari Helmet kosong (pastikan halaman memakai <Seo />).`);
  if (!result.html.includes("<h1")) fail(`Route ${route}: markup tidak memuat <h1>, render kemungkinan gagal.`);

  const file = outFile(route);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, buildPage(result, route), "utf8");
  console.log(`[prerender] ${route.padEnd(10)} -> ${path.relative(root, file)}  |  ${result.title}`);
}

// 404.html: halaman NotFound (noindex). Dipakai otomatis oleh Netlify, Cloudflare Pages, GitHub Pages, dll.
// untuk alamat tak dikenal, dengan status 404 yang benar. Tanpa data-prerender-path, klien selalu render ulang.
const notFound = await render("/halaman-tidak-ada");
await writeFile(path.join(distDir, "404.html"), buildPage(notFound, null), "utf8");
console.log(`[prerender] 404        -> dist/404.html  |  ${notFound.title}`);
