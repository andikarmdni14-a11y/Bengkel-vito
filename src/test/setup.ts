import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest tanpa `globals: true` tidak membersihkan DOM otomatis antar tes.
afterEach(() => {
  cleanup();
});
