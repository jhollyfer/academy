import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import { Merge } from '#core/entity'
import type { IdentifierPayload } from '#core/validator'

type Payload = Merge<IdentifierPayload, { actor: User }>
type Response = Either<HTTPException, User>

/**
 * Envia para a lixeira. Usuário já arquivado é indistinguível de inexistente
 * (404), porque o filtro é o mesmo que toda leitura aplica.
 *
 * A conta arquivada perde o acesso na hora: o guard confere `deleted_at` a cada
 * requisição, então o token que já estava emitido para de valer.
 */
@inject()
export default class UserArchiveUseCase {
  async execute({ actor, id }: Payload): Promise<Response> {
    try {
      const user = await User.query().where('id', id).whereNull('deletedAt').first()

      if (!user) return left(HTTPException.NotFound('Usuário não encontrado', 'USER_NOT_FOUND'))

      // Inclui o caso de arquivar a si mesmo, que a policy recusa: é o caminho
      // mais curto para alguém se trancar do lado de fora do painel.
      if (!new UserPolicy().archive(actor, user))
        return left(HTTPException.Forbidden('Acesso negado', 'ACCESS_DENIED'))

      user.deletedAt = DateTime.now()
      await user.save()

      return right(user)
    } catch (error) {
      logger.error({ err: error }, '[users > archive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'USER_ARCHIVE_ERROR')
      )
    }
  }
}
