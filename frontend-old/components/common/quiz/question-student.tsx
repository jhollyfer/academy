"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, Check, Loader2 } from "lucide-react";
import type { QuestionPayload } from "@/lib/ws-protocol";
import type { Phase } from "@/hooks/use-quiz-ws";
import { useQuizTimer } from "@/hooks/use-quiz-timer";
import { useUrgencySound } from "@/hooks/use-urgency-sound";

interface QuestionStudentProps {
  question: QuestionPayload;
  questionIndex: number;
  totalQuestions: number;
  questionDuration: number;
  phase: Phase;
  myAnswer: number | null;
  onAnswer: (selected: number) => void;
}

export function QuestionStudent({
  question,
  questionIndex,
  totalQuestions,
  questionDuration,
  phase,
  myAnswer,
  onAnswer,
}: QuestionStudentProps) {
  const hasAnswered = phase === "answered";
  const isActive = phase === "question";

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const timer = useQuizTimer(questionDuration, isActive);
  const autoSubmittedRef = useRef(false);

  // Som toca quando: tempo restante ≤15% da duração E o aluno ainda não selecionou nada
  useUrgencySound(
    timer.isUrgent && timer.secondsLeft > 0 && isActive && selectedOption === null,
    timer.secondsLeft
  );

  // Reset selected option on new question
  useEffect(() => {
    if (isActive) {
      setSelectedOption(null);
      autoSubmittedRef.current = false;
    }
  }, [isActive, questionIndex]);

  // Auto-submit when timer expires
  useEffect(() => {
    if (timer.isExpired && isActive && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      if (selectedOption !== null) {
        onAnswer(selectedOption);
      }
      // If no selection, do nothing — backend treats as "sem resposta"
    }
  }, [timer.isExpired, isActive, selectedOption, onAnswer]);

  function handleConfirm() {
    if (selectedOption !== null && isActive) {
      onAnswer(selectedOption);
    }
  }

  // Timer color classes
  const timerColor = timer.isCritical
    ? "text-[var(--color-error)]"
    : timer.isUrgent
      ? "text-amber-500"
      : "text-[var(--color-success)]";

  const timerPulse = timer.isCritical
    ? "animate-pulse"
    : timer.isUrgent
      ? "animate-pulse"
      : "";

  // Timer bar percentage
  const timerPercent = (timer.secondsLeft / questionDuration) * 100;
  const timerBarColor = timer.isCritical
    ? "bg-[var(--color-error)]"
    : timer.isUrgent
      ? "bg-amber-500"
      : "bg-[var(--color-success)]";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress + Timer */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-mono text-[var(--color-muted)]">
          {questionIndex + 1}/{totalQuestions}
        </span>
        {isActive && (
          <span
            className={`text-2xl font-black font-mono tabular-nums ${timerColor} ${timerPulse}`}
          >
            {timer.secondsLeft >= 60
              ? `${Math.floor(timer.secondsLeft / 60)}:${String(timer.secondsLeft % 60).padStart(2, "0")}`
              : `${timer.secondsLeft}s`}
          </span>
        )}
      </div>

      {/* Timer bar */}
      {isActive && (
        <div className="w-full h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerBarColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
          style={{
            width: `${(questionIndex / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Concept */}
      <div className="p-4 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5">
        <div className="flex items-start gap-3">
          <BookOpen className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-primary)] font-bold">
              {question.lessonModulo}
            </span>
            <h3 className="font-bold text-sm mt-0.5">
              {question.lessonTitulo}
            </h3>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              {question.lessonDescricao}
            </p>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <p className="font-semibold text-base">
          <span className="font-mono text-[var(--color-muted)] mr-2">
            {String(questionIndex + 1).padStart(2, "0")}.
          </span>
          {question.pergunta}
        </p>

        <div className="grid gap-3">
          {question.opcoes.map((opcao, i) => {
            const isSelected = hasAnswered ? myAnswer === i : selectedOption === i;
            // Lock selection when critical (≤10s) and already picked, or when answered
            const isLocked = hasAnswered || (timer.secondsLeft <= 5 && selectedOption !== null);

            return (
              <button
                key={i}
                onClick={() => {
                  if (!isLocked && isActive) setSelectedOption(i);
                }}
                disabled={isLocked}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  isLocked && !isSelected
                    ? "border-[var(--color-border)] opacity-40"
                    : isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 cursor-pointer active:scale-[0.98]"
                } disabled:cursor-default`}
              >
                <span
                  className={`text-sm ${isSelected ? "font-bold text-[var(--color-primary)]" : ""}`}
                >
                  {opcao}
                </span>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
                {!isSelected && !isLocked && (
                  <div className="w-6 h-6 rounded-full border-2 border-[var(--color-border)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Confirm button */}
        {isActive && selectedOption !== null && (
          <div className="text-center pt-2">
            <button
              onClick={handleConfirm}
              className="px-10 py-4 rounded-2xl bg-[var(--color-success)] text-white font-bold text-sm hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-lg flex items-center gap-2 mx-auto"
            >
              <Check className="w-5 h-5" />
              Confirmar Resposta
            </button>
          </div>
        )}

        {hasAnswered && (
          <div className="text-center p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin mx-auto mb-2" />
            <p className="text-sm text-[var(--color-muted)]">
              Aguardando revelar a resposta...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
