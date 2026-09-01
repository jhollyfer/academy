import { Aula } from "@/components/common/aula";
import { getAllCourseKeys, getCourseConfig } from "@/lib/courses";
import { highlightCodeBlocks } from "@/lib/highlight";
import { getAllLessons, getLesson } from "@/lib/lessons";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ course: string; slug: string }>;
}

export async function generateStaticParams() {
  const params: { course: string; slug: string }[] = [];
  for (const course of getAllCourseKeys()) {
    const config = getCourseConfig(course);
    if (!config) continue;
    try {
      const lessons = await getAllLessons(course);
      for (const lesson of lessons) {
        params.push({ course, slug: lesson.slug });
      }
    } catch {
      // Backend offline — pages will be rendered on-demand (SSR)
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { course, slug } = await params;
  const config = getCourseConfig(course);
  if (!config) return { title: "Aula não encontrada" };
  const lesson = await getLesson(course, slug);
  if (!lesson) return { title: "Aula não encontrada" };
  return {
    title: `${lesson.titulo} — academy`,
    description: lesson.descricao,
  };
}

export default async function CourseAulaPage({ params }: PageProps) {
  const { course, slug } = await params;
  const config = getCourseConfig(course);
  if (!config) notFound();

  const [lesson, allLessons] = await Promise.all([
    getLesson(course, slug),
    getAllLessons(course),
  ]);
  if (!lesson) notFound();

  const currentIndex = allLessons.findIndex((l) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const readingTime = Math.max(
    5,
    Math.ceil(lesson.content.split(/\s+/).length / 200),
  );
  const highlightedCode = await highlightCodeBlocks(lesson.content);

  return (
    <>
      <Aula.ProgressBar />

      <div className="max-w-[1440px] mx-auto flex min-h-screen relative">
        <Aula.Sidebar
          courseSlug={course}
          modulo={lesson.modulo}
          titulo={lesson.titulo}
          contentHtml={lesson.content}
          currentIndex={currentIndex + 1}
          totalAulas={allLessons.length}
        />

        <main className="flex-1 w-full max-w-4xl mx-auto px-6 lg:px-12 py-12 pb-32">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href={`/${course}/lessons`}
              className="text-sm font-mono text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Todas as aulas
            </Link>
            <span className="text-xs font-mono text-[var(--color-muted)]">
              {String(currentIndex + 1).padStart(2, "0")}/
              {String(allLessons.length).padStart(2, "0")}
            </span>
          </div>

          <Aula.Header
            modulo={lesson.modulo}
            titulo={lesson.titulo}
            subtitulo={lesson.subtitulo}
            ordem={lesson.ordem}
            totalAulas={allLessons.length}
            readingTime={readingTime}
          />

          <div className="prose-aula">
            <Aula.Markdown
              content={lesson.content}
              highlightedCode={highlightedCode}
            />
          </div>

          {lesson.quiz.length > 0 && (
            <div className="mt-16 p-8 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
              <h3 className="text-xl font-bold mb-2">Quiz da Aula</h3>
              <p className="text-[var(--color-muted)] mb-6">
                {lesson.quiz.length} perguntas &middot; Tempo real com o
                professor
              </p>
              <Link
                href={`/${course}/lessons/${slug}/quiz`}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
              >
                Iniciar Quiz
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <Aula.NextSteps passos={lesson.proximosPassos} />

          <nav className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {prevLesson ? (
              <Link
                href={`/${course}/lessons/${prevLesson.slug}`}
                className="group p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all"
              >
                <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2 block">
                  Aula anterior
                </span>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors shrink-0">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-base leading-tight">
                    {String(currentIndex).padStart(2, "0")}. {prevLesson.titulo}
                  </p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            {nextLesson ? (
              <Link
                href={`/${course}/lessons/${nextLesson.slug}`}
                className="group p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:shadow-lg hover:border-[var(--color-primary)]/30 transition-all text-right"
              >
                <span className="text-xs font-bold text-[var(--color-muted)] uppercase tracking-widest mb-2 block">
                  Próxima aula
                </span>
                <div className="flex items-center justify-end gap-4">
                  <p className="font-bold text-base leading-tight">
                    {String(currentIndex + 2).padStart(2, "0")}.{" "}
                    {nextLesson.titulo}
                  </p>
                  <div className="w-10 h-10 rounded-full bg-[var(--color-border)] flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors shrink-0">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ) : (
              <div />
            )}
          </nav>

          {nextLesson && (
            <footer className="mt-24 pt-12 border-t border-[var(--color-border)] text-center">
              <h4 className="text-2xl font-black mb-4">Pronto para avançar?</h4>
              <p className="text-[var(--color-muted)] mb-8">
                Siga para a próxima aula e continue sua jornada de aprendizado.
              </p>
              <Link
                href={`/${course}/lessons/${nextLesson.slug}`}
                className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 px-10 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Concluir e ir para próxima aula
                <ArrowRight className="w-5 h-5" />
              </Link>
            </footer>
          )}
        </main>
      </div>

      <Aula.BackToTop />
    </>
  );
}
