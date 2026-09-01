"use client";

import { createContext, useContext } from "react";
import { useQuizWs } from "@/hooks/use-quiz-ws";

type QuizWs = ReturnType<typeof useQuizWs>;

interface CourseInfo {
  courseSlug: string;
  courseLabel: string;
  courseLanguage: string;
  questionCount: number;
  title: string;
  backHref: string;
  moduleName?: string;
  lessonSlug?: string;
}

interface QuizContextValue extends QuizWs {
  course: CourseInfo;
}

const QuizContext = createContext<QuizContextValue | null>(null);

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) {
    throw new Error("useQuiz must be used within <Quiz>");
  }
  return ctx;
}

interface QuizProviderProps extends CourseInfo {
  children: React.ReactNode;
}

export function QuizProvider({
  children,
  courseSlug,
  courseLabel,
  courseLanguage,
  questionCount,
  title,
  backHref,
  moduleName,
  lessonSlug,
}: QuizProviderProps) {
  const ws = useQuizWs();
  const course: CourseInfo = {
    courseSlug,
    courseLabel,
    courseLanguage,
    questionCount,
    title,
    backHref,
    moduleName,
    lessonSlug,
  };

  return (
    <QuizContext.Provider value={{ ...ws, course }}>
      {children}
    </QuizContext.Provider>
  );
}
