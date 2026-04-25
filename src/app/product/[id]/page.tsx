
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/lib/product-store';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Star, CheckCircle, ChevronDown, ShieldCheck, ShoppingCart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem, replaceAll } = useCart();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState("1");

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      const productDocRef = doc(db, 'products', id);
      const productSnap = await getDoc(productDocRef);

      if (productSnap.exists()) {
        setProduct({ id: productSnap.id, ...productSnap.data() } as Product);
      } else {
        notFound();
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);
  
  if (loading) {
    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image Skeleton */}
                    <div>
                        <Skeleton className="w-full h-[450px] rounded-lg" />
                        <div className="flex gap-4 mt-4">
                            <Skeleton className="w-20 h-20 rounded-md" />
                            <Skeleton className="w-20 h-20 rounded-md" />
                            <Skeleton className="w-20 h-20 rounded-md" />
                        </div>
                    </div>
                    {/* Details Skeleton */}
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-5 w-1/4" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-5 w-16" />
                        </div>
                        <Skeleton className="h-10 w-1/3" />
                         <div className="border-t pt-4 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
  }

  if (!product) {
    return notFound();
  }

  const listPrice = product.discount ? product.price / (1 - (product.discount/100)) : null;
  const imageUrl = product.images?.[0]?.url || "https://picsum.photos/600";
  const cap = product.stock > 0 ? product.stock : 0;
  const quantity =
    cap > 0
      ? Math.max(1, Math.min(parseInt(qty, 10) || 1, cap))
      : 0;

  const linePayload = () => ({
    productId: product.id,
    sellerId: product.sellerId,
    name: product.name,
    price: product.price,
    imageUrl,
    maxStock: product.stock > 0 ? product.stock : 999,
  });

  const handleAddToCart = () => {
    if (quantity < 1) {
      toast({
        variant: "destructive",
        title: "Out of stock",
        description: "This product is not available to order.",
      });
      return;
    }
    addItem({ ...linePayload(), quantity });
    toast({ title: "Added to cart", description: product.name });
  };

  const handleBuyNow = () => {
    if (quantity < 1) {
      toast({
        variant: "destructive",
        title: "Out of stock",
        description: "This product is not available to order.",
      });
      return;
    }
    replaceAll([
      {
        ...linePayload(),
        quantity,
      },
    ]);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 bg-white">
        <div className="container mx-auto px-4 py-6">
            <div className="text-sm text-gray-500 mb-4">
                <Link href="/home" className="hover:underline">Home</Link> &gt; 
                <Link href="#" className="hover:underline"> {product.category}</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
                {/* Left Column: Images */}
                <div className="flex flex-col gap-4">
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                         <Image
                            src={product.images[selectedImage]?.url || "https://picsum.photos/600"}
                            alt={product.name}
                            fill
                            className="object-cover"
                            data-ai-hint={product.aiHint || 'product image'}
                        />
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {product.images.map((image, index) => (
                            <button key={index} onClick={() => setSelectedImage(index)} className={`aspect-square relative rounded-md overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}>
                                <Image
                                    src={image.url}
                                    alt={`${product.name} thumbnail ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="flex flex-col">
                    <h1 className="text-2xl lg:text-3xl font-bold font-headline text-gray-900">{product.name}</h1>
                    <Link href="#" className="text-sm text-primary hover:underline mt-1">Visit the Seller's Store</Link>

                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
                            ))}
                        </div>
                        <span className="text-sm text-gray-600">{product.rating?.toFixed(1)} ratings</span>
                    </div>

                    {product.category === "Home & Kitchen" && <Badge className="mt-2 w-fit bg-orange-500 hover:bg-orange-600">#1 Best Seller</Badge>}

                    <div className="my-4 border-t border-gray-200"></div>
                    
                    <div className="flex items-baseline gap-2">
                        {product.discount && product.discount > 0 && (
                            <span className="text-red-600 text-lg font-semibold">-{product.discount}%</span>
                        )}
                        <span className="text-3xl font-bold text-gray-900">{product.price.toLocaleString()} <span className="text-xl">PKR</span></span>
                    </div>
                     {listPrice && (
                        <p className="text-sm text-gray-500">
                            List Price: <span className="line-through">{listPrice.toLocaleString(undefined, {maximumFractionDigits: 0})} PKR</span>
                        </p>
                    )}

                     <div className="text-sm text-gray-700 mt-4">
                        <p>$119.58 Shipping & Import Charges to Pakistan <ChevronDown className="inline h-4 w-4" /></p>
                     </div>

                    {product.stock > 0 ? (
                      <p className="mt-4 text-green-600 font-semibold flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> In Stock
                      </p>
                    ) : (
                      <p className="mt-4 text-destructive font-semibold">Out of stock</p>
                    )}

                    <div className="mt-6 w-1/4 min-w-[120px]">
                      <Select
                        value={qty}
                        onValueChange={setQty}
                        disabled={product.stock <= 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Quantity" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            {
                              length: product.stock > 0 ? Math.min(10, product.stock) : 1,
                            },
                            (_, i) => i + 1
                          ).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              Qty: {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-6 space-y-4">
                        <Button
                            type="button"
                            size="lg"
                            className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            onClick={handleBuyNow}
                            disabled={product.stock <= 0}
                        >
                            Buy Now
                        </Button>
                    </div>
                    
                     <div className="mt-4 text-sm text-gray-700 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-gray-500" />
                        <span>Secure transaction</span>
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
