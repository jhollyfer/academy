import Partner from '#models/partner'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Partner>

/**
 * Tira da lixeira. O espelho de `archive`: busca só o que está arquivado, então
 * parceiro vivo é 404 aqui pela mesma razão que parceiro arquivado é 404 lá.
 *
 * Sem guarda de colisão de `name`: `create` ressuscita a linha arquivada em vez
 * de inserir outra, então não existe registro-sombra ocupando o `unique`.
 */
@inject()
export default class PartnerUnarchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const partner = await Partner.query()
        .where('id', payload.id)
        .whereNotNull('deletedAt')
        .first()

      if (!partner)
        return left(HTTPException.NotFound('Parceiro não encontrado', 'PARTNER_NOT_FOUND'))

      partner.deletedAt = null
      await partner.save()

      return right(partner)
    } catch (error) {
      logger.error({ err: error }, '[partners > unarchive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PARTNER_UNARCHIVE_ERROR')
      )
    }
  }
}
