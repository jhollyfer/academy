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

@inject()
export default class UserShowUseCase {
  async execute({ actor, id }: Payload): Promise<Response> {
    try {
      const user = await User.query()
        .where('id', id)
        .whereNull('deletedAt')
        .preload('avatar')
        // Os dois lados do vínculo: a tela do responsável lista os dependentes,
        // e a do aluno mostra quem responde por ele.
        .preload('dependents')
        .preload('responsibles')
        .first()

      if (!user) return left(HTTPException.NotFound('Usuário não encontrado', 'USER_NOT_FOUND'))

      // 404 e não 403 quando o alvo é o dono: quem não pode vê-lo também não
      // pode descobrir que ele existe neste id. Para os demais casos a policy
      // não recusa leitura, então este é o único ramo.
      if (!new UserPolicy().view(actor, user))
        return left(HTTPException.NotFound('Usuário não encontrado', 'USER_NOT_FOUND'))

      return right(user)
    } catch (error) {
      logger.error({ err: error }, '[users > show][error]')
      return left(HTTPException.InternalServerError('Erro interno do servidor', 'USER_SHOW_ERROR'))
    }
  }
}
