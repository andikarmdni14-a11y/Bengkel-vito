import type { Config } from "tailwindcss";

export default {
  // Berkas tes tidak dipindai: nama kelas di dalam tes tidak boleh menambah CSS produksi.
  content: ["./index.html", "./src/**/*.{ts,tsx}", "!./src/**/*.test.{ts,tsx}", "!./src/test/**"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "Roboto", "system-ui", "sans-serif"] },
      // Efek melayang ringan untuk ilustrasi hero (dipakai: motion-safe:animate-float).
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
