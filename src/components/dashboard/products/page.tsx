
"use client";

import { useState, useEffect } from 'react';
import { ProductUploadForm } from "@/components/dashboard/product-upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { productStore, Product } from "@/lib/product-store";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Subscribe to product changes.
    const unsubscribe = productStore.subscribe(setProducts);
    // Set initial products.
    setProducts(productStore.getProducts());
    return () => unsubscribe();
  }, []);

  const handleProductAdd = () => {
    // The store now notifies subscribers, so this can be simplified.
    // Or we can rely on the useEffect subscription.
    setProducts([...productStore.getProducts()]);
  }

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">My Products</CardTitle>
                    <CardDescription>
                        Manage your products and view their sales performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="hidden md:table-cell">Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                            alt="Product image"
                                            className="aspect-square rounded-md object-cover"
                                            height="40"
                                            src={product.images[0]?.url || "https://picsum.photos/40"}
                                            width="40"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.status === 'Active' ? 'secondary' : 'outline'}>{product.status}</Badge>
                                        </TableCell>
                                        <TableCell>{product.price.toLocaleString()} PKR</TableCell>
                                        <TableCell className="hidden md:table-cell">{product.stock}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No products have been added yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <div>
            <ProductUploadForm onProductAdd={handleProductAdd} />
        </div>
    </div>
  );
}
