import Course from '#models/course'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Course>

/**
 * Tira da lixeira. O espelho de `archive`: busca só o que está arquivado, então
 * curso vivo é 404 aqui pela mesma razão que curso arquivado é 404 lá.
 *
 * Sem guarda de colisão de `slug`: `create` ressuscita a linha arquivada em vez
 * de inserir outra, então não existe registro-sombra ocupando o `unique`.
 */
@inject()
export default class CourseUnarchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const course = await Course.query().where('id', payload.id).whereNotNull('deletedAt').first()

      if (!course) return left(HTTPException.NotFound('Curso não encontrado', 'COURSE_NOT_FOUND'))

      course.deletedAt = null
      await course.save()

      return right(course)
    } catch (error) {
      logger.error({ err: error }, '[courses > unarchive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_UNARCHIVE_ERROR')
      )
    }
  }
}
