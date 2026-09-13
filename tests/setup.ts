import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation for all tests
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock crypto for Node.js test environment
if (typeof globalThis.crypto === "undefined") {
  const { webcrypto } = await import("crypto");
  globalThis.crypto = webcrypto as Crypto;
}
