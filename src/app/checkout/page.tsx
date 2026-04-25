"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { useCart } from "@/contexts/cart-context";
import { createOrder } from "@/lib/orders";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { User } from "firebase/auth";

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { items, subtotal, clearCart, totalItems } = useCart();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const u = onAuthStateChanged(auth, (fbUser) => setUser(fbUser));
    return () => u();
  }, []);

  if (user === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex flex-1 items-center justify-center py-12">
          <p className="text-muted-foreground">Loading…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="container mx-auto flex flex-1 flex-col items-center justify-center gap-4 py-12">
          <p className="text-lg text-muted-foreground">Your cart is empty.</p>
          <Button asChild>
            <Link href="/home">Continue shopping</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please sign in to place an order.",
      });
      router.push("/");
      return;
    }
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      toast({
        variant: "destructive",
        title: "Missing details",
        description: "Please fill in name, phone, and shipping address.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const email = user.email ?? "";
      const orderId = await createOrder({
        userId: user.uid,
        email,
        items: items,
        subtotal,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      clearCart();
      toast({
        title: "Order placed",
        description: `Your order ID is ${orderId}. Redirecting to tracking…`,
      });
      router.push(`/track-order?orderId=${encodeURIComponent(orderId)}`);
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Order failed",
        description: "Could not save your order. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-1 px-4 py-8">
        <h1 className="font-headline text-2xl font-bold sm:text-3xl">Checkout</h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {!user && (
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <Link href="/" className="font-medium text-primary underline">
                  Sign in
                </Link>{" "}
                to place your order, or your cart is saved in this browser for later.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr">Shipping address</Label>
              <Input
                id="addr"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                autoComplete="street-address"
              />
            </div>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              size="lg"
              disabled={submitting || !user}
            >
              {submitting ? "Placing order…" : "Place order"}
            </Button>
            {!user && (
              <p className="text-sm text-muted-foreground">
                Place order is only available when signed in.
              </p>
            )}
          </form>
          <div>
            <h2 className="mb-4 font-headline text-lg font-semibold">Order summary</h2>
            <ul className="space-y-3">
              {items.map((line) => (
                <li key={line.productId} className="flex gap-3 text-sm">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={line.imageUrl}
                      alt={line.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium line-clamp-2">{line.name}</p>
                    <p className="text-muted-foreground">
                      {line.quantity} × {line.price.toLocaleString()} PKR
                    </p>
                  </div>
                  <p className="shrink-0 font-medium">
                    {(line.price * line.quantity).toLocaleString()} PKR
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t pt-4 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{subtotal.toLocaleString()} PKR</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
