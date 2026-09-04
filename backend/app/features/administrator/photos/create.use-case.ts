import Photo from '#models/photo'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorPhotoCreatePayload } from '#core/validator'

type Payload = AdministratorPhotoCreatePayload
type Response = Either<HTTPException, Photo>

/**
 * Sem guarda de duplicata, ao contrário de cursos e parceiros: a mesma sala
 * fotografada duas vezes são duas fotos legítimas, e não existe campo que sirva
 * de identidade. O que evita repetição aqui é a galeria estar à vista de quem
 * cadastra, não uma constraint.
 */
@inject()
export default class PhotoCreateUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const created = await Photo.create(payload)

      // `status` e `position` vêm de DEFAULT no banco, e o INSERT do Lucid só
      // devolve a chave primária.
      await created.refresh()
      await created.load('image')

      return right(created)
    } catch (error) {
      logger.error({ err: error }, '[photos > create][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'PHOTO_CREATE_ERROR')
      )
    }
  }
}
