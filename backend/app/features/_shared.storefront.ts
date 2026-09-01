import Class from '#models/class'
import type Course from '#models/course'
import { withSeatsTaken } from '#features/_shared.seats'
import { ActiveStatuses, ClassStatuses } from '#core/entity'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

/**
 * A condição de visibilidade do site.
 *
 * O que o candidato enxerga é menos do que existe: só curso `ACTIVE` e não
 * removido. Um curso entre duas turmas sai do ar sem ser apagado, e a landing
 * não pode anunciá-lo.
 *
 * Fica aqui e não em cada use-case porque é a mesma regra em três leituras -
 * listar, detalhar e validar a turma na matrícula. Três cópias divergiriam na
 * primeira condição nova, e a divergência apareceria como um curso fantasma na
 * vitrine, não como erro.
 */
export function visibleCourses<TQuery extends ModelQueryBuilderContract<typeof Course, Course>>(
  query: TQuery
): TQuery {
  query.whereNull('deletedAt').where('status', ActiveStatuses.ACTIVE)

  return query
}

/**
 * A próxima turma de um curso, como a landing a mostra: a mais próxima que
 * ainda recebe matrícula, com as vagas contadas.
 *
 * `OPEN` e `FULL` juntos, e não só `OPEN`: turma lotada continua aparecendo,
 * porque a fila de espera existe justamente para ela. `CLOSED` some - não
 * adianta anunciar data de turma que não vai abrir.
 *
 * Ordena por `startsAt` e não por `createdAt`: a próxima é a mais próxima no
 * calendário, não a cadastrada por último.
 */
export function nextClassQuery(courseId: string) {
  return withSeatsTaken(Class.query())
    .where('courseId', courseId)
    .whereNull('deletedAt')
    .whereIn('status', [ClassStatuses.OPEN, ClassStatuses.FULL])
    .orderBy('startsAt', 'asc')
}
