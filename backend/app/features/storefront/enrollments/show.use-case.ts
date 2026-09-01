import Enrollment from '#models/enrollment'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { ProtocolPayload } from '#core/validator'

type Payload = ProtocolPayload
type Response = Either<HTTPException, Enrollment>

@inject()
export default class StorefrontEnrollmentShowUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const enrollment = await Enrollment.query()
        .where('protocol', payload.protocol)
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

      // As anotações da secretaria são **sobre** o candidato, e não para ele.
      // Apagar do objeto em memória é o que as tira da resposta sem exigir uma
      // segunda projeção do recurso inteiro - o valor no banco não é tocado.
      enrollment.notes = null

      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[storefront > enrollments > show][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_SHOW_ERROR')
      )
    }
  }
}
