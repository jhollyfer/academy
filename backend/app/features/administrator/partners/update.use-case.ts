import Partner from '#models/partner'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import type { Merge } from '#core/entity'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorPartnerUpdatePayload, IdentifierPayload } from '#core/validator'

type Payload = Merge<AdministratorPartnerUpdatePayload, IdentifierPayload>
type Response = Either<HTTPException, Partner>

@inject()
export default class PartnerUpdateUseCase {
  async execute({ id, ...payload }: Payload): Promise<Response> {
    try {
      const partner = await Partner.query().where('id', id).whereNull('deletedAt').first()

      if (!partner)
        return left(HTTPException.NotFound('Parceiro não encontrado', 'PARTNER_NOT_FOUND'))

      // Reenviar o nome que já está gravado não conta como troca: a tela de
      // edição manda o formulário inteiro, e sem esta comparação toda gravação
      // sem mexer no nome viraria 409 contra o próprio registro.
      if (payload.name && payload.name !== partner.name) {
        const exist = await Partner.query().where('name', payload.name).whereNot('id', id).first()

        if (exist)
          return left(
            HTTPException.Conflict('Parceiro já existe', 'PARTNER_ALREADY_EXISTS', {
              name: 'Já existe um parceiro com este nome',
            })
          )
      }

      partner.merge(payload)
      await partner.save()
      await partner.load('logo')

      return right(partner)
    } catch (error) {
      logger.error({ err: error }, '[partners > update][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PARTNER_UPDATE_ERROR')
      )
    }
  }
}
