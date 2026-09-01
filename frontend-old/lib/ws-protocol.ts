// Client -> Server
export type ClientMessage =
  | { type: "create-room"; courseSlug: string; moduleName?: string; lessonSlug?: string }
  | { type: "join-room"; roomCode: string; name: string }
  | { type: "rejoin-room"; roomCode: string; studentId: string }
  | { type: "start-quiz"; questionDurationSeconds: number }
  | { type: "answer"; questionIndex: number; selected: number }
  | { type: "reveal" }
  | { type: "next-question" };

// Server -> Client
export type ServerMessage =
  | { type: "room-created"; roomCode: string; questionCount: number }
  | { type: "joined"; studentId: string; students: StudentInfo[] }
  | { type: "student-joined"; students: StudentInfo[] }
  | { type: "student-left"; students: StudentInfo[] }
  | {
      type: "question";
      questionIndex: number;
      totalQuestions: number;
      questionDurationSeconds: number;
      question: QuestionPayload;
    }
  | {
      type: "student-answered";
      studentId: string;
      studentName: string;
      answeredCount: number;
      totalStudents: number;
    }
  | {
      type: "revealed";
      questionIndex: number;
      correctAnswer: number;
      explicacao: string;
      explicacaoErrada: string;
      results: Record<
        string,
        { studentName: string; selected: number; correct: boolean }
      >;
    }
  | { type: "finished"; ranking: RankingEntry[] }
  | {
      type: "rejoined";
      studentId: string;
      students: StudentInfo[];
      phase: string;
      questionIndex?: number;
      totalQuestions?: number;
      question?: QuestionPayload;
    }
  | { type: "error"; message: string }
  | { type: "room-closed" };

export interface StudentInfo {
  id: string;
  name: string;
}

export interface QuestionPayload {
  lessonTitulo: string;
  lessonDescricao: string;
  lessonModulo: string;
  pergunta: string;
  opcoes: string[];
  correta?: number; // only sent to teacher
}

export type RevealedMessage = Extract<ServerMessage, { type: "revealed" }>;

export interface RankingEntry {
  studentId: string;
  name: string;
  correct: number;
  total: number;
  percentage: number;
}
