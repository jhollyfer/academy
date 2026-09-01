"use client";

import { Trophy, Medal, RotateCcw } from "lucide-react";
import type { RankingEntry } from "@/lib/ws-protocol";
import type { Role } from "@/hooks/use-quiz-ws";

interface ResultsDashboardProps {
  ranking: RankingEntry[];
  role: Role;
  myStudentId: string | null;
}

export function ResultsDashboard({
  ranking,
  role,
  myStudentId,
}: ResultsDashboardProps) {
  const medalColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10">
          <Trophy className="w-8 h-8 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-2xl font-black">Ranking Final</h2>
        <p className="text-sm text-[var(--color-muted)]">
          {ranking.length} {ranking.length === 1 ? "aluno" : "alunos"} &middot;{" "}
          {ranking[0]?.total || 0} perguntas
        </p>
      </div>

      {/* Podium top 3 */}
      {ranking.length >= 3 && (
        <div className="flex items-end justify-center gap-4 pb-4">
          {/* 2nd place */}
          <div className="text-center">
            <div className="w-20 h-24 rounded-t-xl bg-gray-400/20 flex flex-col items-center justify-end pb-3">
              <Medal className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs font-bold truncate max-w-[72px]">
                {ranking[1].name.split(" ")[0]}
              </span>
              <span className="text-xs font-mono text-[var(--color-muted)]">
                {ranking[1].percentage}%
              </span>
            </div>
          </div>
          {/* 1st place */}
          <div className="text-center">
            <div className="w-24 h-32 rounded-t-xl bg-yellow-500/20 flex flex-col items-center justify-end pb-3">
              <Medal className="w-8 h-8 text-yellow-500 mb-1" />
              <span className="text-sm font-black truncate max-w-[88px]">
                {ranking[0].name.split(" ")[0]}
              </span>
              <span className="text-xs font-mono text-[var(--color-muted)]">
                {ranking[0].percentage}%
              </span>
            </div>
          </div>
          {/* 3rd place */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-t-xl bg-amber-700/20 flex flex-col items-center justify-end pb-3">
              <Medal className="w-6 h-6 text-amber-700 mb-1" />
              <span className="text-xs font-bold truncate max-w-[72px]">
                {ranking[2].name.split(" ")[0]}
              </span>
              <span className="text-xs font-mono text-[var(--color-muted)]">
                {ranking[2].percentage}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Full ranking list */}
      <div className="space-y-3">
        {ranking.map((entry, i) => {
          const isMe = entry.studentId === myStudentId;
          const pct = entry.percentage;

          return (
            <div
              key={entry.studentId}
              className={`p-5 rounded-2xl border bg-[var(--color-surface)] transition-all ${
                isMe
                  ? "border-[var(--color-primary)]/40 shadow-lg shadow-[var(--color-primary)]/5 ring-2 ring-[var(--color-primary)]/20"
                  : i === 0
                    ? "border-[var(--color-primary)]/40 shadow-lg shadow-[var(--color-primary)]/5"
                    : "border-[var(--color-border)]"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Position */}
                <div className="shrink-0 w-10 h-10 flex items-center justify-center">
                  {i < 3 ? (
                    <Medal className={`w-7 h-7 ${medalColors[i]}`} />
                  ) : (
                    <span className="font-mono text-lg font-bold text-[var(--color-muted)]">
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm truncate">
                      {entry.name}
                      {isMe && (
                        <span className="ml-2 text-xs text-[var(--color-primary)]">
                          (você)
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 ml-3 font-mono text-sm font-bold">
                      <span
                        className={
                          pct >= 70
                            ? "text-[var(--color-success)]"
                            : pct >= 50
                              ? "text-[var(--color-warning)]"
                              : "text-[var(--color-error)]"
                        }
                      >
                        {entry.correct}
                      </span>
                      <span className="text-[var(--color-muted)]">
                        /{entry.total}
                      </span>
                      <span className="text-[var(--color-muted)] ml-2">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--color-border)]">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct >= 70
                          ? "bg-[var(--color-success)]"
                          : pct >= 50
                            ? "bg-[var(--color-warning)]"
                            : "bg-[var(--color-error)]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teacher: new quiz */}
      {role === "teacher" && (
        <div className="text-center pt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-all active:scale-95 cursor-pointer flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Novo Quiz
          </button>
        </div>
      )}
    </div>
  );
}
