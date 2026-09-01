"use client";

import { useScrollProgress } from "@/hooks/use-scroll-progress";

export function AulaProgressBar() {
  const progress = useScrollProgress();

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1.5 bg-[var(--color-border)] z-50"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso da aula"
    >
      <div
        className="h-full bg-[var(--color-primary)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
