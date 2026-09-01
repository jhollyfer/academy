import Class from '#models/class'
import { ClassStatuses, SEAT_TAKING_ENROLLMENT_STATUSES, type ClassStatus } from '#core/entity'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

/**
 * A ocupação de uma turma, num lugar só.
 *
 * Fica em `features/_shared.*` e não em `app/services/`: não tem dependência
 * externa nem estado - é uma consulta e uma invariante, e services é para o que
 * fala com S3, HTTP ou fila.
 *
 * A pergunta "o que conta como vaga ocupada?" tem uma resposta só, e ela é
 * `SEAT_TAKING_ENROLLMENT_STATUSES`. Reescrever o filtro em cada listagem daria
 * quatro definições que divergem na primeira mudança de máquina de estados.
 */

/** O alias do agregado, o mesmo que `Class.seatsTaken` lê de `$extras`. */
export const SEATS_TAKEN_ALIAS = 'seats_taken'

/**
 * Soma as vagas ocupadas na consulta. Feito para ser encadeado:
 * `withSeatsTaken(Class.query())`.
 *
 * Conta matrícula viva: a que está na lixeira não ocupa nada. Sem o
 * `whereNull`, arquivar uma matrícula deixaria a vaga presa para sempre.
 */
export function withSeatsTaken<TQuery extends ModelQueryBuilderContract<typeof Class, Class>>(
  query: TQuery
): TQuery {
  query.withCount('enrollments', function (enrollments) {
    enrollments
      .whereNull('enrollments.deleted_at')
      .whereIn('enrollments.status', [...SEAT_TAKING_ENROLLMENT_STATUSES])
      .as(SEATS_TAKEN_ALIAS)
  })

  return query
}

/**
 * Quantas vagas restam nesta turma, agora, direto do banco.
 *
 * Existe além do `@computed` do model porque a matrícula precisa da resposta
 * **no instante da escrita**, e não da que veio junto de uma leitura anterior:
 * entre carregar a turma e gravar a matrícula, outra pessoa pode ter ocupado a
 * última vaga.
 */
export async function seatsRemaining(classId: string, capacity: number): Promise<number> {
  const rows = await Class.query()
    .where('id', classId)
    .withCount('enrollments', function (enrollments) {
      enrollments
        .whereNull('enrollments.deleted_at')
        .whereIn('enrollments.status', [...SEAT_TAKING_ENROLLMENT_STATUSES])
        .as(SEATS_TAKEN_ALIAS)
    })
    .first()

  const taken = Number(rows?.$extras[SEATS_TAKEN_ALIAS] ?? 0)

  return Math.max(capacity - taken, 0)
}

/**
 * Reconcilia o status da turma com a ocupação.
 *
 * `FULL` é derivado, e derivado precisa de quem o derive: a última vaga sai numa
 * matrícula e volta num cancelamento, e nenhum dos dois é uma edição da turma.
 *
 * `CLOSED` não é tocado. É decisão da secretaria - turma que já começou, ou que
 * não vai abrir - e não pode reabrir sozinha porque alguém desistiu.
 */
export async function syncClassStatus(entity: Class): Promise<void> {
  if (entity.status === ClassStatuses.CLOSED) return

  const remaining = await seatsRemaining(entity.id, entity.capacity)

  let status: ClassStatus = ClassStatuses.OPEN
  if (remaining <= 0) status = ClassStatuses.FULL

  if (entity.status === status) return

  entity.status = status
  await entity.save()
}
