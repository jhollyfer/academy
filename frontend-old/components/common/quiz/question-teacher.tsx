"use client";

import { useEffect, useRef } from "react";
import { BookOpen, CheckCircle, Users } from "lucide-react";
import type { QuestionPayload } from "@/lib/ws-protocol";
import { useQuizTimer } from "@/hooks/use-quiz-timer";

interface QuestionTeacherProps {
  question: QuestionPayload;
  questionIndex: number;
  totalQuestions: number;
  questionDuration: number;
  answeredCount: number;
  totalStudents: number;
  answeredStudents: string[];
  onReveal: () => void;
}

export function QuestionTeacher({
  question,
  questionIndex,
  totalQuestions,
  questionDuration,
  answeredCount,
  totalStudents,
  answeredStudents,
  onReveal,
}: QuestionTeacherProps) {
  const timer = useQuizTimer(questionDuration, true);
  const autoRevealedRef = useRef(false);

  // Reset on new question
  useEffect(() => {
    autoRevealedRef.current = false;
  }, [questionIndex]);

  // Auto-reveal when timer expires
  useEffect(() => {
    if (timer.isExpired && !autoRevealedRef.current) {
      autoRevealedRef.current = true;
      onReveal();
    }
  }, [timer.isExpired, onReveal]);

  const timerColor = timer.isCritical
    ? "text-[var(--color-error)]"
    : timer.isUrgent
      ? "text-amber-500"
      : "text-[var(--color-success)]";

  const timerPulse = timer.isCritical || timer.isUrgent ? "animate-pulse" : "";

  const timerPercent = (timer.secondsLeft / questionDuration) * 100;
  const timerBarColor = timer.isCritical
    ? "bg-[var(--color-error)]"
    : timer.isUrgent
      ? "bg-amber-500"
      : "bg-[var(--color-success)]";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono text-[var(--color-muted)]">
          Pergunta {questionIndex + 1}/{totalQuestions}
        </span>
        <div className="flex items-center gap-4">
          <span
            className={`text-2xl font-black font-mono tabular-nums ${timerColor} ${timerPulse}`}
          >
            {timer.secondsLeft >= 60
              ? `${Math.floor(timer.secondsLeft / 60)}:${String(timer.secondsLeft % 60).padStart(2, "0")}`
              : `${timer.secondsLeft}s`}
          </span>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="font-bold text-[var(--color-primary)]">
              {answeredCount}/{totalStudents}
            </span>
            <span className="text-[var(--color-muted)]">responderam</span>
          </div>
        </div>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerBarColor}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Progress */}
      <div className="w-full h-1.5 rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
          style={{
            width: `${(questionIndex / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Concept */}
      <div className="p-5 rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-primary)] font-bold">
              {question.lessonModulo}
            </span>
            <h3 className="font-bold text-base mt-0.5">
              {question.lessonTitulo}
            </h3>
          </div>
        </div>
        <p className="text-sm text-[var(--color-muted)] leading-relaxed pl-12">
          {question.lessonDescricao}
        </p>
      </div>

      {/* Question + options */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="font-semibold text-base mb-6">
          <span className="font-mono text-[var(--color-muted)] mr-2">
            {String(questionIndex + 1).padStart(2, "0")}.
          </span>
          {question.pergunta}
        </p>

        <div className="grid gap-3">
          {question.opcoes.map((opcao, i) => {
            const isCorrect = i === question.correta;
            return (
              <div
                key={i}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between ${
                  isCorrect
                    ? "border-[var(--color-success)] bg-[var(--color-success)]/5"
                    : "border-[var(--color-border)]"
                }`}
              >
                <span
                  className={`text-sm ${isCorrect ? "font-bold text-[var(--color-success)]" : ""}`}
                >
                  {opcao}
                </span>
                {isCorrect && (
                  <CheckCircle className="w-5 h-5 text-[var(--color-success)] shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Who answered */}
      {answeredStudents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {answeredStudents.map((name, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] text-xs font-medium"
            >
              {name.split(" ")[0]} ✓
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
