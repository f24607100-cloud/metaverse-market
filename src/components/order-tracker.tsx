"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Package, Truck, Home, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";

const steps = [
  { id: "ordered", label: "Ordered", icon: CheckCircle },
  { id: "shipped", label: "Shipped", icon: Package },
  { id: "outForDelivery", label: "Out for Delivery", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Home },
];

type OrderStatus = "ordered" | "shipped" | "outForDelivery" | "delivered" | "not_found";

export function OrderTracker() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("orderId");
    if (q) {
      setOrderId(q);
      // auto-track when coming from checkout
      void track(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeStatus = (raw: unknown): OrderStatus => {
    return raw === "ordered" ||
      raw === "shipped" ||
      raw === "outForDelivery" ||
      raw === "delivered"
      ? raw
      : "ordered";
  };

  const track = async (id: string) => {
    setIsLoading(true);
    setStatus(null);
    try {
      const snap = await getDoc(doc(db, "orders", id.trim()));
      if (!snap.exists()) {
        setStatus("not_found");
        return;
      }
      const data = snap.data() as { status?: unknown };
      setStatus(normalizeStatus(data.status));
    } catch {
      setStatus("not_found");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    void track(orderId);
  };
  
  const currentStepIndex = useMemo(
    () => (status ? steps.findIndex((step) => step.id === status) : -1),
    [status]
  );


  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-center">Order Status</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleTrackOrder} className="flex gap-2 mb-8">
          <Input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter your order ID (e.g., 12345)"
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Track'}
          </Button>
        </form>

        {status && status !== 'not_found' && (
            <div className="relative flex justify-between w-full items-center">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted">
                    <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{width: `${(currentStepIndex / (steps.length - 1)) * 100}%`}}
                    ></div>
                </div>
                {steps.map((step, index) => {
                    const isActive = currentStepIndex >= index;
                    return (
                        <div key={step.id} className="z-10 flex flex-col items-center">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            <p className={cn(
                                "mt-2 text-xs text-center font-medium",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}>{step.label}</p>
                        </div>
                    );
                })}
            </div>
        )}
        
        {status === 'not_found' && (
            <p className="text-center text-destructive">Order not found. Please check the ID and try again.</p>
        )}
      </CardContent>
    </Card>
  );
}
