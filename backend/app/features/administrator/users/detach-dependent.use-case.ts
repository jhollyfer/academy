import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { Merge } from '#core/entity'
import type { AdministratorGuardianshipParamsPayload } from '#core/validator'

type Payload = Merge<AdministratorGuardianshipParamsPayload, { actor: User }>
type Response = Either<HTTPException, User>

/**
 * Desliga um dependente de um responsável.
 *
 * Não confere papel: se o vínculo existe, desfazê-lo é sempre permitido. Exigir
 * papel aqui deixaria um vínculo velho preso quando o papel do outro lado
 * mudasse - e o efeito seria acesso que ninguém consegue revogar.
 */
@inject()
export default class GuardianshipDetachUseCase {
  async execute({ actor, id, studentId }: Payload): Promise<Response> {
    try {
      const responsible = await User.query().where('id', id).whereNull('deletedAt').first()

      if (!responsible)
        return left(HTTPException.NotFound('Usuário não encontrado', 'USER_NOT_FOUND'))

      if (!new UserPolicy().manageGuardianship(actor, responsible))
        return left(HTTPException.Forbidden('Acesso negado', 'ACCESS_DENIED'))

      await responsible.related('dependents').detach([studentId])
      await responsible.load('dependents')

      return right(responsible)
    } catch (error) {
      logger.error({ err: error }, '[users > guardianship > detach][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'GUARDIANSHIP_DETACH_ERROR')
      )
    }
  }
}
