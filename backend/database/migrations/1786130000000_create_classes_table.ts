import { BaseSchema } from '@adonisjs/lucid/schema'
import { CLASS_STATUSES, ClassStatuses, SHIFTS, WEEKDAYS } from '#core/entity'

export default class extends BaseSchema {
  protected tableName = 'classes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.knexRawQuery('uuid_generate_v4()'))
      // `RESTRICT` e não `CASCADE`: uma turma tem matrícula pendurada, e apagar
      // o curso em cascata levaria os candidatos junto sem ninguém ver. Quem
      // quiser apagar o curso arquiva as turmas antes - o use-case de `delete`
      // conta as referências e devolve 409 explicando qual.
      table.uuid('course_id').notNullable().references('id').inTable('courses').onDelete('RESTRICT')
      // O rótulo humano da turma - "Turma 1 / 2026". A secretaria escreve; não é
      // derivado de data porque duas turmas podem começar no mesmo dia.
      table.string('name', 160).notNullable()

      // `date` e não `timestamp`: o que importa é o dia da primeira aula, e
      // guardar hora obrigaria a escolher um fuso para uma informação que não
      // tem hora.
      table.date('starts_at').notNullable()
      // Nula enquanto a escola não fechou a data de encerramento. A duração em
      // meses vive no curso; aqui é a data concreta desta turma.
      table.date('ends_at').nullable()
      table.enum('weekday', WEEKDAYS).notNullable()
      table.enum('shift', SHIFTS).notNullable()
      // Onde a aula acontece, por extenso - "FAMETRO, Benjamin Constant/AM".
      // Texto e não FK: é uma unidade só, e uma tabela de locais hoje seria uma
      // tabela de uma linha.
      table.string('location', 200).notNullable()

      // O teto de vagas. A **ocupação** não tem coluna: ela é a contagem de
      // matrículas em `PENDING` ou `CONFIRMED`. Uma coluna de contador
      // divergiria do fato na primeira matrícula cancelada fora do fluxo.
      table.integer('capacity').notNullable()
      // `FULL` é carimbado pelo use-case de matrícula quando a última vaga sai,
      // e volta a `OPEN` sozinho quando uma matrícula é cancelada. `CLOSED` é
      // decisão da secretaria e não volta sozinho.
      table.enum('status', CLASS_STATUSES).notNullable().defaultTo(ClassStatuses.OPEN)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()
      // Serve a consulta da landing: a próxima turma aberta de um curso.
      table.index(['course_id', 'status', 'starts_at'], 'classes_course_id_status_starts_at_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
