import Partner from '#models/partner'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorPartnerCreatePayload } from '#core/validator'

type Payload = AdministratorPartnerCreatePayload
type Response = Either<HTTPException, Partner>

@inject()
export default class PartnerCreateUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const partner = await Partner.query().where('name', payload.name).first()

      if (partner?.deletedAt) {
        // `name` é UNIQUE global e a remoção é lógica: criar de novo esbarraria
        // no índice. Reativa a linha existente com os dados novos, preservando
        // `id` e `created_at`.
        partner.merge({ ...payload, deletedAt: null })
        await partner.save()
        await partner.load('logo')
        return right(partner)
      }

      if (partner)
        return left(
          HTTPException.Conflict('Parceiro já existe', 'PARTNER_ALREADY_EXISTS', {
            name: 'Já existe um parceiro com este nome',
          })
        )

      const created = await Partner.create(payload)

      // `status` e `position` são preenchidos por DEFAULT no banco, e o INSERT
      // do Lucid só devolve a chave primária - sem o refresh a resposta sairia
      // com eles indefinidos.
      await created.refresh()
      await created.load('logo')

      return right(created)
    } catch (error) {
      logger.error({ err: error }, '[partners > create][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PARTNER_CREATE_ERROR')
      )
    }
  }
}
