import { BaseSchema } from '@adonisjs/lucid/schema'
import { ENROLLMENT_FILE_KINDS } from '#core/entity'

export default class extends BaseSchema {
  protected tableName = 'enrollment_files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      // `CASCADE`: o vínculo não existe sem a matrícula. O binário no bucket não
      // é apagado por isso - `storages` tem remoção lógica própria e a varredura
      // de arquivo órfão é outra rotina.
      table
        .uuid('enrollment_id')
        .notNullable()
        .references('id')
        .inTable('enrollments')
        .onDelete('CASCADE')
      // `RESTRICT`: apagar a linha do arquivo enquanto uma matrícula aponta para
      // ele deixaria a secretaria sem o comprovante que justifica a confirmação.
      table
        .uuid('storage_id')
        .notNullable()
        .references('id')
        .inTable('storages')
        .onDelete('RESTRICT')
      // Comprovante do Pix ou documento. Tabela de vínculo e não coluna
      // `receipt_id` em `enrollments`: o candidato pode reenviar o comprovante
      // depois de a secretaria recusar o primeiro, e o histórico do que foi
      // enviado importa numa conferência manual.
      table.enum('kind', ENROLLMENT_FILE_KINDS).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['enrollment_id', 'kind'], 'enrollment_files_enrollment_id_kind_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
