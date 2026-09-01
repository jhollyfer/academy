import { Clock } from "lucide-react";

interface AulaHeaderProps {
  modulo: string;
  titulo: string;
  subtitulo: string;
  ordem: number;
  totalAulas: number;
  readingTime?: number;
}

export function AulaHeader({
  modulo,
  titulo,
  subtitulo,
  ordem,
  totalAulas,
  readingTime,
}: AulaHeaderProps) {
  const estimatedTime = readingTime ?? Math.max(5, Math.ceil(titulo.length / 3));

  return (
    <header className="mb-12">
      <div className="flex items-center gap-4 mb-6">
        <span className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider border border-[var(--color-primary)]/20">
          {modulo}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] font-medium">
          <Clock className="w-3.5 h-3.5" />
          {estimatedTime} min
        </span>
      </div>

      <h1 className="text-4xl lg:text-6xl font-black mb-6 flex items-start gap-4 leading-[1.1]">
        <span className="text-[var(--color-foreground)]/10 select-none font-mono shrink-0">
          {String(ordem).padStart(2, "0")}.
        </span>
        <span>{titulo}</span>
      </h1>

      <p className="text-xl text-[var(--color-muted)] leading-relaxed font-light">
        {subtitulo}
      </p>
    </header>
  );
}
