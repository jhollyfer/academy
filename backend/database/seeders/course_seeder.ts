import Class from '#models/class'
import Course from '#models/course'
import CourseFaq from '#models/course_faq'
import CourseModule from '#models/course_module'
import { ActiveStatuses, ClassStatuses, CourseAccents, Shifts, Weekdays } from '#core/entity'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

/**
 * Os dois cursos da turma de estreia, com a grade dos dezesseis sábados.
 *
 * A grade de robótica vem do material de lançamento (Arduino, eletrônica
 * básica, sensores, atuadores, programação, projeto robótico), expandida para os
 * dezesseis encontros. A de desenvolvimento web foi escrita para casar com a
 * mesma carga: ambas terminam num projeto que o aluno leva.
 *
 * **É ponto de partida, não decisão final.** A escola edita tudo pelo painel, e
 * a ementa que vai ao ar é a que ela revisar.
 */

const ROBOTICS_MODULES = [
  [
    'O que é robótica',
    'O que existe hoje, o que dá para fazer com um kit e o que vem pela frente.',
  ],
  ['Eletricidade sem susto', 'Tensão, corrente e resistência, na prática, com multímetro na mão.'],
  [
    'Protoboard e primeiro circuito',
    'Montar, medir e entender por que um LED queima sem resistor.',
  ],
  ['Conhecendo o Arduino', 'A placa, as portas e o primeiro código gravado.'],
  ['Saídas digitais', 'Acender, apagar e piscar. O que "digital" quer dizer.'],
  ['Entradas digitais', 'Botão, ruído de contato e o que fazer com ele.'],
  ['Entradas analógicas', 'Potenciômetro e sensor de luz: ler o mundo em números.'],
  ['Sensor de distância', 'Ultrassom, tempo de eco e a conta que vira centímetro.'],
  ['Sensor de temperatura e umidade', 'Ler o ambiente e mostrar num display.'],
  ['Motores', 'Servo e motor DC: a diferença entre posicionar e girar.'],
  ['Ponte H e movimento', 'Fazer o robô andar para frente, para trás e virar.'],
  ['Montagem do chassi', 'Estrutura, peso e onde a bateria entra.'],
  ['Robô seguidor de linha', 'Sensor de refletância e a lógica que corrige o rumo.'],
  ['Robô desviador de obstáculo', 'Juntar ultrassom e motores numa máquina de estados.'],
  ['Projeto final: construção', 'Cada dupla monta o seu, com a ajuda da turma.'],
  ['Projeto final: apresentação', 'Mostrar o que fez, o que quebrou e como resolveu.'],
] as const

const WEB_MODULES = [
  ['Como a web funciona', 'Navegador, servidor e o que acontece entre digitar e ver a página.'],
  ['HTML de verdade', 'Estrutura, semântica e por que a tag certa importa.'],
  ['CSS: cor, espaço e tipo', 'O básico que já deixa uma página apresentável.'],
  ['Layout com Flexbox', 'Alinhar e distribuir sem gambiarra.'],
  ['Layout com Grid', 'Duas dimensões, e quando cada um serve.'],
  ['Responsivo de verdade', 'A página no celular primeiro, porque é de onde vem quase todo mundo.'],
  ['Primeiro site no ar', 'Publicar e mandar o link para alguém.'],
  ['Formulários em HTML', 'Campos, rótulos e o que o navegador valida sem ajuda.'],
  ['Imagens e mídia', 'Formato, peso e por que a foto do celular trava a página.'],
  ['Tipografia na tela', 'Fonte, tamanho e entrelinha: a hierarquia que faz o texto ser lido.'],
  [
    'Cor, contraste e acessibilidade',
    'Quem enxerga pouco, e quem está no sol, também precisa ler.',
  ],
  ['Componentes de CSS', 'Botão, card e menu: as peças que toda página repete.'],
  ['Estados e transição', 'Hover, foco e movimento, sem uma linha de JavaScript.'],
  ['Organizar o CSS', 'Nomes de classe, arquivos e o que fazer quando a folha cresce.'],
  ['Projeto final: construção', 'Cada aluno constrói o próprio site, com dado real.'],
  ['Projeto final: apresentação', 'Publicar, mostrar e receber crítica.'],
] as const

