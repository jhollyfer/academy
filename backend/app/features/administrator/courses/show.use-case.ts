import Course from '#models/course'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Course>

@inject()
export default class CourseShowUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const course = await Course.query()
        .where('id', payload.id)
        .whereNull('deletedAt')
        // A mesma contagem da listagem, com o mesmo filtro de arquivadas. Tem de
        // ser a mesma: sem ela o `@computed` do modelo devolve `undefined`, o
        // campo some do JSON e a ficha mostrava "Turmas: -" para um curso que a
        // lista ao lado dizia ter três.
        .withCount('classes', function (classes) {
          classes.whereNull('classes.deleted_at')
        })
        // A grade e o FAQ vêm juntos porque a tela de edição mostra os três, e
        // uma segunda chamada para buscá-los seria um waterfall garantido.
        // Ordenados por `position`: a grade é uma sequência de sábados, e
        // `createdAt` não descreve o programa.
        .preload('modules', function (modules) {
          modules.orderBy('position', 'asc')
        })
        .preload('faqs', function (faqs) {
          faqs.orderBy('position', 'asc')
        })
        .preload('cover')
        .first()

      if (!course) return left(HTTPException.NotFound('Curso não encontrado', 'COURSE_NOT_FOUND'))

      return right(course)
    } catch (error) {
      logger.error({ err: error }, '[courses > show][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_SHOW_ERROR')
      )
    }
  }
}
