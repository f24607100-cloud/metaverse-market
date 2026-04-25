
"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { UserNav } from "@/components/dashboard/user-nav";
import { Skeleton } from './ui/skeleton';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { subscribeUserRole, type AppUserRole } from '@/lib/user-role';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppUserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeRole: (() => void) | null = null;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setRole(null);
      if (unsubscribeRole) {
        unsubscribeRole();
        unsubscribeRole = null;
      }
      if (currentUser) {
        unsubscribeRole = subscribeUserRole(currentUser.uid, setRole);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
      if (unsubscribeRole) unsubscribeRole();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/home" className="mr-6 flex items-center space-x-2">
          <Logo className="h-6 w-6" />
          <span className="font-bold inline-block font-headline">MarketVerse AI</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/home"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Home
          </Link>
          <Link
            href="/track-order"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Track Order
          </Link>
          {user && role === 'seller' && (
            <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
                Dashboard
            </Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
          <CartDrawer />
          <nav className="flex items-center space-x-2">
            {loading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            ) : user ? (
                <UserNav />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
