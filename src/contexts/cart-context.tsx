"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/lib/cart-types";
import { CART_STORAGE_KEY } from "@/lib/cart-types";

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is CartItem =>
        row != null &&
        typeof row === "object" &&
        typeof (row as CartItem).productId === "string" &&
        typeof (row as CartItem).quantity === "number"
    );
  } catch {
    return [];
  }
}

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  /** Replaces the entire cart (e.g. Buy now with a single line). */
  replaceAll: (items: CartItem[]) => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota / private mode */
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const addQty = item.quantity ?? 1;
      const cap = Math.max(0, item.maxStock);
      setItems((prev) => {
        const found = prev.find((i) => i.productId === item.productId);
        if (found) {
          const nextQty = Math.min(
            found.quantity + addQty,
            cap || 999
          );
          return prev.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: nextQty, maxStock: item.maxStock, price: item.price, name: item.name, imageUrl: item.imageUrl }
              : i
          );
        }
        const firstQty = Math.min(addQty, cap || 999);
        return [
          ...prev,
          {
            productId: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
            maxStock: item.maxStock,
            quantity: firstQty,
          },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next = Math.max(1, Math.floor(quantity));
      return prev
        .map((i) => {
          if (i.productId !== productId) return i;
          const max = i.maxStock > 0 ? i.maxStock : 999;
          return { ...i, quantity: Math.min(next, max) };
        })
        .filter((i) => i.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const replaceAll = useCallback((next: CartItem[]) => {
    setItems(
      next.map((i) => ({
        ...i,
        quantity: Math.max(1, Math.min(i.quantity, i.maxStock > 0 ? i.maxStock : 999)),
      }))
    );
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      hydrated,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      replaceAll,
      totalItems,
      subtotal,
    }),
    [items, hydrated, addItem, removeItem, setQuantity, clearCart, replaceAll, totalItems, subtotal]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
