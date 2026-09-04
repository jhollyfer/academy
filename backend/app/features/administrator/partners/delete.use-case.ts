import Partner from '#models/partner'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Partner>

/**
 * Apaga a linha de vez. Só aceita parceiro já arquivado - o caminho para a
 * lixeira é `PATCH /:id/archive`, e exigir a passagem por lá é o que impede um
 * clique de perder o registro sem escala intermediária.
 *
 * A busca não filtra `deletedAt`, senão parceiro vivo e inexistente cairiam no
 * mesmo 404 e o cliente não saberia qual dos dois aconteceu.
 *
 * Sem checagem de dependente, ao contrário de `courses`: nada aponta para
 * `partners`. A logomarca é o inverso disso - é `partners` que aponta para
 * `storages`, e o arquivo sobrevive ao registro.
 */
@inject()
export default class PartnerDeleteUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const partner = await Partner.query().where('id', payload.id).first()

      if (!partner)
        return left(HTTPException.NotFound('Parceiro não encontrado', 'PARTNER_NOT_FOUND'))

      if (!partner.deletedAt)
        return left(
          HTTPException.Conflict('Parceiro não está arquivado', 'PARTNER_NOT_ARCHIVED', {
            id: 'Arquive o parceiro antes de apagá-lo',
          })
        )

      await partner.delete()

      return right(partner)
    } catch (error) {
      logger.error({ err: error }, '[partners > delete][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PARTNER_DELETE_ERROR')
      )
    }
  }
}
