"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  generateSocialMediaAdCopy,
  type GenerateSocialMediaAdCopyInput,
} from "@/ai/flows/generate-social-media-ad-copy";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

const formSchema = z.object({
  productName: z.string().min(2, "Product name must be at least 2 characters."),
  productDescription: z.string().min(10, "Description must be at least 10 characters."),
  targetAudience: z.string().min(2, "Target audience is required."),
  tone: z.enum(["Formal", "Informal", "Funny", "Serious"]),
  platform: z.enum(["Facebook", "Instagram", "Twitter", "LinkedIn"]),
});

export function AdCopyForm() {
  const [adCopy, setAdCopy] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      productDescription: "",
      targetAudience: "",
      tone: "Informal",
      platform: "Instagram",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAdCopy("");
    try {
      const result = await generateSocialMediaAdCopy(values);
      setAdCopy(result.adCopy);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate ad copy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = async () => {
    try {
      // Check for clipboard permissions first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(adCopy);
        toast({
          title: "Copied!",
          description: "Ad copy has been copied to your clipboard.",
        });
      } else {
        throw new Error("Clipboard API not available.");
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Copy Failed",
        description:
          "Could not copy text. Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Quantum Laptop" {...field} />
                    </FormControl>
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
                    <FormControl>
                        <Textarea placeholder="Describe the product's features and benefits." {...field} />
                    </FormControl>
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
                    <FormControl>
                        <Input placeholder="e.g., Tech enthusiasts, students" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a tone" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Formal">Formal</SelectItem>
                            <SelectItem value="Informal">Informal</SelectItem>
                            <SelectItem value="Funny">Funny</SelectItem>
                            <SelectItem value="Serious">Serious</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="Twitter">Twitter</SelectItem>
                            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                <Bot className="mr-2 h-4 w-4" />
                {isLoading ? "Generating..." : "Generate Ad Copy"}
                </Button>
            </form>
            </Form>
        </CardContent>
      </Card>
      <Card className="flex flex-col">
        <CardHeader>
            <CardTitle className="font-headline">Generated Ad Copy</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-muted/20 rounded-b-lg">
          {isLoading ? (
             <div className="w-full space-y-4">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full mx-auto" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
             </div>
          ) : adCopy ? (
            <div className="relative w-full">
              <p className="whitespace-pre-wrap">{adCopy}</p>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                onClick={handleCopy}
              >
                <Clipboard className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4" />
                <p>Your AI-generated ad copy will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
