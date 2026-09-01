import { BaseSchema } from '@adonisjs/lucid/schema'
import { ENROLLMENT_STATUSES, EnrollmentStatuses } from '#core/entity'

export default class extends BaseSchema {
  protected tableName = 'enrollments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      // `RESTRICT`: apagar uma turma não pode apagar quem se inscreveu nela.
      table.uuid('class_id').notNullable().references('id').inTable('classes').onDelete('RESTRICT')

      // O identificador que o candidato leva embora. Separado do `id` de
      // propósito: é ele que aparece na URL de acompanhamento
      // (`/matricula/:protocol`), e essa URL é a única credencial de quem não
      // tem conta - o `id` continua interno e não vaza por um link
      // compartilhado. Uuid e não sequencial, porque sequencial se adivinha.
      table
        .uuid('protocol')
        .notNullable()
        .unique()
        .defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      table
        .enum('status', ENROLLMENT_STATUSES)
        .notNullable()
        .defaultTo(EnrollmentStatuses.PENDING)

      // ---------------------------------------------------------------------
      // Candidato
      // ---------------------------------------------------------------------
      table.string('student_name', 160).notNullable()
      // Exigida: é ela que decide se o responsável legal é obrigatório. Sem a
      // data, a regra de menor de idade não teria como ser aplicada no servidor,
      // e ficaria valendo só a caixinha que o navegador marcou.
      table.date('student_birth_date').notNullable()
      // Só dígitos - a máscara é do frontend, e normalizar antes de gravar é o
      // que impede duplicata por formatação diferente. Nulo porque o candidato
      // menor pode não ter CPF próprio.
      table.string('student_document', 11).nullable()
      table.string('email', 254).notNullable()
      table.string('phone', 11).notNullable()

      // ---------------------------------------------------------------------
      // Responsável legal
      // ---------------------------------------------------------------------
      // Nulas no banco e condicionais na aplicação: obrigatórias quando
      // `student_birth_date` indica menor de 18, e proibidas de fazer sentido
      // quando não. O banco não sabe calcular idade na data do envio, então a
      // regra mora no validator - e é lá que ela é testada.
      table.string('guardian_name', 160).nullable()
      table.string('guardian_document', 11).nullable()
      table.string('guardian_phone', 11).nullable()

      // ---------------------------------------------------------------------
      // Consentimento
      // ---------------------------------------------------------------------
      // Instante e não booleano: a LGPD pede saber **quando** o titular
      // consentiu, e um `true` não responde isso. Notnull porque nenhuma
      // matrícula entra sem os dois aceites.
      table.timestamp('terms_accepted_at').notNullable()
      table.timestamp('lgpd_consent_at').notNullable()

      // Anotação interna da secretaria sobre a matrícula. Nunca sai para o
      // candidato pela rota de acompanhamento.
      table.text('notes').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()

      // A consulta mais quente do sistema: quantas vagas restam nesta turma.
      table.index(['class_id', 'status'], 'enrollments_class_id_status_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
