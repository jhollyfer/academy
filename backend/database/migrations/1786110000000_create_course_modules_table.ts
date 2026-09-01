import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'course_modules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      // `CASCADE`: um módulo não existe fora do curso. Diferente de `classes`,
      // que é `RESTRICT` porque uma turma tem matrícula pendurada e apagar em
      // cascata levaria gente junto.
      table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('CASCADE')
      // A posição na grade - o "sábado 1", "sábado 2". Sem `unique` com
      // `course_id`: reordenar a grade trocaria duas posições, e um índice único
      // recusaria o estado intermediário mesmo dentro de uma transação.
      table.integer('position').notNullable().defaultTo(0)
      table.string('title', 200).notNullable()
      table.text('description').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()
      table.index(['course_id', 'position'], 'course_modules_course_id_position_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
