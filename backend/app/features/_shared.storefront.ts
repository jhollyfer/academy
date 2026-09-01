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
 * As turmas anunciáveis dos cursos pedidos, como a landing as mostra: as que
 * ainda recebem matrícula, com as vagas contadas, da mais próxima para a mais
 * distante.
 *
 * `OPEN` e `FULL` juntos, e não só `OPEN`: turma lotada continua aparecendo,
 * porque a fila de espera existe justamente para ela. `CLOSED` some - não
 * adianta anunciar data de turma que não vai abrir.
 *
 * Ordena por `startsAt` e não por `createdAt`: a próxima é a mais próxima no
 * calendário, não a cadastrada por último.
 *
 * Recebe uma lista de cursos e não um só porque a home mostra dois cards e a
 * matrícula lista todos: um `nextClassQuery(id)` por curso seria uma consulta
 * por card, e a página inteira paga isso antes de pintar.
 */
export function announceableClassesQuery(courseIds: ReadonlyArray<string>) {
  return withSeatsTaken(Class.query())
    .whereIn('courseId', [...courseIds])
    .whereNull('deletedAt')
    .whereIn('status', [ClassStatuses.OPEN, ClassStatuses.FULL])
    .orderBy('startsAt', 'asc')
}

/**
 * Carrega a próxima turma de cada curso e a pendura em `$extras.nextClass`.
 *
 * Uma consulta para a página toda, e a escolha da "próxima" feita em memória
 * sobre um resultado já ordenado: o primeiro que aparece de um curso é o dele.
 * O SQL equivalente seria uma janela por curso, e ele custaria mais para ler do
 * que estas quatro linhas.
 *
 * Curso sem turma anunciável recebe `null` explícito, e não fica ausente:
 * ausente é "esta leitura não procurou", e é justamente a ambiguidade que fazia
 * a página de matrícula concluir que não havia turma nenhuma.
 */
export async function attachNextClass(courses: ReadonlyArray<Course>): Promise<void> {
  if (courses.length === 0) return

  const classes = await announceableClassesQuery(courses.map((course) => course.id))

  for (const course of courses) {
    course.$extras.nextClass = classes.find((entity) => entity.courseId === course.id) ?? null
  }
}
