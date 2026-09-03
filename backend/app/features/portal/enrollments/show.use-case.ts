import Enrollment from '#models/enrollment'
import User from '#models/user'
import { scopeEnrollmentsTo } from '#features/_shared.portal'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { Merge } from '#core/entity'
import type { IdentifierPayload } from '#core/validator'

type Payload = Merge<IdentifierPayload, { actor: User }>
type Response = Either<HTTPException, Enrollment>

/**
 * O detalhe de uma matrícula do próprio escopo.
 *
 * Matrícula de outra pessoa responde **404, não 403**. A diferença não é
 * estética: 403 confirmaria que aquele id existe, e a lista de matrículas de uma
 * escola é justamente o que o recorte pretende não revelar. Fora do escopo, o
 * registro simplesmente não existe para quem pergunta.
 */
@inject()
export default class PortalEnrollmentShowUseCase {
  async execute({ actor, id }: Payload): Promise<Response> {
    try {
      const query = Enrollment.query()
        .where('id', id)
        .whereNull('deletedAt')
        .preload('class')
        .preload('files')

      scopeEnrollmentsTo(query, actor)

      const enrollment = await query.first()

      if (!enrollment)
        return left(HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND'))

      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[portal > enrollments > show][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_SHOW_ERROR')
      )
    }
  }
}
