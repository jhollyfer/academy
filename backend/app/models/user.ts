import { UserSchema } from '#database/schema'
import Storage from '#models/storage'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { ActiveStatus, UserRole } from '#core/entity'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

/**
 * Toda pessoa com acesso, em dois grupos: quem opera a escola (`OWNER`,
 * `ADMINISTRATOR`) e quem é atendido por ela (`RESPONSIBLE`, `STUDENT`).
 *
 * O aluno passou a ter conta, mas só **depois** da confirmação: quem se inscreve
 * pelo site continua acompanhando pelo `protocol` até a secretaria confirmar o
 * Pix, e é a confirmação que dispara o convite. O caminho anônimo não foi
 * substituído, foi estendido - quem nunca ativar o convite segue usando o
 * protocolo, e nada quebra.
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

  /**
   * Os dois lados do vínculo de guarda, sobre a mesma pivô.
   *
   * Auto-relação, então as chaves não podem ficar no default: os dois lados
   * apontam para `users`, e sem dizer qual coluna é a local e qual é a de lá o
   * Lucid liga o responsável a si mesmo.
   *
   * Uma pessoa pode ocupar os dois papéis em linhas diferentes - um aluno maior
   * de idade que também responde pelo irmão mais novo - e é por isso que as duas
   * relações vivem no mesmo model em vez de em dois.
   */
  @manyToMany(() => User, {
    pivotTable: 'guardianships',
    pivotForeignKey: 'responsible_id',
    pivotRelatedForeignKey: 'student_id',
    // `created_at` é `notNullable` na pivô e o `attach` não a preenche sozinho:
    // sem isto todo vínculo estourava a constraint e virava 500. `updatedAt`
    // fica de fora porque a tabela não tem a coluna - o vínculo existe ou não
    // existe, não é editado.
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare dependents: ManyToMany<typeof User>

  @manyToMany(() => User, {
    pivotTable: 'guardianships',
    pivotForeignKey: 'student_id',
    pivotRelatedForeignKey: 'responsible_id',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare responsibles: ManyToMany<typeof User>
}
