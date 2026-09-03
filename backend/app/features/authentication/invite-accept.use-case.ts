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
      // A conferência entra na transação junto com a gravação, e não antes
      // dela: `resolveInvite` com `trx` lê a linha com `FOR UPDATE`, e é o que
      // faz o convite ser de uso único de verdade. Fora do lock, dois envios do
      // mesmo link leem `consumed_at` nulo antes de qualquer um gravar - e os
      // dois passam.
      //
      // Os dois lados também têm de valer juntos: senha gravada com convite
      // ainda aberto deixa um link válido para trocá-la de novo; convite
      // consumido sem senha tranca a pessoa para fora, sem link e sem
      // credencial.
      return await db.transaction(async function (trx) {
        const resolved = await resolveInvite(token, trx)

        // Nada foi escrito ainda, então sair por aqui não tem o que desfazer.
        if (resolved.isLeft()) return left(resolved.value)

        const invite = resolved.value
        const user = invite.user

        user.useTransaction(trx)
        user.password = password
        user.emailVerifiedAt = DateTime.now()
        await user.save()

        invite.useTransaction(trx)
        invite.consumedAt = DateTime.now()
        await invite.save()

        return right(user)
      })
    } catch (error) {
      logger.error({ err: error }, '[authentication > invite-accept][error]')

      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'INVITE_ACCEPT_ERROR')
      )
    }
  }
}
