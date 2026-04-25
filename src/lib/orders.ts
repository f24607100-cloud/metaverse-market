import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CartItem } from "@/lib/cart-types";

type SellerSummary = Record<string, { revenue: number; units: number }>;

export async function createOrder(input: {
  userId: string;
  email: string;
  items: CartItem[];
  subtotal: number;
  fullName: string;
  phone: string;
  address: string;
}): Promise<string> {
  const items = [...input.items];
  // Ensure sellerId exists (older carts may be missing it)
  const missingSeller = items.filter((i) => !i.sellerId).map((i) => i.productId);
  if (missingSeller.length > 0) {
    await Promise.all(
      Array.from(new Set(missingSeller)).map(async (productId) => {
        const snap = await getDoc(doc(db, "products", productId));
        const sellerId = (snap.data() as { sellerId?: string } | undefined)?.sellerId;
        if (!sellerId) return;
        for (const line of items) {
          if (line.productId === productId && !line.sellerId) {
            line.sellerId = sellerId;
          }
        }
      })
    );
  }

  const sellerSummary: SellerSummary = {};
  for (const line of items) {
    const sid = line.sellerId;
    if (!sid) continue;
    if (!sellerSummary[sid]) sellerSummary[sid] = { revenue: 0, units: 0 };
    sellerSummary[sid].units += line.quantity;
    sellerSummary[sid].revenue += line.price * line.quantity;
  }

  const sellerIds = Object.keys(sellerSummary);
  const ref = await addDoc(collection(db, "orders"), {
    userId: input.userId,
    email: input.email,
    items,
    subtotal: input.subtotal,
    fullName: input.fullName,
    phone: input.phone,
    address: input.address,
    sellerIds,
    sellerSummary,
    status: "ordered",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
