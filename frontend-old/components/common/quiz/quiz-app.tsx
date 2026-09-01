"use client";

import { QuizProvider, useQuiz } from "./quiz-context";
import { QuizHeader } from "./quiz-header";
import { QuizPhaseRouter } from "./quiz-phase-router";

interface QuizAppProps {
  courseSlug: string;
  courseLabel: string;
  courseLanguage: string;
  questionCount: number;
  title: string;
  backHref: string;
  moduleName?: string;
  lessonSlug?: string;
}

export function QuizApp(props: QuizAppProps): React.JSX.Element {
  return (
    <QuizProvider {...props}>
      <QuizAppInner />
    </QuizProvider>
  );
}

function QuizAppInner(): React.JSX.Element {
  const { error, connected, phase } = useQuiz();

  return (
    <main className="min-h-screen grid-bg relative">
      <QuizHeader />

      {/* Error toast */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-[var(--color-error)] text-white text-sm font-medium shadow-lg animate-in">
          {error}
        </div>
      )}

      {/* Connection indicator */}
      {!connected && phase !== "idle" && (
        <div className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-[var(--color-error)]/10 text-[var(--color-error)] text-xs font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-error)] animate-pulse" />
          Desconectado
        </div>
      )}

      <QuizPhaseRouter />

      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-muted)] relative z-10">
        <p>academy &mdash; Material educacional CETAM</p>
      </footer>
    </main>
  );
}
