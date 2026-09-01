export default function Loading(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
      <div className="h-4 w-32 rounded bg-[var(--color-border)] animate-pulse mb-8" />
      <div className="space-y-3 mb-8">
        <div className="h-3 w-40 rounded bg-[var(--color-border)] animate-pulse" />
        <div className="h-8 w-80 rounded-lg bg-[var(--color-border)] animate-pulse" />
        <div className="h-4 w-64 rounded bg-[var(--color-border)] animate-pulse" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-[var(--color-border)] animate-pulse"
            style={{ width: `${60 + Math.random() * 40}%` }}
          />
        ))}
      </div>
    </div>
  );
}
