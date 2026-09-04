import Partner from '#models/partner'
import { visiblePartners } from '#features/_shared.storefront'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { Paginated } from '#core/entity'
import type { PaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = PaginationPayload
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class StorefrontPartnerListUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const partners = await visiblePartners(Partner.query())
        .preload('logo')
        // A ordem da faixa é decisão da escola, e é o que a home reflete.
        .orderBy('position', 'asc')
        .orderBy('name', 'asc')
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: partners.getMeta(), data: partners.all() })
    } catch (error) {
      logger.error({ err: error }, '[storefront > partners > list][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PARTNER_LIST_ERROR')
      )
    }
  }
}
