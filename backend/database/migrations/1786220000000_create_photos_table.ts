import { BaseSchema } from '@adonisjs/lucid/schema'
import { ACTIVE_STATUSES, ActiveStatuses } from '#core/entity'

export default class extends BaseSchema {
  protected tableName = 'photos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))

      /*
       * A imagem é o conteúdo, e por isso é obrigatória e `RESTRICT`.
       *
       * Diferente de `courses.cover_id` e `partners.logo_id`, que são `SET NULL`
       * porque o curso e o parceiro continuam existindo sem arte. Uma foto sem
       * arquivo não é nada, e deixar a coluna virar nula publicaria uma célula
       * vazia na galeria.
       */
      table.uuid('image_id').notNullable().references('id').inTable('storages').onDelete('RESTRICT')

      /*
       * A legenda, obrigatória.
       *
       * Foto de escola sem legenda é banco de imagens: o que faz a galeria
       * provar alguma coisa é dizer o que se está vendo e onde - "a sala do
       * CETI num sábado de manhã" prova existência, "alunos felizes" não prova
       * nada. É o mesmo argumento do `role` do parceiro.
       */
      table.string('caption', 200).notNullable()

      // A ordem na galeria, pela mesma razão de `partners.position`.
      table.integer('position').notNullable().defaultTo(0)
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
