import { BaseSchema } from '@adonisjs/lucid/schema'
import { ACTIVE_STATUSES, ActiveStatuses, COURSE_ACCENTS } from '#core/entity'

export default class extends BaseSchema {
  protected tableName = 'courses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      // O identificador público, o que aparece em `/cursos/:slug`. Único porque
      // é endereço - e é por ele que a criação decide entre ressuscitar uma
      // linha arquivada e recusar uma duplicata viva.
      table.string('slug', 140).notNullable().unique()
      table.string('name', 160).notNullable()
      // A linha de apoio do card e do hero. Curta de propósito: o que não cabe
      // aqui é `description`.
      table.string('tagline', 200).nullable()
      table.text('description').notNullable()
      // O acento visual, para a landing pintar card e hero sem que ninguém
      // toque em folha de estilo quando um curso novo entrar.
      table.enum('accent', COURSE_ACCENTS).notNullable()

      // Carga e duração são do curso, não da turma: mudam quando o programa
      // muda, e não a cada nova entrada de alunos. A data de início é que é da
      // turma.
      table.integer('workload_hours').notNullable()
      table.integer('duration_months').notNullable()
      // Idade mínima. Nula quando o curso não tem restrição - diferente de
      // zero, que afirmaria que qualquer idade serve.
      table.integer('minimum_age').nullable()
      table.text('requirements').nullable()
      // "O que você vai construir". Separado de `description` porque é o que
      // vende: projeto final converte melhor que ementa.
      table.text('project_outcome').nullable()

      // Dinheiro em centavos inteiros. Ponto flutuante não representa R$ 150,10
      // exatamente, e um erro de arredondamento em preço vira reclamação de
      // matrícula.
      table.integer('enrollment_fee_in_cents').notNullable()
      table.integer('monthly_fee_in_cents').notNullable()

      table.uuid('cover_id').nullable().references('id').inTable('storages').onDelete('SET NULL')

      // A ordem dos cards na home. Coluna e não `created_at`: a escola decide
      // qual curso aparece primeiro, e isso não tem relação com qual foi
      // cadastrado antes.
      table.integer('position').notNullable().defaultTo(0)
      // Tira da vitrine sem apagar - um curso pode sair do ar entre duas turmas
      // e voltar. `deleted_at` abaixo é outra coisa: é a lixeira.
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
