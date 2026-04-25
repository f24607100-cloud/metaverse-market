
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateProductTagsAndSeoText } from "@/ai/flows/generate-product-tags-and-seo-text";
import { generateProductDetails } from "@/ai/flows/generate-product-details";
import { addProduct, uploadImage } from "@/lib/product-store";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Image as ImageIcon, Loader2, Sparkles, Percent, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  productName: z.string().min(2, "Product name is required"),
  productDescription: z.string().min(10, "Description is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  discount: z.coerce.number().min(0, "Discount can't be negative").max(100, "Discount can't be over 100").optional(),
  stock: z.coerce.number().min(0, "Stock can't be negative"),
  productCategory: z.string().min(2, "Category is required"),
  targetAudience: z.string().min(2, "Target audience is required"),
  images: z.array(z.string())
    .min(1, "At least one product image is required.")
    .max(10, "You can upload a maximum of 10 images."),
});

type SeoData = { tags: string[]; seoTitle: string; seoDescription: string; };

export function ProductUploadForm({ onProductAdd }: { onProductAdd: () => void }) {
  const [seoData, setSeoData] = useState<SeoData | null>(null);
  const [isGeneratingDetails, setIsGeneratingDetails] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      productCategory: "",
      targetAudience: "",
      price: 0,
      discount: 0,
      stock: 0,
      images: [],
    },
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;
    
    const currentImageUrls = form.getValues("images");
    const newFiles = Array.from(files).slice(0, 10 - currentImageUrls.length);

    if (currentImageUrls.length + newFiles.length > 10) {
        toast({
            title: "Maximum of 10 images allowed.",
            variant: "destructive",
        });
    }

    setIsUploading(true);

    try {
        const uploadPromises = newFiles.map(file => uploadImage(file, user.uid));
        const uploadedUrls = await Promise.all(uploadPromises);

        const updatedUrls = [...currentImageUrls, ...uploadedUrls];
        form.setValue("images", updatedUrls, { shouldValidate: true });
    
    } catch (error) {
        console.error("Image upload failed:", error);
        toast({
            title: "Image Upload Failed",
            description: "There was an error processing one or more images. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
    }
  };

  const removeImage = (index: number) => {
    const currentUrls = form.getValues("images");
    const newUrls = currentUrls.filter((_, i) => i !== index);
    form.setValue("images", newUrls, { shouldValidate: true });
  };
  
  const handleGenerateDetails = async () => {
    const productName = form.getValues("productName");
    if (!productName || productName.length < 2) {
      form.trigger("productName");
      toast({
        title: "Product Name Required",
        description: "Please enter a product name first.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingDetails(true);
    try {
      const result = await generateProductDetails({ productName });
      form.setValue("productDescription", result.productDescription);
      form.setValue("productCategory", result.productCategory);
      form.setValue("targetAudience", result.targetAudience);
      toast({
        title: "Details Generated!",
        description: "The product details have been filled in for you.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate product details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDetails(false);
    }
  };

  const handleGenerateSeo = async () => {
    const isValid = await form.trigger(["productName", "productDescription", "productCategory", "targetAudience"]);

    if (!isValid) {
        toast({
            title: "Missing Information",
            description: "Please fill out product name, description, category, and target audience first.",
            variant: "destructive",
        });
        return;
    }

    const values = form.getValues();

    setIsGeneratingSeo(true);
    setSeoData(null);
    try {
      const result = await generateProductTagsAndSeoText({
        productName: values.productName,
        productDescription: values.productDescription,
        productCategory: values.productCategory,
        targetAudience: values.targetAudience,
      });
      setSeoData(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate SEO data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSeo(false);
    }
  };
  
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to save a product.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        const productData = {
            name: values.productName,
            description: values.productDescription,
            price: values.price,
            discount: values.discount,
            stock: values.stock,
            category: values.productCategory,
            targetAudience: values.targetAudience,
            images: values.images.map(url => ({ url })),
            seo: seoData,
            sellerId: user.uid,
        };
        
        await addProduct(productData);

        toast({
            title: "Product Submitted!",
            description: "Your product has been saved.",
        });

        // Reset form and state
        form.reset();
        setSeoData(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        onProductAdd();
    } catch (error) {
        console.error("Failed to save product:", error);
        toast({
            title: "Save Failed",
            description: "There was an error saving your product. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const imageUrls = form.watch("images");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Add New Product</CardTitle>
        <CardDescription>Fill in the details for your new product.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images (up to 10)</FormLabel>
                   <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {imageUrls.map((src, index) => (
                            <div key={src.substring(0, 50) + index} className="relative aspect-square">
                                <Image src={src} alt={`Product preview ${index + 1}`} fill objectFit="cover" className="rounded-lg" />
                                <Button 
                                    type="button"
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {isUploading && (
                            <div className="w-full aspect-square bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed">
                                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                            </div>
                        )}
                        {imageUrls.length < 10 && !isUploading && (
                             <FormControl>
                                <div 
                                className="w-full aspect-square bg-muted rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed"
                                onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground mt-1 text-center">Add Image</span>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        disabled={imageUrls.length >= 10 || !user || isUploading}
                                    />
                                </div>
                            </FormControl>
                        )}
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input placeholder="Quantum Laptop" {...field} />
                    </FormControl>
                    <Button type="button" size="icon" variant="outline" onClick={handleGenerateDetails} disabled={isGeneratingDetails}>
                      {isGeneratingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span className="sr-only">Generate Details</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Description</FormLabel>
                  <FormControl><Textarea placeholder="High-performance laptop..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (PKR)</FormLabel>
                    <FormControl><Input type="number" placeholder="5000" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <div className="relative">
                            <FormControl>
                                <Input type="number" placeholder="10" {...field} className="pl-8" />
                            </FormControl>
                            <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Available Stock</FormLabel>
                    <FormControl><Input type="number" placeholder="100" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="productCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl><Input placeholder="Electronics" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl><Input placeholder="Professionals, Gamers" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-muted/30">
                <CardHeader>
                    <CardTitle className="text-base font-headline flex items-center justify-between">
                        <span>AI SEO & Tag Generation</span>
                        <Button type="button" size="sm" variant="outline" onClick={handleGenerateSeo} disabled={isGeneratingSeo}>
                            {isGeneratingSeo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                            <span className="ml-2">{isGeneratingSeo ? 'Generating...' : 'Generate'}</span>
                        </Button>
                    </CardTitle>
                </CardHeader>
                {seoData && (
                    <CardContent className="space-y-4">
                        <div>
                            <FormLabel>SEO Title</FormLabel>
                            <Input readOnly value={seoData.seoTitle} className="mt-1 bg-white"/>
                        </div>
                        <div>
                            <FormLabel>SEO Description</FormLabel>
                            <Textarea readOnly value={seoData.seoDescription} className="mt-1 bg-white"/>
                        </div>
                        <div>
                            <FormLabel>Tags</FormLabel>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {seoData.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            <Button type="submit" className="w-full" disabled={isSubmitting || isUploading || !user}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
