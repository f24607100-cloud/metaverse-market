import { ensureNodeWebStorageShim } from "@/lib/node-web-storage-polyfill";

export function register() {
  ensureNodeWebStorageShim();
}
