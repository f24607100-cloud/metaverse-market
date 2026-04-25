
"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";


const heroSlides = [
    {
        gradient: "from-yellow-200 to-yellow-400",
        title: "Upgrade and save on everyday tech",
        description: "Score up to 50% off brands you love with MarketVerse AI Refurbished.",
        buttonText: "Shop Refurbished",
        categories: [
            {
                name: "Headphones",
                image: "https://images.unsplash.com/photo-1545127398-14699f92334b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8aGVhZHBob25lc3xlbnwwfHx8fDE3NTY5NTc3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
                aiHint: "headphones",
            },
            {
                name: "Phones",
                image: "https://images.unsplash.com/photo-1634403665481-74948d815f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxzbWFydHBob25lfGVufDB8fHx8MTc1Njk1Nzc4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
                aiHint: "smartphone",
            },
            {
                name: "Smartwatches",
                image: "https://images.unsplash.com/photo-1632794716789-42d9995fb5b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxzbWFydHdhdGNofGVufDB8fHx8MTc1Njk1Nzc4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
                aiHint: "smartwatch",
            },
        ]
    },
    {
        gradient: "from-blue-200 to-blue-400",
        title: "Discover the Latest in Home Entertainment",
        description: "Explore our collection of 4K TVs, soundbars, and streaming devices.",
        buttonText: "Explore Now",
        categories: [
             {
                name: "4K TVs",
                image: "https://picsum.photos/200/200?random=13",
                aiHint: "4k television",
            },
            {
                name: "Soundbars",
                image: "https://picsum.photos/200/200?random=14",
                aiHint: "soundbar audio",
            },
            {
                name: "Streaming Devices",
                image: "https://picsum.photos/200/200?random=15",
                aiHint: "streaming device",
            },
        ]
    },
    {
        gradient: "from-green-200 to-green-400",
        title: "Power Up Your Productivity",
        description: "Find the best deals on laptops, monitors, and accessories for your workspace.",
        buttonText: "Shop Laptops",
        categories: [
            {
                name: "Laptops",
                image: "https://picsum.photos/200/200?random=16",
                aiHint: "modern laptop",
            },
            {
                name: "Monitors",
                image: "https://picsum.photos/200/200?random=17",
                aiHint: "computer monitor",
            },
            {
                name: "Keyboards",
                image: "https://picsum.photos/200/200?random=18",
                aiHint: "computer keyboard",
            },
        ]
    },
    {
        gradient: "from-purple-200 to-purple-400",
        title: "Capture Every Moment",
        description: "High-quality cameras and accessories for photographers of all levels.",
        buttonText: "View Cameras",
        categories: [
            {
                name: "DSLR Cameras",
                image: "https://picsum.photos/200/200?random=19",
                aiHint: "dslr camera",
            },
            {
                name: "Drones",
                image: "https://picsum.photos/200/200?random=20",
                aiHint: "camera drone",
            },
            {
                name: "Action Cams",
                image: "https://picsum.photos/200/200?random=21",
                aiHint: "action camera",
            },
        ]
    }
];

export function Hero() {
   const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  return (
    <section className="w-full">
        <Carousel 
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {heroSlides.map((slide, index) => (
                    <CarouselItem key={index}>
                        <div className={`w-full bg-gradient-to-r ${slide.gradient}`}>
                            <div className="container mx-auto grid lg:grid-cols-2 gap-8 items-center px-4 py-12 md:py-24">
                                <div className="space-y-4 text-center lg:text-left">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-gray-900 font-headline">
                                    {slide.title}
                                </h1>
                                <p className="text-lg text-gray-800">
                                    {slide.description}
                                </p>
                                <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
                                    <Link href="#">{slide.buttonText}</Link>
                                </Button>
                                </div>

                                <div className="w-full">
                                    <Carousel
                                        opts={{
                                        align: "start",
                                        }}
                                        className="w-full max-w-lg mx-auto"
                                    >
                                        <CarouselContent>
                                        {slide.categories.map((category, index) => (
                                            <CarouselItem key={index} className="basis-1/2 md:basis-1/3">
                                                <Card className="bg-white/20 border-0 rounded-xl">
                                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                                                    <Image
                                                    src={category.image}
                                                    alt={category.name}
                                                    width={200}
                                                    height={200}
                                                    className="rounded-lg object-contain h-40 w-full"
                                                    data-ai-hint={category.aiHint}
                                                    />
                                                    <Link href="#" className="text-lg font-semibold text-gray-900 hover:underline">
                                                        {category.name} &gt;
                                                    </Link>
                                                </CardContent>
                                                </Card>
                                            </CarouselItem>
                                        ))}
                                        </CarouselContent>
                                        <CarouselPrevious className="hidden sm:flex" />
                                        <CarouselNext className="hidden sm:flex" />
                                    </Carousel>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
             <CarouselPrevious className="absolute left-4 hidden sm:flex" />
            <CarouselNext className="absolute right-4 hidden sm:flex" />
        </Carousel>
    </section>
  );
}
