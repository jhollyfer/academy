import Photo from '#models/photo'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import type { Merge } from '#core/entity'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorPhotoUpdatePayload, IdentifierPayload } from '#core/validator'

type Payload = Merge<AdministratorPhotoUpdatePayload, IdentifierPayload>
type Response = Either<HTTPException, Photo>

@inject()
export default class PhotoUpdateUseCase {
  async execute({ id, ...payload }: Payload): Promise<Response> {
    try {
      const photo = await Photo.query().where('id', id).whereNull('deletedAt').first()

      if (!photo) return left(HTTPException.NotFound('Foto não encontrada', 'PHOTO_NOT_FOUND'))

      photo.merge(payload)
      await photo.save()
      await photo.load('image')

      return right(photo)
    } catch (error) {
      logger.error({ err: error }, '[photos > update][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PHOTO_UPDATE_ERROR')
      )
    }
  }
}
