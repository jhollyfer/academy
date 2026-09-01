/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import swagger from '#config/swagger'
import AutoSwagger from 'adonis-autoswagger'

// ─── Documentation ────────────────────────────────────────────────────────────

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/documentation', async () => {
  return AutoSwagger.default.scalar('/swagger')
})

router.get('/', (ctx) => ctx.response.redirect('/documentation'))

// ─── Health ──────────────────────────────────────────────────────────────────

router.get('/health-check', async ({ response }) => {
  return response.ok({ status: 'ok' })
})

// ─── Content API ─────────────────────────────────────────────────────────────

const ListCoursesController = () => import('#resources/courses/list/list.controller')
const ListModulesController = () => import('#resources/courses/modules/modules.controller')
const ListLessonsController = () => import('#resources/lessons/list/list.controller')
const ShowLessonController = () => import('#resources/lessons/show/show.controller')
const QuizQuestionsController = () => import('#resources/quiz/questions/questions.controller')
const LessonQuizQuestionsController = () =>
  import('#resources/quiz/lesson-questions/lesson-questions.controller')
const ModuleQuizQuestionsController = () =>
  import('#resources/quiz/module-questions/module-questions.controller')

router
  .group(() => {
    router.get('courses', [ListCoursesController])
    router.get('courses/:courseSlug/modules', [ListModulesController])
    router.get('courses/:courseSlug/lessons', [ListLessonsController])
    router.get('courses/:courseSlug/lessons/:lessonSlug/quiz-questions', [
      LessonQuizQuestionsController,
    ])
    router.get('courses/:courseSlug/lessons/:lessonSlug', [ShowLessonController])
    router.get('courses/:courseSlug/modules/:moduleName/quiz-questions', [
      ModuleQuizQuestionsController,
    ])
    router.get('courses/:courseSlug/quiz-questions', [QuizQuestionsController])
  })
  .prefix('/api')
