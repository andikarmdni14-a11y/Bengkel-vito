import type { AppPages } from "../App";
import Beranda from "./Beranda";
import Katalog from "./Katalog";
import Kontak from "./Kontak";
import Layanan from "./Layanan";
import NotFound from "./NotFound";

/** Halaman untuk PRERENDER / SSR: import biasa agar renderToString menghasilkan HTML lengkap. */
export const eagerPages: AppPages = { Beranda, Layanan, Katalog, Kontak, NotFound };
