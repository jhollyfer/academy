import Image from "next/image";
import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  return (
    <section className="py-24">
      <Container>
        <SectionHeading title="Histórias de Sucesso" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-surface dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-border dark:border-border-dark italic relative"
            >
              <Quote className="absolute top-6 right-8 h-14 w-14 text-primary/20" />
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4 not-italic">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={t.avatarUrl}
                    alt={t.avatarAlt}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-muted dark:text-muted-dark">
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
