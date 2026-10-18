export const formatRupiah = (n: number | string): string => "Rp" + Number(n).toLocaleString("id-ID");

// 6281234567890 -> +62 812-3456-7890
export const formatPhone = (n: string): string =>
  "+" + String(n).replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/, "$1 $2-$3-$4");
