"use client";

import { GraduationCap } from "lucide-react";
import { useQuiz } from "./quiz-context";
import { LobbyTeacher } from "./lobby-teacher";
import { LobbyStudent } from "./lobby-student";
import { QuestionTeacher } from "./question-teacher";
import { QuestionStudent } from "./question-student";
import { RevealView } from "./reveal-view";
import { ResultsDashboard } from "./results-dashboard";



export function QuizPhaseRouter(): React.JSX.Element {
  const ws = useQuiz();

  function handleCreateRoom() {
    ws.createRoom(ws.course.courseSlug, {
      moduleName: ws.course.moduleName,
      lessonSlug: ws.course.lessonSlug,
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16 relative z-10">
      {/* Phase: idle - role selection */}
      {ws.phase === "idle" && (
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={handleCreateRoom}
            disabled={!ws.connected}
            className="w-full p-6 rounded-2xl border-2 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 transition-all cursor-pointer group disabled:opacity-40 disabled:cursor-default"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <GraduationCap className="w-6 h-6 text-[var(--color-primary)] group-hover:text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm">Sou Professor</h3>
                <p className="text-xs text-[var(--color-muted)]">
                  Criar sala e controlar o quiz
                </p>
              </div>
            </div>
          </button>

          <LobbyStudent
            phase={ws.phase}
            students={ws.students}
            onJoin={ws.joinRoom}
            connected={ws.connected}
          />
        </div>
      )}

      {/* Phase: lobby - teacher */}
      {ws.phase === "lobby" && ws.role === "teacher" && (
        <LobbyTeacher
          roomCode={ws.roomCode!}
          questionCount={ws.questionCount}
          students={ws.students}
          onStart={(durationSeconds) => ws.startQuiz(durationSeconds)}
        />
      )}

      {/* Phase: waiting - student */}
      {ws.phase === "waiting" && ws.role === "student" && (
        <LobbyStudent
          phase={ws.phase}
          students={ws.students}
          onJoin={ws.joinRoom}
        />
      )}

      {/* Phase: question - teacher */}
      {ws.phase === "question" && ws.role === "teacher" && ws.currentQuestion && (
        <QuestionTeacher
          key={ws.questionIndex}
          question={ws.currentQuestion}
          questionIndex={ws.questionIndex}
          totalQuestions={ws.totalQuestions}
          questionDuration={ws.questionDuration}
          answeredCount={ws.answeredCount}
          totalStudents={ws.students.length}
          answeredStudents={ws.answeredStudents}
          onReveal={ws.reveal}
        />
      )}

      {/* Phase: question/answered - student */}
      {(ws.phase === "question" || ws.phase === "answered") &&
        ws.role === "student" &&
        ws.currentQuestion && (
          <QuestionStudent
            key={ws.questionIndex}
            question={ws.currentQuestion}
            questionIndex={ws.questionIndex}
            totalQuestions={ws.totalQuestions}
            questionDuration={ws.questionDuration}
            phase={ws.phase}
            myAnswer={ws.myAnswer}
            onAnswer={ws.submitAnswer}
          />
        )}

      {/* Phase: revealed */}
      {ws.phase === "revealed" && ws.revealData && (
        <RevealView
          revealData={ws.revealData!}
          role={ws.role}
          myStudentId={ws.myStudentId}
          questionIndex={ws.questionIndex}
          totalQuestions={ws.totalQuestions}
          onNext={ws.nextQuestion}
        />
      )}

      {/* Phase: finished */}
      {ws.phase === "finished" && (
        <ResultsDashboard
          ranking={ws.ranking}
          role={ws.role}
          myStudentId={ws.myStudentId}
        />
      )}
    </div>
  );
}
