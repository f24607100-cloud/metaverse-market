"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function CartDrawer() {
  const { items, removeItem, setQuantity, subtotal, totalItems } = useCart();
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open cart">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge
              className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-xs"
              variant="default"
            >
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full max-w-md flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your cart</SheetTitle>
        </SheetHeader>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Your cart is empty. Add products from the home or product pages.
          </p>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-2 px-2">
              <ul className="space-y-4 py-2">
                {items.map((line) => (
                  <li
                    key={line.productId}
                    className="flex gap-3 rounded-lg border p-2"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${line.productId}`}
                        className="font-medium line-clamp-2 hover:text-primary"
                        onClick={() => setOpen(false)}
                      >
                        {line.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {line.price.toLocaleString()} PKR each
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={line.maxStock > 0 ? line.maxStock : undefined}
                          className="h-8 w-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          value={line.quantity}
                          onChange={(e) =>
                            setQuantity(line.productId, Number(e.target.value) || 1)
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          aria-label="Remove from cart"
                          onClick={() => removeItem(line.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="shrink-0 text-right font-medium">
                      {(line.price * line.quantity).toLocaleString()} PKR
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <div className="mt-auto space-y-3 border-t pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} PKR</span>
              </div>
              <Button className="w-full" asChild>
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Checkout
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