/**
 * As cinco turmas da oferta: duas de programação pela manhã e três de robótica
 * à tarde e à noite, todas aos sábados, todas com quarenta vagas.
 *
 * O que separa duas turmas do mesmo curso e turno é a hora, e só ela - por isso
 * `startsAtTime` existe como coluna e aparece no nome. Sem a hora, "Programação
 * de sábado de manhã" seria a mesma turma duas vezes.
 *
 * Como todo o resto deste seeder, é ponto de partida: a secretaria muda horário,
 * sala e vagas pelo painel.
 */
const CLASSES = [
  {
    course: 'web',
    name: 'Programação 08h / 2026',
    shift: Shifts.MORNING,
    startsAtTime: '08:00',
    endsAtTime: '10:00',
    location: 'Sala 01 — Laboratório de Informática',
  },
  {
    course: 'web',
    name: 'Programação 10h / 2026',
    shift: Shifts.MORNING,
    startsAtTime: '10:00',
    endsAtTime: '12:00',
    location: 'Sala 01 — Laboratório de Informática',
  },
  {
    course: 'robotics',
    name: 'Robótica 13h / 2026',
    shift: Shifts.AFTERNOON,
    startsAtTime: '13:00',
    endsAtTime: '15:00',
    location: 'Laboratório de Robótica',
  },
  {
    course: 'robotics',
    name: 'Robótica 15h / 2026',
    shift: Shifts.AFTERNOON,
    startsAtTime: '15:00',
    endsAtTime: '17:00',
    location: 'Laboratório de Robótica',
  },
  {
    course: 'robotics',
    name: 'Robótica 18h / 2026',
    shift: Shifts.NIGHT,
    startsAtTime: '18:00',
    endsAtTime: '20:00',
    location: 'Laboratório de Robótica',
  },
] as const

/**
 * O FAQ da escola, o que a home mostra. `courseId` nulo, servido por
 * `GET /storefront/faqs`.
 *
 * A ordem é a das perguntas que mais chegam no WhatsApp: quem nunca programou
 * pergunta isso antes de perguntar preço.
 */
const GENERAL_FAQS = [
  [
    'Preciso saber programar antes?',
    'Não. Os dois cursos começam do zero, e a primeira aula parte do princípio de que você nunca viu código nem circuito.',
  ],
  [
    'Preciso levar notebook?',
    'Não. O laboratório tem computador e kit de eletrônica para as aulas. Se quiser levar o seu, pode.',
  ],
  [
    'As aulas são presenciais mesmo?',
    'São. Todo sábado, em Benjamin Constant. O que pode ser feito de casa é a matrícula.',
  ],
  [
    // TODO: trocar a resposta quando a secretaria fechar a política de
    // certificado. Até lá a página não promete o que ninguém decidiu.
    'Tem certificado?',
    'A secretaria ainda está fechando essa política. Pergunte pelo WhatsApp antes de se matricular.',
  ],
  [
    'E se eu faltar em um sábado?',
    'Faltar não cancela a matrícula. Avise a secretaria pelo WhatsApp para combinar como acompanhar o que perdeu.',
  ],
  [
    'Menor de idade pode se matricular?',
    'Pode, a partir de 14 anos. Abaixo de 18 o formulário pede nome, documento e telefone do responsável legal.',
  ],
  [
    'Como eu pago?',
    'Por Pix. São R$ 150 de inscrição, uma vez, e R$ 150 por mês durante os quatro meses. O comprovante da inscrição você envia na própria página da matrícula.',
  ],
  [
    'E se a turma encher?',
    'A inscrição continua aberta e entra na fila de espera. Ela não ocupa vaga, e a secretaria chama pela ordem se alguém cancelar.',
  ],
  [
    'Tem continuação depois do módulo 1?',
    'Cada curso é o módulo 1 de uma trilha. O módulo 2 ainda não tem data. O módulo 1 é completo por si e termina com um projeto seu.',
  ],
] as const

export default class extends BaseSeeder {
  /**
   * Só fora dos testes.
   *
   * A suíte roda `truncate` e semeia de novo entre cada teste, e um catálogo
   * pronto quebraria toda asserção de contagem - "listou 1 curso" viraria
   * "listou 3". O dono continua sendo semeado, porque é o único usuário que
   * nenhum endpoint cria.
   */
  static environment = ['development', 'production']

