"use client";

import { useSectionVisibility } from "@/hooks/use-section-visibility";

interface AulaSectionProps {
  index: number;
  titulo: string;
  children: React.ReactNode;
}

export function AulaSection({ index, titulo, children }: AulaSectionProps) {
  const { ref, isVisible } = useSectionVisibility();

  return (
    <section
      ref={ref}
      className="relative px-6 py-12 max-w-3xl mx-auto transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(24px)",
      }}
      aria-label={`Seção ${index}: ${titulo}`}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-sm text-[var(--color-primary)] opacity-60">
          // {String(index).padStart(2, "0")}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold">{titulo}</h2>
      </div>
      <div className="space-y-4 text-[var(--color-foreground)]/90 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
