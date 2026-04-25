
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AuthModal({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleAction = () => {
    if (!user) {
      setOpen(true);
    } else {
      // If user is logged in, proceed with the action
      toast({
        title: "Success!",
        description: "Item added to cart.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={handleAction} className="w-full">
        {children}
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authentication Required</DialogTitle>
          <DialogDescription>
            You need to be logged in to perform this action. Please sign in or create an account to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
            <div className="flex gap-4">
                <Button asChild>
                    <Link href="/">Sign In</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Sign Up</Link>
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
