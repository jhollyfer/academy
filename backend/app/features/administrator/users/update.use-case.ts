import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { Merge } from '#core/entity'
import type { AdministratorUserUpdatePayload, IdentifierPayload } from '#core/validator'

type Payload = Merge<AdministratorUserUpdatePayload, Merge<IdentifierPayload, { actor: User }>>
type Response = Either<HTTPException, User>

@inject()
export default class UserUpdateUseCase {
  async execute({ actor, id, ...payload }: Payload): Promise<Response> {
    try {
      const user = await User.query().where('id', id).whereNull('deletedAt').first()

      if (!user) return left(HTTPException.NotFound('Usuário não encontrado', 'USER_NOT_FOUND'))

      // Aqui é 403, e não o 404 do `show`: quem chega neste ponto já listou o
      // usuário e sabe que ele existe. Esconder viraria "salvei e nada mudou".
      //
      // A regra que mais pega na prática é a do próprio cadastro: o payload
      // nunca aceita `OWNER`, mas sem esta linha um administrador ainda editaria
      // a si mesmo, e a auto-promoção passaria a depender só do validator.
      if (!new UserPolicy().update(actor, user))
        return left(HTTPException.Forbidden('Acesso negado', 'ACCESS_DENIED'))

      if (payload.email) {
        const email = payload.email.toLowerCase()
        const taken = await User.query().where('email', email).whereNot('id', user.id).first()

        if (taken)
          return left(
            HTTPException.Conflict('Usuário já existe', 'USER_ALREADY_EXISTS', {
              email: 'Já existe uma conta com este e-mail',
            })
          )

        user.email = email
      }

      const { email: _ignored, ...rest } = payload
      user.merge(rest)
      await user.save()
      await user.load('avatar')

      return right(user)
    } catch (error) {
      logger.error({ err: error }, '[users > update][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'USER_UPDATE_ERROR')
      )
    }
  }
}
