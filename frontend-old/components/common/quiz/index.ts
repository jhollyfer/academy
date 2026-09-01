import { QuizProvider } from './quiz-context'
import { QuizApp } from './quiz-app'
import { QuizHeader } from './quiz-header'
import { QuizPhaseRouter } from './quiz-phase-router'
import { LobbyTeacher } from './lobby-teacher'
import { LobbyStudent } from './lobby-student'
import { QuestionTeacher } from './question-teacher'
import { QuestionStudent } from './question-student'
import { RevealView } from './reveal-view'
import { ResultsDashboard } from './results-dashboard'

export { useQuiz } from './quiz-context'
export type { Phase, Role } from '@/hooks/use-quiz-ws'

export const Quiz = Object.assign(QuizProvider, {
  App: QuizApp,
  Header: QuizHeader,
  PhaseRouter: QuizPhaseRouter,
  Lobby: {
    Teacher: LobbyTeacher,
    Student: LobbyStudent,
  },
  Question: {
    Teacher: QuestionTeacher,
    Student: QuestionStudent,
  },
  Reveal: RevealView,
  Results: ResultsDashboard,
})
