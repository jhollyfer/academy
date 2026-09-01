import { Quiz } from "@/components/common/quiz";
import { apiFetch } from "@/lib/api";
import { getCourseConfig } from "@/lib/courses";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ course: string; slug: string }>;
}

async function getLessonTitle(course: string, slug: string): Promise<string> {
  try {
    const res = await apiFetch<{ lesson: { titulo: string } }>(
      `/api/courses/${course}/lessons/${slug}`,
    );
    return res.lesson.titulo;
  } catch {
    return slug;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { course, slug } = await params;
  const config = getCourseConfig(course);
  if (!config) return { title: "Não encontrado" };

  const lessonTitle = await getLessonTitle(course, slug);
  return {
    title: `Quiz — ${lessonTitle}`,
    description: `Quiz da aula "${lessonTitle}" — tempo real.`,
  };
}

export default async function LessonQuizPage({ params }: PageProps) {
  const { course, slug } = await params;
  const config = getCourseConfig(course);
  if (!config) notFound();

  const [lessonTitle, quizData] = await Promise.all([
    getLessonTitle(course, slug),
    apiFetch<{ questionCount: number }>(
      `/api/courses/${course}/lessons/${slug}/quiz-questions`,
    ).catch(() => ({ questionCount: 0 })),
  ]);

  return (
    <Quiz.App
      courseSlug={course}
      courseLabel={config.label}
      courseLanguage={config.language}
      questionCount={quizData.questionCount}
      title={`Quiz — ${lessonTitle}`}
      backHref={`/${course}/lessons/${slug}`}
      lessonSlug={slug}
    />
  );
}
