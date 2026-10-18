/** Jeda animasi berurutan: item ke-i tertunda i*step ms, dibatasi `cap` langkah agar item di bawah tidak menunggu lama. */
export const stagger = (index: number, step = 90, cap = 5): number => Math.min(index, cap) * step;
