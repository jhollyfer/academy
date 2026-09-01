import Class from '#models/class'
import { withSeatsTaken } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Class>

@inject()
export default class ClassShowUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const entity = await withSeatsTaken(Class.query())
        .where('id', payload.id)
        .whereNull('deletedAt')
        .preload('course')
        .first()

      if (!entity) return left(HTTPException.NotFound('Turma não encontrada', 'CLASS_NOT_FOUND'))

      return right(entity)
    } catch (error) {
      logger.error({ err: error }, '[classes > show][error]')
      return left(HTTPException.InternalServerError('Erro interno do servidor', 'CLASS_SHOW_ERROR'))
    }
  }
}
