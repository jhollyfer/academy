import Partner from '#models/partner'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Partner>

@inject()
export default class PartnerShowUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const partner = await Partner.query()
        .where('id', payload.id)
        .whereNull('deletedAt')
        .preload('logo')
        .first()

      if (!partner)
        return left(HTTPException.NotFound('Parceiro não encontrado', 'PARTNER_NOT_FOUND'))

      return right(partner)
    } catch (error) {
      logger.error({ err: error }, '[partners > show][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PARTNER_SHOW_ERROR')
      )
    }
  }
}
