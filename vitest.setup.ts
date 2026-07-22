import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
