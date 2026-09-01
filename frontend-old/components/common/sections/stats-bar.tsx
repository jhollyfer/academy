import { Container } from "@/components/ui/container";
import { stats } from "@/lib/data";

export function StatsBar() {
  return (
    <section className="bg-primary/5 dark:bg-primary/10 py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`p-6 ${
                i === 1
                  ? "border-y md:border-y-0 md:border-x border-primary/10"
                  : ""
              }`}
            >
              <p className="text-4xl font-black text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-muted dark:text-muted-dark font-medium uppercase tracking-wide text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
