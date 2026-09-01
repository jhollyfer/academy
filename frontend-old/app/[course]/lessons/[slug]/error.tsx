"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-2xl font-bold">Algo deu errado</h2>
        <p className="text-[var(--color-muted)]">
          Não foi possível carregar a aula. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-all"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
