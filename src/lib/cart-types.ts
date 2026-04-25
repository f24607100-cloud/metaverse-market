export interface CartItem {
  productId: string;
  sellerId?: string;
  name: string;
  /** Unit price in PKR (snapshot at add time) */
  price: number;
  imageUrl: string;
  quantity: number;
  maxStock: number;
}

export const CART_STORAGE_KEY = "marketverse_cart_v1";
