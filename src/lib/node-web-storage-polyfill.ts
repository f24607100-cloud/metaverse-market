/**
 * Node can expose a broken global `localStorage` when `--localstorage-file`
 * is set without a valid path. Next.js dev UI and other code call getItem();
 * replace with an in-memory Storage so SSR and dev server stay stable.
 */
function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.get(String(key)) ?? null;
    },
    key(index: number) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key: string) {
      map.delete(String(key));
    },
    setItem(key: string, value: string) {
      map.set(String(key), String(value));
    },
  } as Storage;
}

function isBrokenStorage(storage: unknown): boolean {
  if (storage == null) return true;
  if (typeof storage !== "object" && typeof storage !== "function") return true;
  const s = storage as Partial<Storage>;
  return typeof s.getItem !== "function" || typeof s.setItem !== "function";
}

function isEdgeRuntime(): boolean {
  // Next.js sets this global in the Edge runtime.
  return typeof (globalThis as unknown as { EdgeRuntime?: unknown }).EdgeRuntime !== "undefined";
}

function isNodeRuntime(): boolean {
  // Avoid `process.versions` so this file can be bundled for Edge safely.
  // We only need the shim in Node (dev server / SSR).
  if (typeof window !== "undefined") return false;
  if (isEdgeRuntime()) return false;
  return true;
}

export function ensureNodeWebStorageShim(): void {
  if (!isNodeRuntime()) return;
  const g = globalThis as typeof globalThis & {
    localStorage?: Storage;
    sessionStorage?: Storage;
  };
  if (!g.localStorage || isBrokenStorage(g.localStorage)) {
    g.localStorage = createMemoryStorage();
  }
  if (!g.sessionStorage || isBrokenStorage(g.sessionStorage)) {
    g.sessionStorage = createMemoryStorage();
  }
}
