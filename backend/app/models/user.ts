import { UserSchema } from '#database/schema'
import Storage from '#models/storage'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { ActiveStatus, UserRole } from '#core/entity'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

/**
 * Quem opera o painel. Não é aluno: o candidato que se matricula não tem conta e
 * não vai ter - ele acompanha o pedido pelo `protocol` da matrícula.
 */
export default class User extends compose(UserSchema, AuthFinder) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  /**
   * Redeclaradas só para estreitar o tipo: `database/schema.ts` é gerado das
   * colunas e entrega todo enum como `string`, então sem isto um typo
   * (`'ADMNISTRATOR'`) compilaria e só apareceria quando o Postgres recusasse o
   * insert. É o mesmo motivo do `status` em `Storage`.
   */
  @column()
  declare role: UserRole

  @column()
  declare status: ActiveStatus

  // Relação declarada à mão: `database/schema.ts` é gerado a partir das colunas
  // e não conhece relacionamentos. Quem anexa aponta para o arquivo, nunca o
  // contrário.
  @belongsTo(() => Storage, { foreignKey: 'avatarId' })
  declare avatar: BelongsTo<typeof Storage>
}
