import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { RewardsPromo } from "@/components/home/rewards-promo";
import { SalePopup } from "@/components/home/sale-popup";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <SalePopup />
        <Hero />
        <FeaturedProducts />
        <RewardsPromo />
      </main>
      <Footer />
    </>
  );
}
