/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  listCourses: typeof routes['list_courses']
  listModules: typeof routes['list_modules']
  listLessons: typeof routes['list_lessons']
  lessonQuizQuestions: typeof routes['lesson_quiz_questions']
  showLesson: typeof routes['show_lesson']
  moduleQuizQuestions: typeof routes['module_quiz_questions']
  quizQuestions: typeof routes['quiz_questions']
}
