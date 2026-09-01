"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useQuiz } from "./quiz-context";

export function QuizHeader(): React.JSX.Element {
  const { course, phase } = useQuiz();

  return (
    <header className="pt-8 sm:pt-12 pb-6 sm:pb-8 px-6 text-center relative z-10">
      <Link
        href={course.backHref}
        className="inline-flex items-center gap-2 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar
      </Link>
      <div>
        <span className="inline-block px-3 py-1 text-xs font-mono font-bold tracking-widest uppercase rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 mb-3">
          {course.courseLabel} &middot; {course.courseLanguage}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black">{course.title}</h1>
        {phase === "idle" && (
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {course.questionCount} perguntas &middot; Tempo real
          </p>
        )}
      </div>
    </header>
  );
}
