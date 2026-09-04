import Class from '#models/class'
import PixService from '#services/pix.service'
import type Course from '#models/course'
import type Partner from '#models/partner'
import type Enrollment from '#models/enrollment'
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
 * A condição de visibilidade dos parceiros, pela mesma regra dos cursos.
 *
 * Existe separada porque a razão de sair do ar é outra: um curso some entre duas
 * turmas, um parceiro some quando o convênio fica suspenso. O que as duas
 * compartilham é a consequência - a vitrine não pode anunciar nenhum dos dois
 * enquanto isso durar.
 */
export function visiblePartners<TQuery extends ModelQueryBuilderContract<typeof Partner, Partner>>(
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
  return (
    withSeatsTaken(Class.query())
      .whereIn('courseId', [...courseIds])
      .whereNull('deletedAt')
      .whereIn('status', [ClassStatuses.OPEN, ClassStatuses.FULL])
      .orderBy('startsAt', 'asc')
      // Desempate pela hora: as turmas de um curso caem todas no mesmo sábado, e
      // sem isto a ordem entre a de 8h e a de 10h seria a que o banco entregasse.
      .orderBy('startsAtTime', 'asc')
  )
}

/**
 * Pendura as turmas anunciáveis de cada curso: todas em
 * `$extras.announcedClasses`, e a primeira também em `$extras.nextClass`.
 *
 * Uma consulta para a página toda, e o recorte por curso feito em memória sobre
 * um resultado já ordenado. O SQL equivalente seria uma janela por curso, e ele
 * custaria mais para ler do que estas linhas.
 *
 * As duas formas convivem porque as telas perguntam duas coisas. O título da
 * home e o JSON-LD querem *a* próxima - uma data, uma frase. A vitrine e a
 * matrícula querem a oferta inteira: são cinco turmas, e escolher entre elas é
 * a decisão do candidato. Anunciar só a primeira esconderia quatro.
 *
 * Curso sem turma anunciável recebe `null` e `[]` explícitos, e não fica
 * ausente: ausente é "esta leitura não procurou", e é justamente a ambiguidade
 * que fazia a página de matrícula concluir que não havia turma nenhuma.
 */
export async function attachAnnounceableClasses(courses: ReadonlyArray<Course>): Promise<void> {
  if (courses.length === 0) return

  const classes = await announceableClassesQuery(courses.map((course) => course.id))

  for (const course of courses) {
    const announced = classes.filter((entity) => entity.courseId === course.id)

    course.$extras.announcedClasses = announced
    course.$extras.nextClass = announced.at(0) ?? null
  }
}

/**
 * O que a leitura por protocolo pode devolver, e nada além.
 *
 * O `GET /storefront/enrollments/:protocol` não tem sessão: a credencial é o
 * próprio protocolo, um uuid v4 que só quem se inscreveu recebeu. Isso torna a
 * URL impraticável de adivinhar, mas não muda o que ela entrega a quem a tem -
 * e ela entregava o model inteiro, serializado por padrão: CPF do candidato,
 * e-mail, telefone, data de nascimento, e nome, CPF e telefone do responsável
 * legal. De uma criança, nos casos em que há responsável.
 *
 * O link viaja por WhatsApp. Ele é encaminhado, fica no histórico da conversa e
 * sobrevive à troca de aparelho - e cada uma dessas cópias carregava o cadastro
 * completo de um menor de idade.
 *
 * A projeção é uma lista de permissão, e não um `omit` dos campos sensíveis de
 * hoje: com `omit`, toda coluna nova nasce pública e só deixa de ser quando
 * alguém lembra de escondê-la. Aqui o padrão é o inverso, que é o padrão certo
 * para um endpoint sem autenticação.
 *
 * `studentFirstName` e não `studentName`: o primeiro nome basta para a pessoa
 * reconhecer que a tela é a dela, e é o nome completo que identifica alguém.
 *
 * Os arquivos saem sem `storage`: a tela só precisa saber **se** há comprovante
 * anexado, e o objeto de storage carrega o caminho do arquivo no bucket - o
 * comprovante bancário em si, que é o dado mais sensível do pedido inteiro.
 */
export function publicEnrollmentView(enrollment: Enrollment) {
  return {
    id: enrollment.id,
    protocol: enrollment.protocol,
    status: enrollment.status,
    studentFirstName: firstName(enrollment.studentName),
    class: publicClassView(enrollment.class),
    files: (enrollment.files ?? []).map((file) => ({
      id: file.id,
      kind: file.kind,
      createdAt: file.createdAt.toISO(),
    })),
    /**
     * O "copia e cola" do Pix da inscrição.
     *
     * Vem montado do servidor, e não da tela, porque é o servidor que sabe a
     * chave da escola e o valor do curso. Montá-lo no navegador embutiria a
     * chave no bundle, onde trocá-la passaria a exigir rebuild da imagem.
     *
     * `null` quando a turma não veio: sem curso não há valor, e um código de
     * cobrança sem valor nesta tela seria pior que nenhum - a pessoa pagaria o
     * que achasse.
     */
    pixCode: pixCodeFor(enrollment),
  }
}

/**
 * O BR Code da inscrição desta matrícula.
 *
 * O `txid` é o protocolo: é o que faz o extrato da escola dizer de quem foi
 * cada Pix, sem ninguém ter de cruzar valor com horário.
 */
function pixCodeFor(enrollment: Enrollment): string | null {
  const fee = enrollment.class?.course?.enrollmentFeeInCents

  if (!fee) return null

  return new PixService().payload({
    amountInCents: fee,
    txid: enrollment.protocol,
  })
}

/**
 * A turma e o curso como a tela de acompanhamento os mostram. Nada aqui é do
 * candidato: é a oferta, que a vitrine já publica para quem nem se inscreveu.
 */
function publicClassView(entity: Class | null | undefined) {
  if (!entity) return null

  return {
    id: entity.id,
    name: entity.name,
    startsAt: entity.startsAt.toISODate(),
    location: entity.location,
    course: {
      id: entity.course.id,
      name: entity.course.name,
      slug: entity.course.slug,
      enrollmentFeeInCents: entity.course.enrollmentFeeInCents,
      monthlyFeeInCents: entity.course.monthlyFeeInCents,
    },
  }
}

/**
 * O primeiro nome. `split` no espaço e não `slice` de tamanho fixo: "Ana" e
 * "Anna Beatriz" têm primeiros nomes de tamanhos diferentes, e cortar por
 * caractere devolveria pedaço de palavra.
 */
function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}
