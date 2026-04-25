import { OrderTracker } from "@/components/order-tracker";
import { Suspense } from "react";

export default function TrackOrderPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-4xl py-16 sm:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">
            Track Your Order
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Enter your order ID to see its current status.
          </p>
        </div>
        <div className="mt-12">
            <Suspense fallback={<div className="text-center text-muted-foreground">Loading tracker…</div>}>
              <OrderTracker />
            </Suspense>
        </div>
      </div>
    </div>
  );
}
