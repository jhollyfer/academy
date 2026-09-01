import Enrollment from '#models/enrollment'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Enrollment>

@inject()
export default class EnrollmentShowUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const enrollment = await Enrollment.query()
        .where('id', payload.id)
        .whereNull('deletedAt')
        .preload('class', function (turma) {
          turma.preload('course')
        })
        .preload('files', function (files) {
          files.preload('storage')
        })
        .first()

      if (!enrollment)
        return left(HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND'))

      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[enrollments > show][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_SHOW_ERROR')
      )
    }
  }
}
