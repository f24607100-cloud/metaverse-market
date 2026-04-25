
"use client";

import { useState, useEffect } from 'react';
import { ProductUploadForm } from "@/components/dashboard/product-upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { subscribeToProducts, deleteProduct, Product } from "@/lib/product-store";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // If user logs out, stop loading and clear products
        setIsLoading(false);
        setProducts([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeProducts: () => void = () => {};
    
    if (user) {
      setIsLoading(true);
      unsubscribeProducts = subscribeToProducts((updatedProducts) => {
        setProducts(updatedProducts);
        setIsLoading(false);
      });
    }
    
    return () => unsubscribeProducts();
  }, [user]);

  const handleDeleteProduct = async () => {
    if (productToDelete) {
        try {
            await deleteProduct(productToDelete.id);
            toast({
                title: "Product Deleted",
                description: `"${productToDelete.name}" has been removed.`,
            });
        } catch (error) {
            toast({
                title: "Error Deleting Product",
                description: "There was an issue removing the product. Please try again.",
                variant: "destructive"
            });
            console.error("Failed to delete product:", error);
        } finally {
            setProductToDelete(null);
        }
    }
  }

  const renderSkeleton = (key: number) => (
    <TableRow key={key}>
      <TableCell className="hidden sm:table-cell">
        <Skeleton className="h-10 w-10 rounded-md" />
      </TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );

  return (
    <AlertDialog>
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
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <>
                                {Array.from({ length: 3 }).map((_, i) => renderSkeleton(i))}
                                </>
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                            alt={product.name || 'Product image'}
                                            className="aspect-square rounded-md object-cover"
                                            height="40"
                                            src={(product.images && product.images.length > 0 && product.images[0]?.url) || "https://picsum.photos/40"}
                                            width="40"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.status === 'Active' ? 'secondary' : 'outline'}>{product.status}</Badge>
                                        </TableCell>
                                        <TableCell>{(product.price || 0).toLocaleString()} PKR</TableCell>
                                        <TableCell className="hidden md:table-cell">{product.stock || 0}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem 
                                                            className="text-destructive"
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                setProductToDelete(product);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
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
            <ProductUploadForm onProductAdd={() => {}} />
        </div>
    </div>
    <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product <span className="font-semibold">{productToDelete?.name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteProduct}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