  async run() {
    const robotics = await Course.updateOrCreate(
      { slug: 'robotica' },
      {
        slug: 'robotica',
        name: 'Robotics Fundamentals',
        tagline: 'Do primeiro LED ao robô que anda sozinho, em dezesseis sábados.',
        description:
          'Um curso de robótica que começa do zero: eletricidade, circuito, Arduino, sensores e ' +
          'motores. Cada encontro tem bancada e kit, e o curso termina com um robô montado e ' +
          'programado pela própria dupla.',
        accent: CourseAccents.ROBOTICS,
        workloadHours: 32,
        durationMonths: 4,
        minimumAge: 14,
        requirements:
          'Não é preciso saber nada de eletrônica nem de programação. O laboratório fornece o kit.',
        projectOutcome:
          'Um robô autônomo que segue linha e desvia de obstáculo, montado e programado por você.',
        enrollmentFeeInCents: 15_000,
        monthlyFeeInCents: 15_000,
        position: 0,
        status: ActiveStatuses.ACTIVE,
      }
    )

    const web = await Course.updateOrCreate(
      { slug: 'web-development' },
      {
        slug: 'web-development',
        name: 'Web Development Fundamentals',
        tagline: 'HTML e CSS até você publicar um site que é seu.',
        description:
          'Um curso de desenvolvimento web do começo: como a web funciona, HTML semântico, CSS ' +
          'com Flexbox e Grid, e layout responsivo. No fim, cada aluno publica o próprio site.',
        accent: CourseAccents.WEB,
        workloadHours: 32,
        durationMonths: 4,
        minimumAge: 14,
        requirements:
          'Não é preciso saber programar. Saber usar computador com alguma desenvoltura ajuda.',
        projectOutcome: 'Um site seu, publicado, feito de HTML e CSS do zero.',
        enrollmentFeeInCents: 15_000,
        monthlyFeeInCents: 15_000,
        position: 1,
        status: ActiveStatuses.ACTIVE,
      }
    )

    await this.syllabus(robotics.id, ROBOTICS_MODULES)
    await this.syllabus(web.id, WEB_MODULES)

    // O FAQ geral tem `courseId` nulo: vale para a escola inteira.
    await CourseFaq.query().whereNull('courseId').delete()
    await CourseFaq.createMany(
      GENERAL_FAQS.map(function ([question, answer], position) {
        return { courseId: null, position, question, answer }
      })
    )

    /*
     * A turma única de estreia, de quando a escola abria uma turma por curso.
     *
     * Some agora que a oferta é de cinco: deixá-la no banco anunciaria no site
     * uma turma sem horário ao lado das que têm. Só a que ninguém preencheu -
     * turma com matrícula fica, porque apagá-la levaria o candidato junto, e é
     * o mesmo motivo do `RESTRICT` na chave estrangeira.
     */
    const legacy = await Class.query()
      .whereIn('courseId', [robotics.id, web.id])
      .where('name', 'Turma 1 / 2026')
      .withCount('enrollments')

    for (const entity of legacy) {
      if (Number(entity.$extras.enrollments_count) > 0) continue

      await entity.delete()
    }

    // As cinco turmas da oferta. `updateOrCreate` pelo par curso + nome: rodar o
    // seeder duas vezes não pode criar turmas iguais e dobrar as vagas
    // anunciadas.
    //
    // O nome carrega a hora porque é o que separa duas turmas do mesmo curso no
    // mesmo sábado de manhã na tela da secretaria - a coluna `startsAtTime` é o
    // dado, o nome é como a pessoa a chama.
    for (const entry of CLASSES) {
      const course = entry.course === 'robotics' ? robotics : web

      await Class.updateOrCreate(
        { courseId: course.id, name: entry.name },
        {
          courseId: course.id,
          name: entry.name,
          startsAt: DateTime.fromISO('2026-03-07'),
          weekday: Weekdays.SATURDAY,
          shift: entry.shift,
          startsAtTime: entry.startsAtTime,
          endsAtTime: entry.endsAtTime,
          location: entry.location,
          capacity: 40,
          status: ClassStatuses.OPEN,
        }
      )
    }
  }

  /**
   * Apaga e recria a grade, como o `_shared.syllabus.ts` faz.
   *
   * Sem o `delete` antes, rodar o seeder de novo empilharia dezesseis encontros
   * sobre os dezesseis que já estavam lá.
   */
  private async syllabus(courseId: string, entries: ReadonlyArray<readonly [string, string]>) {
    await CourseModule.query().where('courseId', courseId).delete()

    await CourseModule.createMany(
      entries.map(function ([title, description], position) {
        return { courseId, position, title, description }
      })
    )
  }
}
