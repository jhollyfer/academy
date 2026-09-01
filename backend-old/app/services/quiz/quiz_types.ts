import type { IQuizDataQuestion } from '#core/entity.core'

// ─── Event Keys ───────────────────────────────────────────────────────────────

export const CLIENT_EVENTS = {
  CREATE_ROOM: 'create-room',
  JOIN_ROOM: 'join-room',
  START_QUIZ: 'start-quiz',
  ANSWER: 'answer',
  REVEAL: 'reveal',
  NEXT_QUESTION: 'next-question',
  REJOIN_ROOM: 'rejoin-room',
} as const

export const SERVER_EVENTS = {
  ROOM_CREATED: 'room-created',
  JOINED: 'joined',
  STUDENT_JOINED: 'student-joined',
  STUDENT_LEFT: 'student-left',
  QUESTION: 'question',
  STUDENT_ANSWERED: 'student-answered',
  REVEALED: 'revealed',
  FINISHED: 'finished',
  REJOINED: 'rejoined',
  ERROR: 'error',
  ROOM_CLOSED: 'room-closed',
} as const

// Client -> Server
export type ClientMessage =
  | { type: 'create-room'; courseSlug: string; moduleName?: string; lessonSlug?: string }
  | { type: 'join-room'; roomCode: string; name: string }
  | { type: 'rejoin-room'; roomCode: string; studentId: string }
  | { type: 'start-quiz'; questionDurationSeconds: number }
  | { type: 'answer'; questionIndex: number; selected: number }
  | { type: 'reveal' }
  | { type: 'next-question' }

// Server -> Client
export type ServerMessage =
  | { type: 'room-created'; roomCode: string; questionCount: number }
  | { type: 'joined'; studentId: string; students: StudentInfo[] }
  | { type: 'student-joined'; students: StudentInfo[] }
  | { type: 'student-left'; students: StudentInfo[] }
  | {
      type: 'question'
      questionIndex: number
      totalQuestions: number
      questionDurationSeconds: number
      question: QuestionPayload
    }
  | {
      type: 'student-answered'
      studentId: string
      studentName: string
      answeredCount: number
      totalStudents: number
    }
  | {
      type: 'revealed'
      questionIndex: number
      correctAnswer: number
      explicacao: string
      explicacaoErrada: string
      results: Record<string, { studentName: string; selected: number; correct: boolean }>
    }
  | { type: 'finished'; ranking: RankingEntry[] }
  | {
      type: 'rejoined'
      studentId: string
      students: StudentInfo[]
      phase: string
      questionIndex?: number
      totalQuestions?: number
      question?: QuestionPayload
    }
  | { type: 'error'; message: string }
  | { type: 'room-closed' }

export interface StudentInfo {
  id: string
  name: string
}

export interface QuestionPayload {
  lessonTitulo: string
  lessonDescricao: string
  lessonModulo: string
  pergunta: string
  opcoes: string[]
  correta?: number
}

export interface RankingEntry {
  studentId: string
  name: string
  correct: number
  total: number
  percentage: number
}

export interface Student {
  id: string
  name: string
  wsId: string
  disconnectedAt?: number
  graceTimer?: ReturnType<typeof setTimeout>
}

export interface Room {
  code: string
  courseSlug: string
  moduleName?: string
  lessonSlug?: string
  teacherWsId: string
  students: Map<string, Student>
  questions: IQuizDataQuestion[]
  currentQuestionIndex: number
  answers: Map<string, Map<number, number>>
  phase: 'lobby' | 'question' | 'revealed' | 'finished'
  questionDurationSeconds: number
}

export interface ClientInfo {
  roomCode: string
  role: 'teacher' | 'student'
  studentId?: string
}
