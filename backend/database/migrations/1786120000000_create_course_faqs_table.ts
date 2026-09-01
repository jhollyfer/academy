import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'course_faqs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      // Nulo é o FAQ da home, o que vale para a escola inteira ("as aulas são
      // presenciais?"). Preenchido é o FAQ daquele curso. Uma tabela só porque a
      // pergunta e a resposta têm exatamente a mesma forma nos dois casos, e
      // duas tabelas obrigariam a duplicar o CRUD.
      table.uuid('course_id').nullable().references('id').inTable('courses').onDelete('CASCADE')
      table.integer('position').notNullable().defaultTo(0)
      table.string('question', 300).notNullable()
      table.text('answer').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()
      table.index(['course_id', 'position'], 'course_faqs_course_id_position_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
