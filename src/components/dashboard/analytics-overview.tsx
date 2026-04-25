
"use client"

import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, XAxis, Line, LineChart, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart"
import { TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { Product } from "@/lib/product-store";
import type { CartItem } from "@/lib/cart-types";

type OrderDoc = {
  items?: CartItem[];
  subtotal?: number;
  sellerSummary?: Record<string, { revenue?: number; units?: number }>;
};

const salesDataBase = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month) => ({
  month,
  sales: 0,
}));

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function AnalyticsOverview() {
  const [loading, setLoading] = useState(true);
  const [productsCount, setProductsCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUnitsSold, setTotalUnitsSold] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [monthlySales, setMonthlySales] = useState(salesDataBase);

  useEffect(() => {
    let unsubProducts: (() => void) | null = null;
    let unsubOrders: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        setProductsCount(0);
        setTotalOrders(0);
        setTotalUnitsSold(0);
        setRevenue(0);
        setMonthlySales(salesDataBase);
        return;
      }

      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();

      unsubProducts = onSnapshot(
        query(collection(db, "products"), where("sellerId", "==", user.uid)),
        (productsSnap) => {
          const products = productsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[];
          const productIds = new Set(products.map((p) => p.id));
          setProductsCount(products.length);

          if (unsubOrders) unsubOrders();
          unsubOrders = onSnapshot(
            query(collection(db, "orders"), where("sellerIds", "array-contains", user.uid)),
            (ordersSnap) => {
              const orders = ordersSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as Array<OrderDoc & { createdAt?: { toDate?: () => Date } }>;

              let nextOrders = 0;
              let nextUnits = 0;
              let nextRevenue = 0;
              const buckets = [...salesDataBase];
              const monthKeyToIndex = new Map(buckets.map((b, i) => [b.month, i]));

              for (const order of orders) {
                const items = Array.isArray(order.items) ? order.items : [];
                let orderSellerRevenue = 0;
                let orderHasSellerItems = false;
                let orderSellerUnits = 0;

                const summary = order.sellerSummary?.[user.uid];
                if (summary && typeof summary.revenue === "number") {
                  orderHasSellerItems = true;
                  orderSellerRevenue = summary.revenue;
                  orderSellerUnits = typeof summary.units === "number" ? summary.units : 0;
                } else {
                for (const item of items) {
                  const belongsToSeller =
                    item.sellerId === user.uid || productIds.has(item.productId);
                  if (!belongsToSeller) continue;
                  orderHasSellerItems = true;
                  orderSellerUnits += item.quantity;
                  orderSellerRevenue += item.price * item.quantity;
                }
                }

                if (!orderHasSellerItems) continue;
                nextOrders += 1;
                nextUnits += orderSellerUnits;
                nextRevenue += orderSellerRevenue;

                const created = order.createdAt?.toDate?.() ?? new Date();
                const month = created.toLocaleString("en-US", { month: "short" });
                const idx = monthKeyToIndex.get(month);
                if (idx !== undefined) {
                  buckets[idx] = {
                    ...buckets[idx],
                    sales: buckets[idx].sales + orderSellerRevenue,
                  };
                }
              }

              setTotalOrders(nextOrders);
              setTotalUnitsSold(nextUnits);
              setRevenue(nextRevenue);
              setMonthlySales(buckets);
              setLoading(false);
            },
            () => {
              setLoading(false);
            }
          );
        },
        () => setLoading(false)
      );
    });

    return () => {
      unsubAuth();
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
    };
  }, []);

  const netProfit = useMemo(() => Math.floor(revenue * 0.85), [revenue]);

  return (
    <div
      className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 grid auto-rows-max"
    >
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenue.toLocaleString()} PKR</div>
            <p className="text-xs text-muted-foreground">
              {loading ? "Loading..." : "From all completed checkouts"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {totalUnitsSold} total units sold
            </p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{netProfit.toLocaleString()} PKR</div>
                <p className="text-xs text-muted-foreground">Estimated at 85% margin</p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Products in Store</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="text-xs text-muted-foreground">Active products listed</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart
            data={monthlySales}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                indicator="line" 
                formatter={(value) => `${value.toLocaleString()} PKR`}
              />}
            />
            <Line
              dataKey="sales"
              type="monotone"
              stroke="var(--color-sales)"
              strokeWidth={2}
              dot={true}
            />
          </LineChart>
        </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
