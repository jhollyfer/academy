import { EnrollmentSchema } from '#database/schema'
import Class from '#models/class'
import EnrollmentFile from '#models/enrollment_file'
import User from '#models/user'
import { belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import { LEGAL_AGE, type EnrollmentStatus } from '#core/entity'

/**
 * O pedido de matrícula. Nasce pelo formulário público, sem sessão, e vive até a
 * secretaria confirmar o Pix ou cancelar.
 */
export default class Enrollment extends EnrollmentSchema {
  @column()
  declare status: EnrollmentStatus

  // Relações declaradas à mão: `database/schema.ts` é gerado a partir das
  // colunas e não conhece relacionamentos.
  @belongsTo(() => Class)
  declare class: BelongsTo<typeof Class>

  @hasMany(() => EnrollmentFile)
  declare files: HasMany<typeof EnrollmentFile>

  /**
   * A conta do aluno, quando já existir.
   *
   * Nula até a secretaria confirmar: os campos `student*` abaixo continuam sendo
   * a declaração feita no ato, e não uma leitura do cadastro. Os dois divergem
   * legitimamente - o nome cadastrado pode ser corrigido depois sem reescrever o
   * que foi enviado no formulário.
   */
  @belongsTo(() => User, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof User>

  /**
   * Redeclarada como `@column.date()`: a coluna é `date` no banco, e sem isto o
   * Lucid a trataria como `datetime` e o valor voltaria com hora e fuso - o que
   * desloca a data em um dia dependendo do offset.
   */
  @column.date()
  declare studentBirthDate: DateTime

  /**
   * A idade do candidato **na data do envio**, não hoje.
   *
   * Recalcular contra `DateTime.now()` faria um menor virar maior sozinho no
   * meio do curso, e a resposta da API mudaria sem nada ter acontecido. O que a
   * secretaria precisa saber é se o responsável era exigido quando o formulário
   * foi enviado - e isso é uma diferença entre `createdAt` e a data de
   * nascimento.
   */
  @computed()
  get ageAtEnrollment(): number {
    return Math.floor(this.createdAt.diff(this.studentBirthDate, 'years').years)
  }

  /**
   * Se este pedido exigia responsável legal. Deriva do campo acima em vez de ser
   * gravado: são a mesma informação, e duas fontes divergem.
   */
  @computed()
  get requiresGuardian(): boolean {
    return this.ageAtEnrollment < LEGAL_AGE
  }
}
