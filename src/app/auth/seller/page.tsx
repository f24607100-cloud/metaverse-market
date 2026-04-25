import Link from 'next/link';
import { SellerAuthenticationForm } from '@/components/auth/seller-authentication-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function SellerAuthPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
       <Button variant="ghost" asChild className="absolute top-4 left-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
      </Button>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">
            Seller Portal
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
            Sign in to manage your store or sign up to create a new one.
        </p>
      </div>
      <SellerAuthenticationForm />
    </div>
  );
}
