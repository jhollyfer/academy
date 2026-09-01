"use client";

import { useState } from "react";
import { LogIn, Users, Loader2 } from "lucide-react";
import type { StudentInfo } from "@/lib/ws-protocol";
import type { Phase } from "@/hooks/use-quiz-ws";

interface LobbyStudentProps {
  phase: Phase;
  students: StudentInfo[];
  onJoin: (roomCode: string, name: string) => void;
  connected?: boolean;
}

export function LobbyStudent({ phase, students, onJoin, connected = true }: LobbyStudentProps) {
  const [roomCode, setRoomCode] = useState("");
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  function handleJoin() {
    const trimmedName = name.trim();
    if (trimmedName.split(/\s+/).length < 2) {
      setLocalError("Digite seu nome completo (nome e sobrenome).");
      return;
    }
    if (roomCode.length !== 4) {
      setLocalError("O código da sala tem 4 dígitos.");
      return;
    }
    setLocalError(null);
    onJoin(roomCode, trimmedName);
  }

  // Waiting phase - already joined
  if (phase === "waiting") {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2">Você está na sala!</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Aguardando o professor iniciar o quiz...
          </p>
        </div>

        {students.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-[var(--color-muted)]" />
              <span className="text-xs text-[var(--color-muted)]">
                {students.length}{" "}
                {students.length === 1 ? "aluno" : "alunos"} na sala
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {students.map((s) => (
                <span
                  key={s.id}
                  className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium"
                >
                  {s.name.split(" ")[0]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Join form
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--color-primary)]/10">
          <LogIn className="w-7 h-7 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-2xl font-black">Entrar na Sala</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Digite o código que o professor mostrou e seu nome completo
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
            Código da sala
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            className="w-full px-4 py-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center text-3xl font-mono font-black tracking-[0.3em] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-2">
            Seu nome completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            placeholder="Maria da Silva"
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>

        {localError && (
          <p className="text-sm text-[var(--color-error)] text-center">
            {localError}
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={!roomCode || !name.trim() || !connected}
          className="w-full py-4 rounded-2xl bg-[var(--color-primary)] text-white font-bold text-sm hover:opacity-90 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-default flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Entrar
        </button>
      </div>
    </div>
  );
}
