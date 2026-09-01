export default function Loading(): React.JSX.Element {
  return (
    <main className="min-h-screen grid-bg relative">
      <div className="pt-20 pb-16 px-6 text-center">
        <div className="h-6 w-48 mx-auto rounded-full bg-[var(--color-border)] animate-pulse mb-6" />
        <div className="h-10 w-64 mx-auto rounded-lg bg-[var(--color-border)] animate-pulse mb-4" />
        <div className="h-4 w-96 mx-auto rounded bg-[var(--color-border)] animate-pulse" />
      </div>
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-4 w-48 rounded bg-[var(--color-border)] animate-pulse" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, j) => (
                <div
                  key={j}
                  className="h-24 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
