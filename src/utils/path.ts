/** Hapus garis miring di akhir ("/katalog/" -> "/katalog"); "/" tetap "/". */
export const normalizePath = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, "") : path);
