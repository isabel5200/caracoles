import assert from "node:assert/strict";
import { beforeEach, it } from "node:test";
import type { AuthSession } from "../src/types/auth.types.js";
import { loadSession, saveSession } from "../src/utils/storage.js";

const items = new Map<string, string>();
const memoryStorage: Storage = {
  clear: () => items.clear(),
  getItem: (key) => items.get(key) ?? null,
  key: (index) => [...items.keys()][index] ?? null,
  removeItem: (key) => {
    items.delete(key);
  },
  setItem: (key, value) => {
    items.set(key, value);
  },
  get length() {
    return items.size;
  },
};

Object.defineProperty(globalThis, "localStorage", {
  value: memoryStorage,
  configurable: true,
});

beforeEach(() => {
  localStorage.clear();
});

it("should save and restore session from localStorage", () => {
  const session: AuthSession = {
    user: {
      id: "1",
      fullName: "Isa Lovera",
      email: "isa@example.com",
    },
    token: "test-token",
    balance: 1000,
  };

  saveSession(session);

  assert.deepEqual(loadSession(), session);
});
