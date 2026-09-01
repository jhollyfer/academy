import Course from '#models/course'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Course>

/**
 * Envia para a lixeira. Curso já arquivado é indistinguível de inexistente
 * (404), porque o filtro é o mesmo que toda leitura aplica.
 */
@inject()
export default class CourseArchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const course = await Course.query().where('id', payload.id).whereNull('deletedAt').first()

      if (!course) return left(HTTPException.NotFound('Curso não encontrado', 'COURSE_NOT_FOUND'))

      course.deletedAt = DateTime.now()
      await course.save()

      return right(course)
    } catch (error) {
      logger.error({ err: error }, '[courses > archive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_ARCHIVE_ERROR')
      )
    }
  }
}
