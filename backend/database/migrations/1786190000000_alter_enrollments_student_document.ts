import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * O CPF do aluno passa a ser obrigatório e único **por turma**.
 *
 * A coluna nasceu nula com a justificativa de que "o candidato menor pode não
 * ter CPF próprio". Não se sustentou: o CPF é emitido desde o nascimento, e sem
 * ele nada distingue duas matrículas da mesma pessoa - foi o que o teste de
 * aceitação encontrou, com a mesma inscrição entrando duas vezes.
 *
 * Único por turma, e não global: a mesma pessoa cursa robótica e desenvolvimento
 * web, e repete no semestre seguinte. O que não pode é entrar duas vezes na
 * mesma turma, e é exatamente isso que o par `(class_id, student_document)`
 * cobra. Índice global travaria matrícula legítima para resolver um problema que
 * não existe.
 *
 * O `down` devolve a coluna a nula, mas não devolve os dados: o `up` recusa
 * rodar sobre linha sem CPF, e reverter não reinventa o que nunca foi coletado.
 */
export default class extends BaseSchema {
  protected tableName = 'enrollments'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('student_document', 11).notNullable().alter()
      table.unique(['class_id', 'student_document'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['class_id', 'student_document'])
      table.string('student_document', 11).nullable().alter()
    })
  }
}
