import Course from '#models/course'
import { attachAnnounceableClasses, visibleCourses } from '#features/_shared.storefront'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { SlugPayload } from '#core/validator'

type Payload = SlugPayload
type Response = Either<HTTPException, Course>

@inject()
export default class StorefrontCourseShowUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const course = await visibleCourses(Course.query())
        .where('slug', payload.slug)
        .preload('cover')
        .preload('modules', function (modules) {
          modules.orderBy('position', 'asc')
        })
        .preload('faqs', function (faqs) {
          faqs.orderBy('position', 'asc')
        })
        .first()

      if (!course) return left(HTTPException.NotFound('Curso não encontrado', 'COURSE_NOT_FOUND'))

      // A próxima turma vai em `$extras` e não numa relação carregada: `classes`
      // é `hasMany`, e um `preload` limitado a uma linha ainda devolveria um
      // array - a landing mostra uma turma, e um array de um item convida a tela
      // a decidir qual é "a próxima", que é decisão do servidor.
      await attachAnnounceableClasses([course])

      return right(course)
    } catch (error) {
      logger.error({ err: error }, '[storefront > courses > show][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_SHOW_ERROR')
      )
    }
  }
}
