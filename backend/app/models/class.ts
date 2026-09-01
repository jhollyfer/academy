import { ClassSchema } from '#database/schema'
import Course from '#models/course'
import Enrollment from '#models/enrollment'
import { aggregate } from '#core/aggregate'
import { belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import type { ClassStatus, Shift, Weekday } from '#core/entity'

/**
 * Uma turma: quando o curso acontece, onde, e quantas vagas tem.
 *
 * O nome da classe é `Class` mesmo - a tabela é `classes` e o padrão manda o
 * model espelhar a tabela. Não colide com a palavra reservada porque `class` em
 * minúscula é que é reservada.
 */
export default class Class extends ClassSchema {
  @column()
  declare weekday: Weekday

  @column()
  declare shift: Shift

  @column()
  declare status: ClassStatus

  @belongsTo(() => Course)
  declare course: BelongsTo<typeof Course>

  @hasMany(() => Enrollment)
  declare enrollments: HasMany<typeof Enrollment>

  /**
   * Quantas vagas já saíram.
   *
   * Vem do `withCount('enrollments')` filtrado por
   * `SEAT_TAKING_ENROLLMENT_STATUSES` - fila de espera e cancelada não contam.
   * Quem monta a consulta é o `_shared.seats.ts`, para que a definição de "vaga
   * ocupada" não seja reescrita em cada listagem.
   *
   * Não existe coluna de contador: ela divergiria do fato na primeira matrícula
   * cancelada fora do fluxo, e ninguém notaria até a turma estourar.
   */
  @computed()
  get seatsTaken(): number | undefined {
    return aggregate(this.$extras, 'seats_taken')
  }

  /**
   * Quantas vagas restam. `undefined` quando a consulta não contou - e some do
   * JSON, em vez de mentir um número igual à capacidade.
   *
   * Nunca negativo: a promoção da fila de espera é que controla a entrada, mas
   * um cancelamento fora do fluxo não pode fazer a landing anunciar "-2 vagas".
   */
  @computed()
  get seatsRemaining(): number | undefined {
    const taken = this.seatsTaken

    if (taken === undefined) return undefined

    return Math.max(this.capacity - taken, 0)
  }
}
