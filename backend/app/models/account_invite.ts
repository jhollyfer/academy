import { AccountInviteSchema } from '#database/schema'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

/**
 * O convite que transforma uma matrícula confirmada em conta de acesso.
 *
 * A coluna guarda o hash do token, nunca o token: quem emite mostra o valor cru
 * uma única vez, para o e-mail, e não consegue recuperá-lo depois. Reenviar um
 * convite é emitir outro, e não reler este.
 */
export default class AccountInvite extends AccountInviteSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  /**
   * Se o convite ainda pode ser usado.
   *
   * Consumido e expirado são estados diferentes de propósito: os dois recusam,
   * mas só o primeiro justifica dizer "esta conta já foi ativada" em vez de
   * mandar pedir outro link.
   */
  get isUsable(): boolean {
    return this.consumedAt === null && this.expiresAt > DateTime.now()
  }
}
