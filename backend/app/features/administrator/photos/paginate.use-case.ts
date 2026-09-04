import Photo from '#models/photo'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { TrashedModes, sortOrder, type Paginated } from '#core/entity'
import type { AdministratorPhotoPaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = AdministratorPhotoPaginationPayload
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class PhotoListUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const query = Photo.query().preload('image')

      if (!payload.trashed) query.whereNull('deletedAt')
      if (payload.trashed === TrashedModes.ONLY) query.whereNotNull('deletedAt')

      if (payload.status) query.where('status', payload.status)
      if (payload.search) query.whereILike('caption', `%${payload.search}%`)

      const photos = await query
        .orderBy(...sortOrder(payload, 'position'))
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: photos.getMeta(), data: photos.all() })
    } catch (error) {
      logger.error({ err: error }, '[photos > list][error]')
      return left(HTTPException.InternalServerError('Erro interno do servidor', 'PHOTO_LIST_ERROR'))
    }
  }
}
