import { Award, Gift, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

export function RewardsPromo() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="px-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">
              Earn Points, Get Rewards
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join our loyalty program and turn your purchases into savings.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-headline">Shop & Earn Points</h3>
                  <p className="mt-1 text-muted-foreground">
                    Get points for every purchase you make on MarketVerse AI.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-secondary text-secondary-foreground">
                    <Gift className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-headline">Redeem for Discounts</h3>
                  <p className="mt-1 text-muted-foreground">
                    Use your points for exclusive discounts. For example,{" "}
                    <span className="font-bold text-secondary-foreground">500 points = 100 PKR off!</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-accent text-accent-foreground">
                    <Star className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold font-headline">Exclusive Perks</h3>
                  <p className="mt-1 text-muted-foreground">
                    Enjoy member-only sales, early access to new products, and more.
                  </p>
                </div>
              </div>
            </div>
             <Button size="lg" className="mt-10">Sign Up & Start Earning</Button>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="https://picsum.photos/600/500"
              alt="Rewards"
              width={600}
              height={500}
              className="rounded-lg shadow-xl"
              data-ai-hint="rewards gift"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
