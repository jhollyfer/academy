import { apiFetch } from "@/lib/api";

export interface QuizQuestion {
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
  explicacaoErrada: string;
}

export interface ProximoPasso {
  titulo: string;
  descricao: string;
}

export interface Lesson {
  slug: string;
  modulo: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  ordem: number;
  content: string;
  quiz: QuizQuestion[];
  proximosPassos: ProximoPasso[];
}

export interface LessonSummary {
  slug: string;
  modulo: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  ordem: number;
  quizCount: number;
}

export async function getAllLessons(
  courseSlug: string,
): Promise<LessonSummary[]> {
  const data = await apiFetch<{ lessons: LessonSummary[] }>(
    `/api/courses/${courseSlug}/lessons`,
  );

  console.log("Fetched lessons:", data.lessons);
  return data.lessons;
}

export async function getLesson(
  courseSlug: string,
  lessonSlug: string,
): Promise<Lesson | null> {
  try {
    const data = await apiFetch<{ lesson: Lesson }>(
      `/api/courses/${courseSlug}/lessons/${lessonSlug}`,
    );
    console.log("Fetched lesson:", data.lesson);
    return data.lesson;
  } catch {
    return null;
  }
}

export async function getAllLessonSlugs(courseSlug: string): Promise<string[]> {
  const lessons = await getAllLessons(courseSlug);
  console.log(
    "Fetched lesson slugs:",
    lessons.map((l) => l.slug),
  );
  return lessons.map((l) => l.slug);
}
