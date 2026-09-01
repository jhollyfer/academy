interface ProximoPasso {
  titulo: string;
  descricao: string;
}

interface AulaNextStepsProps {
  passos: ProximoPasso[];
}

export function AulaNextSteps({ passos }: AulaNextStepsProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <span className="font-mono text-sm text-[var(--color-primary)] opacity-60">→</span>
        Próximos passos
      </h2>
      <div className="grid gap-3">
        {passos.map((passo, i) => (
          <div
            key={i}
            className="flex gap-4 items-start p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <span className="font-mono text-sm text-[var(--color-primary)] mt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-semibold text-sm">{passo.titulo}</p>
              <p className="text-sm text-[var(--color-muted)] mt-1">{passo.descricao}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
