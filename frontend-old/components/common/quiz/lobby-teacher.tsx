"use client";

import { Play, Users, Copy, Check, Clock } from "lucide-react";
import { useState } from "react";
import type { StudentInfo } from "@/lib/ws-protocol";

const DURATION_OPTIONS = [
  { label: "1 min", value: 60 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
] as const;

interface LobbyTeacherProps {
  roomCode: string;
  questionCount: number;
  students: StudentInfo[];
  onStart: (questionDurationSeconds: number) => void;
}

export function LobbyTeacher({
  roomCode,
  questionCount,
  students,
  onStart,
}: LobbyTeacherProps) {
  const [copied, setCopied] = useState(false);
  const [duration, setDuration] = useState(60);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API may fail on HTTP or restricted contexts
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Room code display */}
      <div className="text-center p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl">
        <p className="text-xs font-mono uppercase tracking-widest text-[var(--color-muted)] mb-2">
          Código da sala
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-6xl sm:text-8xl font-black tracking-[0.2em] text-[var(--color-primary)]">
            {roomCode}
          </span>
          <button
            onClick={copyCode}
            className="p-2 rounded-lg hover:bg-[var(--color-primary)]/10 transition-colors cursor-pointer"
            aria-label={copied ? "Código copiado" : "Copiar código da sala"}
            title="Copiar código"
          >
            {copied ? (
              <Check className="w-5 h-5 text-[var(--color-success)]" />
            ) : (
              <Copy className="w-5 h-5 text-[var(--color-muted)]" />
            )}
          </button>
        </div>
        <p className="text-sm text-[var(--color-muted)] mt-3">
          {questionCount} perguntas &middot; Peça aos alunos para acessar a
          mesma página e digitar este código
        </p>
      </div>

      {/* Students list */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-sm font-bold">
            Alunos conectados ({students.length})
          </span>
        </div>

        {students.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-[var(--color-border)] text-center">
            <p className="text-sm text-[var(--color-muted)] animate-pulse">
              Aguardando alunos entrarem...
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {students.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] animate-in"
              >
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-mono text-xs font-bold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium truncate">{s.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Duration selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-sm font-bold">Tempo por pergunta</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDuration(opt.value)}
              className={`p-3 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                duration === opt.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary)]/40"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <div className="text-center pt-2">
        <button
          onClick={() => onStart(duration)}
          disabled={students.length === 0}
          className="px-10 py-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-lg disabled:opacity-40 disabled:cursor-default disabled:transform-none disabled:shadow-none flex items-center gap-3 mx-auto"
        >
          <Play className="w-5 h-5" />
          Iniciar Quiz
        </button>
      </div>
    </div>
  );
}
