import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * O vínculo entre um responsável e um dependente.
 *
 * Tabela e não coluna em `users` porque a relação é de muitos para muitos nos
 * dois sentidos: mãe e pai precisam ver o mesmo aluno, e um responsável costuma
 * ter mais de um filho na escola. Uma `responsible_id` em `users` resolveria só
 * o segundo caso, e o primeiro apareceria como pedido de suporte.
 *
 * Não substitui os campos `guardian_*` de `enrollments`: aqueles são o que foi
 * declarado no ato da matrícula, imutável; este é quem tem acesso hoje. Os dois
 * divergem legitimamente quando a guarda muda.
 */
export default class extends BaseSchema {
  protected tableName = 'guardianships'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))

      // `CASCADE` nos dois lados: o vínculo não sobrevive a nenhuma das pontas.
      // Diferente de `enrollments`, aqui não há o que preservar - a linha é a
      // relação em si, e uma relação órfã só serviria para vazar acesso.
      table
        .uuid('responsible_id')
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.uuid('student_id').notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at').notNullable()

      // O par é único: vincular duas vezes é ruído, não segunda permissão.
      table.unique(['responsible_id', 'student_id'])
      // A pergunta quente é "quem responde por este aluno", e ela não usa o
      // índice do par, que começa pelo responsável.
      table.index(['student_id'], 'guardianships_student_id_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
