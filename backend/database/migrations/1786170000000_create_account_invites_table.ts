import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * O convite que transforma uma matrícula confirmada em conta de acesso.
 *
 * Guarda o **hash** do token, nunca o token: ele viaja por e-mail e fica na
 * caixa de entrada do titular para sempre. Vazamento do banco não pode entregar
 * junto o poder de assumir as contas - é o mesmo raciocínio da coluna
 * `password`, e a comparação aqui também é por hash.
 */
export default class extends BaseSchema {
  protected tableName = 'account_invites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.string('token_hash', 255).notNullable().unique()
      table.timestamp('expires_at').notNullable()
      // Consumido é diferente de expirado: um convite usado precisa continuar
      // existindo para que reabrir o link responda "já usado" em vez de "não
      // existe", que manda a pessoa pedir outro sem necessidade.
      table.timestamp('consumed_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      // Buscar o convite aberto de um usuário, para não emitir dois.
      table.index(['user_id', 'consumed_at'], 'account_invites_user_id_consumed_at_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
