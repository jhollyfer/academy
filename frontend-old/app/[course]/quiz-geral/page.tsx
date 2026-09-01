import { QuizApp } from "@/components/common/quiz/quiz-app";
import { apiFetch } from "@/lib/api";
import { getAllCourseKeys, getCourseConfig } from "@/lib/courses";
import type { Metadata } from "next";
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
    title: `Quiz Geral — ${config.label} com ${config.language}`,
    description: `Quiz geral de ${config.label} com ${config.language} — tempo real.`,
  };
}

export default async function QuizGeralPage({ params }: PageProps) {
  const { course } = await params;
  const config = getCourseConfig(course);
  if (!config) notFound();

  let questionCount = 0;
  try {
    const data = await apiFetch<{ questionCount: number }>(
      `/api/courses/${course}/quiz-questions`,
    );
    questionCount = data.questionCount;
  } catch {
    // fallback to 0 if backend is not available at build time
  }

  return (
    <QuizApp
      courseSlug={course}
      courseLabel={config.label}
      courseLanguage={config.language}
      questionCount={questionCount}
      title="Quiz Geral"
      backHref={`/${course}/lessons`}
    />
  );
}
