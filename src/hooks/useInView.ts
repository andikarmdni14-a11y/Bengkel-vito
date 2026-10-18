import { useCallback, useRef, useState } from "react";

/**
 * Satu IntersectionObserver dipakai bersama oleh semua elemen (lebih hemat daripada satu per elemen,
 * penting untuk katalog dengan puluhan kartu). Elemen berhenti diamati begitu terlihat: animasi hanya sekali.
 */
const listeners = new Map<Element, () => void>();
let observer: IntersectionObserver | undefined;

function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const onVisible = listeners.get(entry.target);
          if (!onVisible) continue;
          listeners.delete(entry.target);
          observer?.unobserve(entry.target);
          onVisible();
        }
      },
      // Picu sedikit sebelum elemen benar-benar masuk (6% dari bawah layar), supaya terasa natural.
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
  }
  return observer;
}

function watch(node: Element, onVisible: () => void): void {
  listeners.set(node, onVisible);
  getObserver().observe(node);
}

function unwatch(node: Element): void {
  listeners.delete(node);
  observer?.unobserve(node);
}

/** Mengembalikan [ref, inView]. `inView` menjadi true satu kali saat elemen pertama kali terlihat. */
export function useInView<T extends Element>(): [(node: T | null) => void, boolean] {
  const [inView, setInView] = useState(false);
  const nodeRef = useRef<T | null>(null);

  const ref = useCallback((node: T | null) => {
    if (nodeRef.current) {
      unwatch(nodeRef.current);
      nodeRef.current = null;
    }
    if (!node) return;
    // Peramban tanpa IntersectionObserver: langsung tampil, jangan sampai konten tersembunyi selamanya.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    nodeRef.current = node;
    watch(node, () => setInView(true));
  }, []);

  return [ref, inView];
}
