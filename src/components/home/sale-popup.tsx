
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function SalePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-center">
            🎉 Flash Sale Alert! 🎉
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Don't miss out on our biggest sale of the year! Get up to 50% off on selected items.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Image
            src="https://picsum.photos/400/200"
            alt="Sale banner"
            width={400}
            height={200}
            className="rounded-lg object-cover w-full"
            data-ai-hint="sale promotion"
          />
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} className="w-full">
            Shop Now & Save Big!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
