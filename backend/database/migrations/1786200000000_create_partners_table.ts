import { BaseSchema } from '@adonisjs/lucid/schema'
import { ACTIVE_STATUSES, ActiveStatuses } from '#core/entity'

export default class extends BaseSchema {
  protected tableName = 'partners'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))

      // O nome da instituição como ela assina - "CETI Aristélio Sabino de
      // Oliveira", e não "CETI". Quem lê a página precisa reconhecer o prédio
      // pelo nome que a cidade usa.
      //
      // Único porque é a identidade do parceiro: não há `slug` aqui (parceiro
      // não tem página própria), então é o nome que a criação usa para decidir
      // entre ressuscitar uma linha arquivada e recusar uma duplicata viva.
      table.string('name', 160).notNullable().unique()

      // O que o parceiro faz pela escola, numa linha. É o campo que carrega a
      // credibilidade: uma grade de logos sem papel declarado não prova nada, e
      // com dois parceiros a explicação é o que separa parceria de decoração.
      table.string('role', 200).notNullable()

      // O site da instituição. Nulo porque escola pública de cidade pequena
      // muitas vezes não tem - e um card sem link é melhor que um link morto.
      table.string('url', 300).nullable()

      table.uuid('logo_id').nullable().references('id').inTable('storages').onDelete('SET NULL')

      // A ordem na faixa da home, pela mesma razão de `courses.position`: quem
      // aparece primeiro é decisão da escola, e não tem relação com quem foi
      // cadastrado antes.
      table.integer('position').notNullable().defaultTo(0)
      // Tira da vitrine sem apagar - uma parceria pode ficar suspensa entre dois
      // convênios e voltar. `deleted_at` abaixo é a lixeira, que é outra coisa.
      table.enum('status', ACTIVE_STATUSES).notNullable().defaultTo(ActiveStatuses.ACTIVE)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
