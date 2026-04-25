"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const difference = tomorrow.getTime() - now.getTime();

      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { hours: 0, minutes: 0, seconds: 0 };
    };
    
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <section className="bg-accent text-accent-foreground">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-8 md:flex-row md:py-12">
        <div className="flex items-center gap-4">
          <Clock className="w-10 h-10" />
          <div>
            <h2 className="text-2xl font-bold font-headline">Flash Sale Ending Soon!</h2>
            <p className="text-sm">Don't miss out on our amazing deals.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-center">
            <div className="flex flex-col items-center">
                <span className="text-4xl font-bold">{formatTime(timeLeft.hours)}</span>
                <span className="text-xs">HOURS</span>
            </div>
             <span className="text-4xl font-bold">:</span>
            <div className="flex flex-col items-center">
                <span className="text-4xl font-bold">{formatTime(timeLeft.minutes)}</span>
                <span className="text-xs">MINUTES</span>
            </div>
             <span className="text-4xl font-bold">:</span>
            <div className="flex flex-col items-center">
                <span className="text-4xl font-bold">{formatTime(timeLeft.seconds)}</span>
                <span className="text-xs">SECONDS</span>
            </div>
        </div>
        <Button variant="secondary" className="bg-accent-foreground text-accent hover:bg-accent-foreground/90">
          Shop Now
        </Button>
      </div>
    </section>
  );
}
