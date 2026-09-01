/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'list_courses': {
    methods: ["GET","HEAD"],
    pattern: '/api/courses',
    tokens: [{"old":"/api/courses","type":0,"val":"api","end":""},{"old":"/api/courses","type":0,"val":"courses","end":""}],
    types: placeholder as Registry['list_courses']['types'],
  },
  'list_modules': {
    methods: ["GET","HEAD"],
    pattern: '/api/courses/:courseSlug/modules',
    tokens: [{"old":"/api/courses/:courseSlug/modules","type":0,"val":"api","end":""},{"old":"/api/courses/:courseSlug/modules","type":0,"val":"courses","end":""},{"old":"/api/courses/:courseSlug/modules","type":1,"val":"courseSlug","end":""},{"old":"/api/courses/:courseSlug/modules","type":0,"val":"modules","end":""}],
    types: placeholder as Registry['list_modules']['types'],
  },
  'list_lessons': {
    methods: ["GET","HEAD"],
    pattern: '/api/courses/:courseSlug/lessons',
    tokens: [{"old":"/api/courses/:courseSlug/lessons","type":0,"val":"api","end":""},{"old":"/api/courses/:courseSlug/lessons","type":0,"val":"courses","end":""},{"old":"/api/courses/:courseSlug/lessons","type":1,"val":"courseSlug","end":""},{"old":"/api/courses/:courseSlug/lessons","type":0,"val":"lessons","end":""}],
    types: placeholder as Registry['list_lessons']['types'],
  },
  'lesson_quiz_questions': {
    methods: ["GET","HEAD"],
    pattern: '/api/courses/:courseSlug/lessons/:lessonSlug/quiz-questions',
    tokens: [{"old":"/api/courses/:courseSlug/lessons/:lessonSlug/quiz-questions","type":0,"val":"api","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug/quiz-questions","type":0,"val":"courses","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug/quiz-questions","type":1,"val":"courseSlug","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug/quiz-questions","type":0,"val":"lessons","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug/quiz-questions","type":1,"val":"lessonSlug","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug/quiz-questions","type":0,"val":"quiz-questions","end":""}],
    types: placeholder as Registry['lesson_quiz_questions']['types'],
  },
  'show_lesson': {
    methods: ["GET","HEAD"],
    pattern: '/api/courses/:courseSlug/lessons/:lessonSlug',
    tokens: [{"old":"/api/courses/:courseSlug/lessons/:lessonSlug","type":0,"val":"api","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug","type":0,"val":"courses","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug","type":1,"val":"courseSlug","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug","type":0,"val":"lessons","end":""},{"old":"/api/courses/:courseSlug/lessons/:lessonSlug","type":1,"val":"lessonSlug","end":""}],
    types: placeholder as Registry['show_lesson']['types'],
  },
  'module_quiz_questions': {
    methods: ["GET","HEAD"],
    pattern: '/api/courses/:courseSlug/modules/:moduleName/quiz-questions',
    tokens: [{"old":"/api/courses/:courseSlug/modules/:moduleName/quiz-questions","type":0,"val":"api","end":""},{"old":"/api/courses/:courseSlug/modules/:moduleName/quiz-questions","type":0,"val":"courses","end":""},{"old":"/api/courses/:courseSlug/modules/:moduleName/quiz-questions","type":1,"val":"courseSlug","end":""},{"old":"/api/courses/:courseSlug/modules/:moduleName/quiz-questions","type":0,"val":"modules","end":""},{"old":"/api/courses/:courseSlug/modules/:moduleName/quiz-questions","type":1,"val":"moduleName","end":""},{"old":"/api/courses/:courseSlug/modules/:moduleName/quiz-questions","type":0,"val":"quiz-questions","end":""}],
    types: placeholder as Registry['module_quiz_questions']['types'],
  },
  'quiz_questions': {
    methods: ["GET","HEAD"],
    pattern: '/api/courses/:courseSlug/quiz-questions',
    tokens: [{"old":"/api/courses/:courseSlug/quiz-questions","type":0,"val":"api","end":""},{"old":"/api/courses/:courseSlug/quiz-questions","type":0,"val":"courses","end":""},{"old":"/api/courses/:courseSlug/quiz-questions","type":1,"val":"courseSlug","end":""},{"old":"/api/courses/:courseSlug/quiz-questions","type":0,"val":"quiz-questions","end":""}],
    types: placeholder as Registry['quiz_questions']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
