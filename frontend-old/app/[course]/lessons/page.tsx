import { getAllCourseKeys, getCourseConfig } from "@/lib/courses";
import type { LessonSummary } from "@/lib/lessons";
import { getAllLessons } from "@/lib/lessons";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Infinity,
  Layers,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ course: string }>;
}

export function generateStaticParams() {
  return getAllCourseKeys().map((course) => ({ course }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { course } = await params;
  const config = getCourseConfig(course);
  if (!config) return { title: "Curso não encontrado" };
  return {
    title: `academy — ${config.label} com ${config.language}`,
    description: `Aulas interativas de ${config.label} com ${config.language} — quizzes e exercícios práticos.`,
  };
}

function groupByModulo(lessons: LessonSummary[]) {
  const groups: Record<string, LessonSummary[]> = {};
  for (const lesson of lessons) {
    if (!groups[lesson.modulo]) groups[lesson.modulo] = [];
    groups[lesson.modulo].push(lesson);
  }
  return Object.entries(groups);
}

export default async function CourseLessonsPage({ params }: PageProps) {
  const { course } = await params;
  const config = getCourseConfig(course);
  if (!config) notFound();

  let lessons: LessonSummary[] = [];
  try {
    lessons = await getAllLessons(course);
  } catch {
    // Backend offline — render with empty lessons
  }
  const modulos = groupByModulo(lessons);
  let aulaIndex = 0;

  return (
    <main className="min-h-screen grid-bg relative">
      <header className="pt-20 pb-16 px-6 text-center relative z-10">
        <span className="inline-block px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 mb-6">
          {config.label} · {config.language}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4">
          Aulas
        </h1>
        <p className="text-[var(--color-muted)] text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Domine lógica de programação com aulas interativas, quizzes práticos e
          exercícios que constroem sua base de conhecimento.
        </p>

        <div className="max-w-2xl mx-auto rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm p-6 sm:p-8">
          <div className="grid grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <span className="text-2xl sm:text-3xl font-mono font-black text-[var(--color-foreground)]">
                {lessons.length}
              </span>
              <span className="text-xs text-[var(--color-muted)] font-medium uppercase tracking-wider">
                Aulas
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-[var(--color-success)]" />
              </div>
              <span className="text-2xl sm:text-3xl font-mono font-black text-[var(--color-foreground)]">
                {modulos.length}
              </span>
              <span className="text-xs text-[var(--color-muted)] font-medium uppercase tracking-wider">
                Módulos
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-11 h-11 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
                <Infinity className="w-5 h-5 text-[var(--color-warning)]" />
              </div>
              <span className="text-2xl sm:text-3xl font-mono font-black text-[var(--color-foreground)]">
                &infin;
              </span>
              <span className="text-xs text-[var(--color-muted)] font-medium uppercase tracking-wider">
                Prática
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-12 relative z-10">
        {modulos.map(([modulo, aulasDoModulo]) => (
          <section key={modulo}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-mono font-bold text-[var(--color-primary)] uppercase tracking-wider">
                  {modulo}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-muted)]">
                  {aulasDoModulo.length}{" "}
                  {aulasDoModulo.length === 1 ? "aula" : "aulas"}
                </span>
              </div>
              <Link
                href={`/${course}/modulo/${encodeURIComponent(modulo)}/quiz`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
              >
                <ClipboardList className="w-3 h-3" />
                Quiz
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {aulasDoModulo.map((aula) => {
                const i = aulaIndex++;
                return (
                  <Link
                    key={aula.slug}
                    href={`/${course}/lessons/${aula.slug}`}
                    className="group block p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 hover:shadow-lg hover:shadow-[var(--color-primary)]/5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <span className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-mono text-sm font-bold group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors duration-200">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm group-hover:text-[var(--color-primary)] transition-colors leading-snug">
                          {aula.titulo}
                        </h3>
                        <p className="text-xs text-[var(--color-muted)] mt-1.5 line-clamp-2">
                          {aula.subtitulo}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-12 relative z-10 text-center">
        <Link
          href={`/${course}/quiz-geral`}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-lg"
        >
          <ClipboardList className="w-4 h-4" />
          Quiz Geral — Todas as perguntas do curso
        </Link>
      </div>

      <footer className="border-t border-[var(--color-border)] py-8 text-center text-xs text-[var(--color-muted)] relative z-10">
        <p>academy — Material educacional CETAM</p>
      </footer>
    </main>
  );
}
