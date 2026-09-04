import CourseFaq from '#models/course_faq'
import CourseModule from '#models/course_module'
import db from '@adonisjs/lucid/services/db'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type Course from '#models/course'

/**
 * A grade do curso e o FAQ dele.
 *
 * Nenhum dos dois tem **recurso próprio**. Entram no `POST`/`PUT` do curso como
 * array e são sincronizados na mesma transação. Um CRUD separado significaria
 * salvar o curso e a ementa dele em dois cliques, com uma janela em que a página
 * pública mostra metade do que a pessoa escreveu - e, pior, um formulário de
 * edição que salva por partes e falha no meio.
 */

export type CourseModuleInput = {
  title: string
  description?: string | null
  sessionCount?: number | null
  topics?: string | null
  deliverable?: string | null
}

export type CourseFaqInput = {
  question: string
  answer: string
}

/**
 * Deixa a grade igual à lista enviada.
 *
 * Apaga e recria, ao contrário do `sync` de uma N:N: o módulo **não** tem
 * identidade estável do lado do cliente - quem monta a ementa arrasta sábados,
 * corta um no meio e cola outro, e casar linha por linha exigiria que a tela
 * inventasse um id para cada rascunho. O que importa preservar é a ordem, e ela
 * é o índice do array.
 *
 * Remoção **física**, e é por isso que a tabela não tem `deleted_at`: um módulo
 * reescrito é rascunho, não histórico.
 *
 * Os campos de detalhe - encontros, tópicos e entrega - entraram sem mudar este
 * contrato, e de propósito: são escalares do próprio módulo, nada ganhou
 * identidade estável do lado do cliente, e o apaga-e-recria continua valendo.
 * Fazer diff aqui exigiria a tela inventar um id por rascunho, que é o problema
 * que este desenho evita.
 */
export async function syncCourseModules(
  courseId: string,
  modules: CourseModuleInput[],
  trx: TransactionClientContract
): Promise<void> {
  await CourseModule.query({ client: trx }).where('courseId', courseId).delete()

  if (modules.length === 0) return

  await CourseModule.createMany(
    modules.map(function (entry, position) {
      return {
        courseId,
        position,
        title: entry.title,
        description: entry.description ?? null,
        sessionCount: entry.sessionCount ?? null,
        topics: entry.topics ?? null,
        deliverable: entry.deliverable ?? null,
      }
    }),
    { client: trx }
  )
}

/** O mesmo para o FAQ do curso, pela mesma razão. */
export async function syncCourseFaqs(
  courseId: string,
  faqs: CourseFaqInput[],
  trx: TransactionClientContract
): Promise<void> {
  await CourseFaq.query({ client: trx }).where('courseId', courseId).delete()

  if (faqs.length === 0) return

  await CourseFaq.createMany(
    faqs.map(function (entry, position) {
      return { courseId, position, question: entry.question, answer: entry.answer }
    }),
    { client: trx }
  )
}

/**
 * Grava o curso, a grade e o FAQ numa transação só.
 *
 * Sem isto, uma falha no meio deixaria o curso salvo e a ementa na versão
 * anterior - e a página pública mostraria as duas metades de edições diferentes.
 *
 * `modules`/`faqs` indefinidos são "não mexer", e não "apagar": campo ausente
 * nunca limpa, que é a regra de todo `PUT` daqui. Lista vazia é apagar, e é como
 * se remove o último item.
 */
export async function saveWithSyllabus(
  course: Course,
  modules: CourseModuleInput[] | undefined,
  faqs: CourseFaqInput[] | undefined
): Promise<void> {
  await db.transaction(async (trx) => {
    course.useTransaction(trx)
    await course.save()

    if (modules) await syncCourseModules(course.id, modules, trx)
    if (faqs) await syncCourseFaqs(course.id, faqs, trx)
  })
}
