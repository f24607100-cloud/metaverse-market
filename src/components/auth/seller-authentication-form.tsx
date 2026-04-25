
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getUserRole, upsertUserRole } from "@/lib/user-role";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  plan: z.enum(["50", "80", "100", "101"]),
  shopName: z.string().min(2, { message: "Shop name is required." }),
  productCategory: z.string({ required_error: "Please select a category." }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  contactEmail: z.string().email({ message: "Invalid contact email address." }),
  contractDuration: z.enum(["monthly", "annual", "biennial"]),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const planTiers = {
    "50": { "name": "Starter", "price": 5000, "products": "Up to 50" },
    "80": { "name": "Growth", "price": 8000, "products": "Up to 80" },
    "100": { "name": "Pro", "price": 10000, "products": "Up to 100" },
    "101": { "name": "Enterprise", "price": 15000, "products": "100+" },
};

const contractDiscounts = {
    monthly: { discount: 0, label: "Monthly" },
    annual: { discount: 0.2, label: "Annually (20% off)" },
    biennial: { discount: 0.3, label: "Biennially (30% off)" },
};

const productCategories = [
    "General Store", "Tech & Electronics", "Fashion & Apparel", "Health & Beauty", "Home & Kitchen", "Sports & Outdoors", "Toys & Games", "Books & Media", "Personal Growth"
];

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
    </svg>
);


export function SellerAuthenticationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { 
        name: "", 
        email: "", 
        password: "", 
        plan: "50", 
        shopName: "", 
        productCategory: undefined, 
        phoneNumber: "",
        contactEmail: "",
        contractDuration: "monthly",
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const selectedPlan = signUpForm.watch("plan");
  const selectedDuration = signUpForm.watch("contractDuration");

  const calculatePrice = () => {
    const basePrice = planTiers[selectedPlan as keyof typeof planTiers].price;
    const discount = contractDiscounts[selectedDuration as keyof typeof contractDiscounts].discount;
    return basePrice * (1 - discount);
  };


  const handleSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await upsertUserRole({
        uid: cred.user.uid,
        role: "seller",
        email: values.email,
        extra: {
          name: values.name,
          shopName: values.shopName,
          productCategory: values.productCategory,
          phoneNumber: values.phoneNumber,
          contactEmail: values.contactEmail,
          plan: values.plan,
          contractDuration: values.contractDuration,
        },
      });
      
      // Simulate a 10 second eligibility check
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      toast({ 
          title: "You are eligible to work as a seller!", 
          description: "Redirecting you to the dashboard." 
      });

      router.push("/dashboard");

    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, values.email, values.password);
      const role = await getUserRole(cred.user.uid);
      if (role === null) {
        await upsertUserRole({
          uid: cred.user.uid,
          role: "seller",
          email: cred.user.email,
        });
      } else if (role !== "seller") {
        await signOut(auth);
        toast({
          title: "Seller account required",
          description: "This account is not registered as a seller.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Signed in successfully!" });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const existingRole = await getUserRole(cred.user.uid);
      if (existingRole && existingRole !== "seller") {
        await signOut(auth);
        toast({
          title: "Seller account required",
          description: "This Google account is registered as a client.",
          variant: "destructive",
        });
        return;
      }
      await upsertUserRole({
        uid: cred.user.uid,
        role: "seller",
        email: cred.user.email,
      });
      toast({ title: "Signed in successfully!" });
      // In a real app, if a new Google user signs up as a seller,
      // you'd redirect them to a form to complete their seller profile.
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Google sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Card>
          <CardHeader>
            <CardTitle>Sign In as Seller</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...signInForm}>
              <form
                onSubmit={signInForm.handleSubmit(handleSignIn)}
                className="space-y-4"
              >
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          {...field}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} autoComplete="current-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </Form>
          </CardContent>
           <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <GoogleIcon />
               <span className="ml-2">Sign in with Google</span>
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Create your Seller Account</CardTitle>
            <CardDescription>
              Fill out the form to start selling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...signUpForm}>
              <form
                onSubmit={signUpForm.handleSubmit(handleSignUp)}
                className="space-y-6"
              >
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={signUpForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} autoComplete="name" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                    control={signUpForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input placeholder="+1 234 567 890" {...field} autoComplete="tel" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={signUpForm.control}
                    name="shopName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Shop Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John's Emporium" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={signUpForm.control}
                    name="productCategory"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {productCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Login Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="login@example.com" {...field} autoComplete="email" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={signUpForm.control}
                    name="contactEmail"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="contact@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <FormField
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} autoComplete="new-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signUpForm.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Choose your monthly plan</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 gap-4"
                        >
                          {Object.entries(planTiers).map(([key, value]) => (
                            <FormItem key={key} className="flex-1">
                                <Label className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <RadioGroupItem value={key} className="sr-only" />
                                    <span className="font-bold text-lg">{value.name}</span>
                                    <span className="text-sm text-muted-foreground">{value.products} products</span>
                                    <span className="font-semibold mt-2">{value.price.toLocaleString()} PKR</span>
                                </Label>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={signUpForm.control}
                  name="contractDuration"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Choose your contract duration</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-4"
                        >
                          {Object.entries(contractDiscounts).map(([key, value]) => (
                             <FormItem key={key}>
                                <Label className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                                    <RadioGroupItem value={key} className="sr-only" />
                                    <span className="text-sm font-semibold">{value.label}</span>
                                </Label>
                             </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Processing...' : `Proceed to Payment (${calculatePrice().toLocaleString()} PKR)`}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

    
    