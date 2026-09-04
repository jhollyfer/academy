import Photo from '#models/photo'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Photo>

@inject()
export default class PhotoArchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const photo = await Photo.query().where('id', payload.id).whereNull('deletedAt').first()

      if (!photo) return left(HTTPException.NotFound('Foto não encontrada', 'PHOTO_NOT_FOUND'))

      photo.deletedAt = DateTime.now()
      await photo.save()

      return right(photo)
    } catch (error) {
      logger.error({ err: error }, '[photos > archive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PHOTO_ARCHIVE_ERROR')
      )
    }
  }
}
