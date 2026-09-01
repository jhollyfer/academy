import { ClassStatuses } from '#/lib/entity'
import type { ClassResponse, CourseResponse } from '#/integrations/response'

/**
 * O estado da matrícula, derivado das turmas anunciadas.
 *
 * Existe porque a página tinha duas verdades ao mesmo tempo: quatro CTAs
 * "Garanta sua vaga" levavam a `/matricula`, que respondia "nenhuma turma
 * aberta", enquanto a página do curso anunciava turma com 40 vagas. Não era
 * texto desencontrado - era cada tela perguntando ao seu jeito.
 *
 * Aqui a pergunta tem uma resposta só, e ela é derivada do mesmo dado que
 * alimenta os cards. Cabeçalho, hero, cards, seção de matrícula e banner final
 * leem daqui.
 *
 * Fora do React de propósito, como `lib/entity.ts`: é uma decisão sobre dados,
 * e como decisão sobre dados ela é testável com objetos, sem montar árvore.
 */
export type EnrollmentState =
  /** Há turma recebendo matrícula. O caminho normal. */
  | { kind: 'OPEN'; startsAt: string }
  /** Há turma, e todas lotadas. A inscrição continua, na fila de espera. */
  | { kind: 'WAITLIST'; startsAt: string }
  /** Não há turma anunciada. Não há o que preencher. */
  | { kind: 'NONE' }

/**
 * O rótulo do botão em cada estado.
 *
 * Um mapa e não uma cadeia de `if`: a pergunta "o que o botão diz quando a
 * turma lota?" se responde lendo uma linha, e um estado novo entra sem tocar em
 * condição nenhuma.
 */
export const ENROLLMENT_CTA_LABEL: Record<EnrollmentState['kind'], string> = {
  OPEN: 'Garanta sua vaga',
  WAITLIST: 'Entrar na fila de espera',
  NONE: 'Avise quando abrir a turma',
}

/**
 * A mensagem que o WhatsApp abre quando não há turma.
 *
 * Sem turma o CTA deixa de ser matrícula e vira captação de interesse: mandar a
 * pessoa para um formulário que responde "não há vaga" é gastar o clique dela
 * para não entregar nada. A conversa fica com a secretaria, que é quem sabe
 * quando abre.
 */
export const WAITING_LIST_MESSAGE =
  'Olá! Vi o site da Maiyu Academy e quero ser avisado quando abrir a próxima turma.'

/**
 * A turma anunciada de cada curso, sem os cursos que não têm nenhuma.
 *
 * `nextClass` ausente e `nextClass` nulo caem no mesmo lugar aqui, e é
 * proposital: para quem desenha o botão, "esta leitura não procurou" e "não há
 * turma" levam ao mesmo botão. A diferença entre os dois importa no servidor.
 */
function announcedClasses(
  courses: ReadonlyArray<CourseResponse>,
): Array<ClassResponse> {
  const classes: Array<ClassResponse> = []

  for (const course of courses) {
    if (course.nextClass) classes.push(course.nextClass)
  }

  return classes
}

/**
 * O estado a partir da lista de cursos da vitrine.
 *
 * `OPEN` ganha de `FULL` quando as duas existem: com robótica aberta e web
 * lotada, o botão do cabeçalho manda matricular, e é a página do curso lotado
 * que fala em fila de espera. O contrário mandaria todo mundo para a fila por
 * causa de um curso.
 *
 * A data é a da turma mais próxima **entre as que decidiram o estado**, e não a
 * menor de todas: anunciar "começa em março" a partir de uma turma lotada, com
 * a aberta começando em agosto, seria anunciar uma data que ninguém alcança.
 */
export function enrollmentStateFrom(
  courses: ReadonlyArray<CourseResponse> | undefined,
): EnrollmentState {
  const classes = announcedClasses(courses ?? [])

  if (classes.length === 0) return { kind: 'NONE' }

  const open = classes.filter((entity) => entity.status === ClassStatuses.OPEN)

  if (open.length > 0) return { kind: 'OPEN', startsAt: earliestStart(open) }

  return { kind: 'WAITLIST', startsAt: earliestStart(classes) }
}

/**
 * A data de início mais próxima. Comparação de string e não de `Date`: as datas
 * chegam em ISO, e ISO ordena igual como texto - um `new Date` por item só para
 * comparar seria alocação sem resposta nova.
 */
function earliestStart(classes: ReadonlyArray<ClassResponse>): string {
  return classes.reduce(function (earliest, entity) {
    if (entity.startsAt < earliest) return entity.startsAt
    return earliest
  }, classes[0].startsAt)
}
