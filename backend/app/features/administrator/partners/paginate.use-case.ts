import Partner from '#models/partner'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { TrashedModes, sortOrder, type Paginated } from '#core/entity'
import type { AdministratorPartnerPaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = AdministratorPartnerPaginationPayload
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class PartnerListUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const query = Partner.query().preload('logo')

      // Sem `?trashed` a listagem é a de sempre: só os vivos.
      if (!payload.trashed) query.whereNull('deletedAt')
      if (payload.trashed === TrashedModes.ONLY) query.whereNotNull('deletedAt')

      if (payload.status) query.where('status', payload.status)

      if (payload.search) query.whereILike('name', `%${payload.search}%`)

      const partners = await query
        // `position` e não `name`: a ordem da faixa na home é decisão da escola,
        // e é ela que a tela do painel reflete.
        .orderBy(...sortOrder(payload, 'position'))
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: partners.getMeta(), data: partners.all() })
    } catch (error) {
      logger.error({ err: error }, '[partners > list][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PARTNER_LIST_ERROR')
      )
    }
  }
}
