import Photo from '#models/photo'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Photo>

/**
 * Apaga a linha de vez. Só aceita foto já arquivada, pela mesma razão dos
 * demais recursos: exigir a passagem pela lixeira é o que impede um clique de
 * perder o registro.
 *
 * O arquivo não vai junto. `image_id` é `RESTRICT`, então enquanto a foto
 * existir o binário não pode ser apagado - e é só depois deste `DELETE` que ele
 * fica livre em `/storages`.
 */
@inject()
export default class PhotoDeleteUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const photo = await Photo.query().where('id', payload.id).first()

      if (!photo) return left(HTTPException.NotFound('Foto não encontrada', 'PHOTO_NOT_FOUND'))

      if (!photo.deletedAt)
        return left(
          HTTPException.Conflict('Foto não está arquivada', 'PHOTO_NOT_ARCHIVED', {
            id: 'Arquive a foto antes de apagá-la',
          })
        )

      await photo.delete()

      return right(photo)
    } catch (error) {
      logger.error({ err: error }, '[photos > delete][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PHOTO_DELETE_ERROR')
      )
    }
  }
}
