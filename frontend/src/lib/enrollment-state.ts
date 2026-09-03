import { ClassStatuses, Shifts } from '#/lib/entity'
import type { ClassResponse, CourseResponse } from '#/integrations/response'

/**
 * O estado da matrícula, derivado das turmas anunciadas.
 *
 * Existe porque a página tinha duas verdades ao mesmo tempo: quatro CTAs
 * "Garanta sua vaga" levavam a `/enrollment`, que respondia "nenhuma turma
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
export function announcedClasses(
  courses: ReadonlyArray<CourseResponse>,
): Array<ClassResponse> {
  return courses.flatMap(courseClasses)
}

/**
 * As turmas anunciadas de um curso.
 *
 * `announcedClasses` quando o servidor a mandou; a próxima turma quando a
 * resposta é do formato anterior, que só trazia `nextClass`. O curso tem cinco
 * turmas hoje, e ler só a primeira ignoraria quatro.
 */
export function courseClasses(course: CourseResponse): Array<ClassResponse> {
  if (course.announcedClasses) return course.announcedClasses
  if (course.nextClass) return [course.nextClass]

  return []
}

/**
 * As vagas do curso somadas sobre as turmas, e não as de uma turma: quem lê o
 * card quer saber se ainda cabe alguém no curso; em qual das turmas é a decisão
 * do primeiro passo da matrícula.
 *
 * `seatsRemaining` some das leituras que não contaram, e aí a capacidade é o
 * melhor palpite honesto - é o mesmo `??` que o card sempre fez.
 */
export function courseSeatsRemaining(course: CourseResponse): number {
  return courseClasses(course).reduce(function (total, entity) {
    return total + (entity.seatsRemaining ?? entity.capacity)
  }, 0)
}

export function courseCapacity(course: CourseResponse): number {
  return courseClasses(course).reduce(
    (total, entity) => total + entity.capacity,
    0,
  )
}

/**
 * Os horários das turmas do curso numa frase: `"08h às 10h e 10h às 12h"`. Turma sem
 * horário fechado entra pelo nome, que é o que a secretaria escreveu.
 */
export function courseTimesLabel(course: CourseResponse): string {
  return joinWords(
    courseClasses(course).map(
      (entity) =>
        formatTimeRange(entity.startsAtTime, entity.endsAtTime) || entity.name,
    ),
  )
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

/**
 * O horário de uma turma, como a página o escreve: `"08h às 10h"`.
 *
 * A hora chega `"08:00:00"` do Postgres e vira `08h`; minuto quebrado aparece
 * (`"08h30"`), porque uma turma das 8h30 não pode ser anunciada como das 8h.
 * Sem horário devolve string vazia, e quem chama omite o trecho em vez de
 * escrever um travessão solto.
 */
export function formatTimeRange(
  startsAtTime: string | null,
  endsAtTime: string | null,
): string {
  const start = formatTime(startsAtTime)

  if (!start) return ''

  const end = formatTime(endsAtTime)

  if (!end) return start

  return `${start} às ${end}`
}

function formatTime(value: string | null): string {
  if (!value) return ''

  const [hour, minute] = value.split(':')

  if (!hour) return ''
  if (minute && minute !== '00') return `${hour}h${minute}`

  return `${hour}h`
}

/**
 * O nome de cada turno, como a página o escreve.
 *
 * Minúsculo porque nasceu no meio de frase - "aos sábados de manhã, tarde e
 * noite". Quem precisar dele como rótulo solto capitaliza na hora de exibir; o
 * dado aqui é a palavra, não a forma.
 */
export const SHIFT_LABELS: Record<string, string> = {
  [Shifts.MORNING]: 'manhã',
  [Shifts.AFTERNOON]: 'tarde',
  [Shifts.NIGHT]: 'noite',
}

/**
 * O que a landing diz sobre a oferta, derivado das turmas anunciadas.
 *
 * Existe pelo mesmo motivo que `enrollmentStateFrom`: a página escrevia "40
 * vagas por turma" e "uma turma por curso" à mão em cinco arquivos, e nenhum
 * deles lia o dado. Quando a escola abriu cinco turmas em três turnos, os cinco
 * passaram a mentir ao mesmo tempo.
 *
 * `seatsPerClass` é `null` quando as turmas têm capacidades diferentes: aí não
 * existe "vagas por turma", e a frase fala do total.
 */
export type ScheduleSummary = {
  /** Quantas turmas o site anuncia. Zero quando não há nenhuma. */
  classCount: number
  /** As vagas de cada turma, quando todas têm a mesma. Senão `null`. */
  seatsPerClass: number | null
  /** A soma das vagas anunciadas. */
  totalSeats: number
  /** `"manhã, tarde e noite"`, na ordem do dia. Vazio sem turma. */
  shiftsLabel: string
  /** `"08h às 10h"` da primeira turma do dia à última. Vazio sem horário. */
  timesLabel: string
}

export function scheduleSummary(
  courses: ReadonlyArray<CourseResponse> | undefined,
): ScheduleSummary {
  const classes = announcedClasses(courses ?? [])

  const capacities = new Set(classes.map((entity) => entity.capacity))

  // Só existe "vagas por turma" quando as turmas têm a mesma capacidade. Com
  // capacidades diferentes a frase seria falsa, e quem chama cai no total.
  let seatsPerClass: number | null = null
  if (capacities.size === 1) seatsPerClass = [...capacities][0]

  return {
    classCount: classes.length,
    seatsPerClass,
    totalSeats: classes.reduce((total, entity) => total + entity.capacity, 0),
    shiftsLabel: joinWords(shiftLabels(classes)),
    timesLabel: timesLabel(classes),
  }
}

/**
 * Os turnos em que a escola tem aula, na ordem do dia.
 *
 * Um `Set` e não `filter` de igualdade: são três turnos possíveis e cinco
 * turmas, e o que a frase precisa é da lista sem repetição.
 */
function shiftLabels(classes: ReadonlyArray<ClassResponse>): Array<string> {
  const shifts = new Set(classes.map((entity) => entity.shift))

  return [Shifts.MORNING, Shifts.AFTERNOON, Shifts.NIGHT]
    .filter((shift) => shifts.has(shift))
    .map((shift) => SHIFT_LABELS[shift])
}

/**
 * Da primeira hora à última: `"08h às 20h"`. Uma turma só, ou horários que não
 * variam, devolve o intervalo dela - `"08h às 10h"`.
 */
function timesLabel(classes: ReadonlyArray<ClassResponse>): string {
  const withTime = classes.filter((entity) => entity.startsAtTime)

  if (withTime.length === 0) return ''

  const sorted = [...withTime].sort(function (first, second) {
    // `localeCompare` e não um ternário de -1/1: a hora vem como 'HH:mm', que
    // ordena igual como texto, e o comparador passa a devolver 0 para o empate
    // em vez de mentir que o primeiro vem depois.
    return (first.startsAtTime ?? '').localeCompare(second.startsAtTime ?? '')
  })

  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  if (first === last)
    return formatTimeRange(first.startsAtTime, first.endsAtTime)

  return `${formatTime(first.startsAtTime)} às ${formatTime(last.endsAtTime ?? last.startsAtTime)}`
}

/**
 * `["manhã", "tarde", "noite"]` vira `"manhã, tarde e noite"`. O "e" antes do
 * último é o que faz a frase soar escrita por alguém.
 */
function joinWords(words: ReadonlyArray<string>): string {
  if (words.length === 0) return ''
  if (words.length === 1) return words[0]

  return `${words.slice(0, -1).join(', ')} e ${words[words.length - 1]}`
}
