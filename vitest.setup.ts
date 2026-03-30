import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import * as React from "react";
import { afterEach, vi } from "vitest";

const lsStore = new Map<string, string>();

const mockLocalStorage = {
  getItem: (key: string) => (lsStore.has(key) ? lsStore.get(key)! : null),
  setItem: (key: string, value: string) => {
    lsStore.set(key, value);
  },
  removeItem: (key: string) => {
    lsStore.delete(key);
  },
  clear: () => {
    lsStore.clear();
  },
  get length() {
    return lsStore.size;
  },
  key: (index: number) => Array.from(lsStore.keys())[index] ?? null,
};

Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

afterEach(() => {
  cleanup();
  lsStore.clear();
});

vi.mock("framer-motion", () => {
  const motion = new Proxy(
    {},
    {
      get(_, tag: string) {
        const Tag = tag as keyof React.JSX.IntrinsicElements;
        return ({
          children,
          ...props
        }: React.PropsWithChildren<Record<string, unknown>>) =>
          React.createElement(Tag, props as never, children);
      },
    }
  );
  return {
    motion,
    LayoutGroup: ({ children }: { children: React.ReactNode }) => children,
    AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
      children ?? null,
  };
});
