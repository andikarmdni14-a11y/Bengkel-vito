/** Tanggal hari ini format YYYY-MM-DD menurut zona waktu perangkat (bukan UTC). */
export const todayISO = (): string => new Date().toLocaleDateString("en-CA");
