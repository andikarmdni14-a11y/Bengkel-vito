import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  ssr: {
    // react-helmet-async hanya dikirim sebagai CommonJS untuk Node, sehingga `import { Helmet }` gagal
    // saat prerender. Dengan noExternal, Vite ikut membundelnya (memakai build ESM-nya).
    noExternal: ["react-helmet-async"],
  },
});
