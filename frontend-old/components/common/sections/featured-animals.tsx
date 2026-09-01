"use client";

import { useRef } from "react";
import Image from "next/image";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { animals } from "@/lib/data";

export function FeaturedAnimals() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section id="adotar" className="py-20 bg-slate-50 dark:bg-background-dark/50 overflow-hidden">
      <Container className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Amigos à espera de um lar
          </h2>
          <p className="text-muted dark:text-muted-dark mt-2">
            Conheça alguns dos nossos pequenos que buscam uma família.
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Rolar para a esquerda"
            className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-surface dark:hover:bg-surface-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Rolar para a direita"
            className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-surface dark:hover:bg-surface-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </Container>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-4 md:px-20 hide-scrollbar pb-8"
      >
        {animals.map((animal) => (
          <div
            key={animal.id}
            className="min-w-[300px] bg-surface dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
          >
            <div className="relative h-64">
              <Image
                src={animal.imageUrl}
                alt={animal.imageAlt}
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-bold">{animal.name}</h4>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                  {animal.species}
                </span>
              </div>
              <div className="flex items-center text-muted dark:text-muted-dark text-sm mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {animal.location}
              </div>
              <Button variant="outline" className="w-full">
                Conhecer {animal.name}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
