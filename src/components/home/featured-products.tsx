
"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { subscribeToAllProducts, Product } from "@/lib/product-store";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '../ui/skeleton';

export function FeaturedProducts() {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAllProducts((updatedProducts) => {
      setProducts(updatedProducts);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const renderSkeleton = (key: number) => (
    <Card key={key} className="overflow-hidden">
      <CardHeader className="p-0">
        <Skeleton className="w-full h-48" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-1/4 mt-2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight text-center sm:text-4xl font-headline">
          Featured Products
        </h2>
        <p className="mt-4 text-center text-muted-foreground">
          Discover our handpicked selection of top-rated products from our sellers.
        </p>
        {!isLoading && products.length > 0 && (
            <p className="mt-2 text-center text-sm text-muted-foreground">
                Currently showcasing {products.length} unique products.
            </p>
        )}

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => renderSkeleton(i))}
          </>
        ) : products.length > 0 ? (
            products.map((product) => (
                <Card key={product.id} className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
                  <Link href={`/product/${product.id}`} className="flex flex-col flex-grow">
                    <CardHeader className="p-0">
                        <div className="relative w-full h-48">
                            <Image
                                src={(product.images && product.images.length > 0 && product.images[0]?.url) || "https://picsum.photos/600/400"}
                                alt={product.name || 'Product image'}
                                fill
                                className="object-cover"
                                data-ai-hint={product.aiHint || 'product image'}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <CardTitle className="text-lg font-headline hover:text-primary transition-colors">{product.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-muted-foreground/30'}`} fill="currentColor" />
                            ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews || 0} reviews)</span>
                        </div>
                        <p className="mt-2 text-xl font-bold">{(product.price || 0).toLocaleString()} PKR</p>
                    </CardContent>
                  </Link>
                  <CardFooter className="p-4 pt-0 mt-auto">
                    <Button
                      type="button"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const imageUrl =
                          (product.images && product.images[0]?.url) ||
                          "https://picsum.photos/600/400";
                        addItem({
                          productId: product.id,
                          sellerId: product.sellerId,
                          name: product.name,
                          price: product.price || 0,
                          imageUrl,
                          maxStock: product.stock > 0 ? product.stock : 999,
                          quantity: 1,
                        });
                        toast({
                          title: "Added to cart",
                          description: product.name,
                        });
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
            ))
        ) : (
            <div className="col-span-full mt-12 text-center text-muted-foreground">
                <p>No products featured yet. Check back soon!</p>
            </div>
        )}
        </div>
      </div>
    </section>
  );
}
