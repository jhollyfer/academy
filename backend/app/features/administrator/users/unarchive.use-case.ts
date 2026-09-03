import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { Merge } from '#core/entity'
import type { IdentifierPayload } from '#core/validator'

type Payload = Merge<IdentifierPayload, { actor: User }>
type Response = Either<HTTPException, User>

/**
 * Tira da lixeira. A busca não filtra `deletedAt`, senão usuário vivo e
 * inexistente cairiam no mesmo 404 e o cliente não saberia qual dos dois foi.
 */
@inject()
export default class UserUnarchiveUseCase {
  async execute({ actor, id }: Payload): Promise<Response> {
    try {
      const user = await User.query().where('id', id).first()

      if (!user) return left(HTTPException.NotFound('Usuário não encontrado', 'USER_NOT_FOUND'))

      if (!new UserPolicy().archive(actor, user))
        return left(HTTPException.Forbidden('Acesso negado', 'ACCESS_DENIED'))

      if (!user.deletedAt)
        return left(
          HTTPException.Conflict('Usuário não está arquivado', 'USER_NOT_ARCHIVED', {
            id: 'O usuário já está ativo',
          })
        )

      user.deletedAt = null
      await user.save()

      return right(user)
    } catch (error) {
      logger.error({ err: error }, '[users > unarchive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'USER_UNARCHIVE_ERROR')
      )
    }
  }
}
