import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest tanpa `globals: true` tidak membersihkan DOM otomatis antar tes.
afterEach(() => {
  cleanup();
});

// jsdom tidak mengimplementasikan API berikut; komponen proyek memakainya (PublicLayout, Reveal/useInView).
window.scrollTo = () => undefined;

if (!("IntersectionObserver" in window)) {
  class IntersectionObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { value: IntersectionObserverStub, configurable: true });
}
