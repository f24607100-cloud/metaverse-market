import Link from 'next/link';
import { AuthenticationForm } from '@/components/auth/authentication-form';
import { Button } from '@/components/ui/button';

export default function AuthenticationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">
            Welcome to <span className="text-primary">MarketVerse AI</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
            Sign in or create an account to get started.
        </p>
      </div>
      <AuthenticationForm />
      <div className="mt-4 flex flex-col items-center gap-2">
        <Button variant="link" asChild>
            <Link href="/home">Continue as Guest</Link>
        </Button>
        <Button variant="link" asChild>
            <Link href="/auth/seller">I am a seller</Link>
        </Button>
      </div>
    </div>
  );
}
