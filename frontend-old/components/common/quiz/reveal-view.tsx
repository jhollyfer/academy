"use client";

import { useEffect, useRef } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import type { RevealedMessage } from "@/lib/ws-protocol";
import type { Role } from "@/hooks/use-quiz-ws";
import { useQuizTimer } from "@/hooks/use-quiz-timer";

interface RevealViewProps {
  revealData: RevealedMessage;
  role: Role;
  myStudentId: string | null;
  questionIndex: number;
  totalQuestions: number;
  onNext: () => void;
}

export function RevealView({
  revealData,
  role,
  myStudentId,
  questionIndex,
  totalQuestions,
  onNext,
}: RevealViewProps) {
  const isLast = questionIndex >= totalQuestions - 1;
  const timer = useQuizTimer(10, true);
  const autoAdvancedRef = useRef(false);

  // Reset on new reveal
  useEffect(() => {
    autoAdvancedRef.current = false;
  }, [questionIndex]);

  // Auto-advance when timer expires (teacher triggers the WS message)
  useEffect(() => {
    if (timer.isExpired && role === "teacher" && !autoAdvancedRef.current) {
      autoAdvancedRef.current = true;
      onNext();
    }
  }, [timer.isExpired, role, onNext]);

  // For student: show their own result
  const myResult =
    role === "student" && myStudentId
      ? revealData.results[myStudentId]
      : null;

  const allResults = Object.values(revealData.results);
  const correctCount = allResults.filter((r) => r.correct).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Auto-advance countdown */}
      <div className="text-center">
        <span className="text-xs font-mono text-[var(--color-muted)]">
          {isLast ? "Ranking final" : "Próxima pergunta"} em{" "}
          <span className="font-bold text-[var(--color-primary)]">
            {timer.secondsLeft}s
          </span>
        </span>
        <div className="w-full max-w-xs mx-auto h-1 rounded-full bg-[var(--color-border)] mt-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-1000 ease-linear"
            style={{ width: `${(timer.secondsLeft / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Student personal result */}
      {myResult && (
        <div
          className={`p-6 rounded-2xl border-2 text-center ${
            myResult.correct
              ? "border-[var(--color-success)] bg-[var(--color-success)]/5"
              : "border-[var(--color-error)] bg-[var(--color-error)]/5"
          }`}
        >
          {myResult.correct ? (
            <>
              <CheckCircle className="w-12 h-12 text-[var(--color-success)] mx-auto mb-2" />
              <p className="text-lg font-black text-[var(--color-success)]">
                Acertou!
              </p>
              <p className="text-sm text-[var(--color-success)] mt-1">
                {revealData.explicacao}
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-12 h-12 text-[var(--color-error)] mx-auto mb-2" />
              <p className="text-lg font-black text-[var(--color-error)]">
                Errou
              </p>
              <p className="text-sm text-[var(--color-error)] mt-1">
                {revealData.explicacaoErrada}
              </p>
            </>
          )}
        </div>
      )}

      {/* Teacher: results per student */}
      {role === "teacher" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">Resultados da Pergunta</h3>
            <span className="text-sm text-[var(--color-muted)]">
              <span className="font-bold text-[var(--color-success)]">
                {correctCount}
              </span>
              /{allResults.length} acertaram
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(revealData.results).map(([sid, result]) => (
              <div
                key={sid}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  result.correct
                    ? "border-[var(--color-success)]/30 bg-[var(--color-success)]/5"
                    : result.selected === -1
                      ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                      : "border-[var(--color-error)]/30 bg-[var(--color-error)]/5"
                }`}
              >
                <span className="text-sm font-medium truncate">
                  {result.studentName}
                </span>
                {result.correct ? (
                  <CheckCircle className="w-5 h-5 text-[var(--color-success)] shrink-0" />
                ) : result.selected === -1 ? (
                  <span className="text-xs text-[var(--color-muted)]">
                    sem resposta
                  </span>
                ) : (
                  <XCircle className="w-5 h-5 text-[var(--color-error)] shrink-0" />
                )}
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div className="p-4 rounded-xl border-l-4 border-[var(--color-success)] bg-[var(--color-success)]/5">
            <p className="text-sm text-[var(--color-success)]">
              {revealData.explicacao}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
