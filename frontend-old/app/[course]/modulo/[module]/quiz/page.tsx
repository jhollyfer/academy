import { Quiz } from "@/components/common/quiz";
import { apiFetch } from "@/lib/api";
import { getCourseConfig } from "@/lib/courses";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ course: string; module: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { course, module: moduleName } = await params;
  const config = getCourseConfig(course);
  if (!config) return { title: "Não encontrado" };

  const decoded = decodeURIComponent(moduleName);
  return {
    title: `Quiz — ${decoded}`,
    description: `Quiz do módulo "${decoded}" — tempo real.`,
  };
}

export default async function ModuleQuizPage({ params }: PageProps) {
  const { course, module: moduleName } = await params;
  const config = getCourseConfig(course);
  if (!config) notFound();

  const decoded = decodeURIComponent(moduleName);

  let questionCount = 0;
  try {
    const data = await apiFetch<{ questionCount: number }>(
      `/api/courses/${course}/modules/${encodeURIComponent(decoded)}/quiz-questions`,
    );
    questionCount = data.questionCount;
  } catch {}

  return (
    <Quiz.App
      courseSlug={course}
      courseLabel={config.label}
      courseLanguage={config.language}
      questionCount={questionCount}
      title={`Quiz — ${decoded}`}
      backHref={`/${course}/lessons`}
      moduleName={decoded}
    />
  );
}
