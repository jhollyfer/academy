import Class from '#models/class'
import { syncClassStatus } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Class>

/**
 * Tira da lixeira. O espelho de `archive`: busca só o que está arquivado, então
 * turma viva é 404 aqui pela mesma razão que turma arquivada é 404 lá.
 */
@inject()
export default class ClassUnarchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const entity = await Class.query().where('id', payload.id).whereNotNull('deletedAt').first()

      if (!entity) return left(HTTPException.NotFound('Turma não encontrada', 'CLASS_NOT_FOUND'))

      entity.deletedAt = null
      await entity.save()

      // Enquanto esteve na lixeira, matrícula pode ter sido cancelada. O status
      // volta reconciliado com a ocupação real, não com a que ele tinha.
      await syncClassStatus(entity)

      return right(entity)
    } catch (error) {
      logger.error({ err: error }, '[classes > unarchive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'CLASS_UNARCHIVE_ERROR')
      )
    }
  }
}
