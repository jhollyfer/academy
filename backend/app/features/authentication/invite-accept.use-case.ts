import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { resolveInvite } from '#features/_shared.invite'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type { AuthenticationInviteAcceptPayload } from '#core/validator'

type Payload = AuthenticationInviteAcceptPayload
type Response = Either<HTTPException, User>

/**
 * Definir a senha pelo convite.
 *
 * É a única porta por onde a senha de um responsável ou aluno é escolhida por
 * ele mesmo - a secretaria cadastra, mas nunca define credencial de família.
 *
 * A senha é atribuída **em texto puro**: o mixin `withAuthFinder` do `User`
 * cifra no `beforeSave`. Cifrar aqui gravaria o hash do hash.
 *
 * `emailVerifiedAt` é preenchido junto porque consumir o convite prova a posse
 * da caixa: o token só existiu dentro daquele e-mail.
 */
@inject()
export default class AuthenticationInviteAcceptUseCase {
  async execute({ token, password }: Payload): Promise<Response> {
    try {
      const resolved = await resolveInvite(token)

      if (resolved.isLeft()) return left(resolved.value)

      const invite = resolved.value
      const user = invite.user

      // Em transação: os dois lados têm de valer juntos. Senha gravada com
      // convite ainda aberto deixa um link válido para trocá-la de novo;
      // convite consumido sem senha gravada tranca a pessoa para fora, sem link
      // e sem credencial.
      await db.transaction(async function (trx) {
        user.useTransaction(trx)
        user.password = password
        user.emailVerifiedAt = DateTime.now()
        await user.save()

        invite.useTransaction(trx)
        invite.consumedAt = DateTime.now()
        await invite.save()
      })

      return right(user)
    } catch (error) {
      logger.error({ err: error }, '[authentication > invite-accept][error]')

      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'INVITE_ACCEPT_ERROR')
      )
    }
  }
}
