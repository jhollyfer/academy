import Photo from '#models/photo'
import { visiblePhotos } from '#features/_shared.storefront'
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
const PER_PAGE = 24

@inject()
export default class StorefrontPhotoListUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const photos = await visiblePhotos(Photo.query())
        .preload('image')
        .orderBy('position', 'asc')
        .orderBy('createdAt', 'asc')
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: photos.getMeta(), data: photos.all() })
    } catch (error) {
      logger.error({ err: error }, '[storefront > photos > list][error]')
      return left(HTTPException.InternalServerError('Erro interno do servidor', 'PHOTO_LIST_ERROR'))
    }
  }
}
