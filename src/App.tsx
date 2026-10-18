import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PublicLayout from "./layouts/PublicLayout";
import Beranda from "./pages/Beranda";
import Katalog from "./pages/Katalog";
import Kontak from "./pages/Kontak";
import Layanan from "./pages/Layanan";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      {/* Umpan balik visual (sukses / gagal / keranjang) menggantikan alert() bawaan browser */}
      <Toaster position="top-center" toastOptions={{ duration: 3500, style: { fontSize: "14px" } }} />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Beranda />} />
          <Route path="layanan" element={<Layanan />} />
          <Route path="katalog" element={<Katalog />} />
          <Route path="kontak" element={<Kontak />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}
