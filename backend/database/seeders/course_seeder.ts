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
  ['JavaScript: variáveis e tipos', 'O que o computador guarda e como.'],
  ['Condição e repetição', 'Decidir e repetir, que é quase tudo que um programa faz.'],
  ['Funções', 'Dar nome a um pedaço de lógica e reusá-lo.'],
  ['Listas e objetos', 'Guardar muitas coisas e achar a certa.'],
  ['Mexendo na página', 'Reagir ao clique e mudar o que está na tela.'],
  ['Formulário e validação', 'Receber dado de alguém sem confiar cegamente nele.'],
  ['Consumindo uma API', 'Buscar dado de fora e mostrar.'],
  ['Projeto final: construção', 'Cada aluno constrói o próprio site, com dado real.'],
  ['Projeto final: apresentação', 'Publicar, mostrar e receber crítica.'],
] as const

const GENERAL_FAQS = [
  [
    'As aulas são presenciais mesmo?',
    'São. Todo sábado, na FAMETRO, em Benjamin Constant. O que pode ser feito de casa é a matrícula.',
  ],
  [
    'Preciso levar computador?',
    'Não. O laboratório tem computador e kit de eletrônica para as aulas.',
  ],
  [
    'E se eu nunca mexi com isso?',
    'Os dois cursos começam do zero. Não é preciso saber nada antes.',
  ],
  [
    'Como funciona o pagamento?',
    'São R$ 150 de inscrição, uma vez, mais R$ 150 por mês durante os quatro meses. O pagamento é por Pix.',
  ],
  [
    'Perco a vaga se a turma encher?',
    'Não. Sua inscrição entra na fila de espera, e a secretaria chama pela ordem se abrir vaga.',
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
        tagline: 'HTML, CSS e JavaScript até você publicar um site que é seu.',
        description:
          'Um curso de desenvolvimento web do começo: como a web funciona, HTML semântico, CSS ' +
          'com Flexbox e Grid, e JavaScript até consumir uma API. No fim, cada aluno publica o ' +
          'próprio site.',
        accent: CourseAccents.WEB,
        workloadHours: 32,
        durationMonths: 4,
        minimumAge: 14,
        requirements:
          'Não é preciso saber programar. Saber usar computador com alguma desenvoltura ajuda.',
        projectOutcome: 'Um site seu, publicado, consumindo dado real de uma API.',
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

    // A turma de estreia. `updateOrCreate` pelo par curso + nome: rodar o seeder
    // duas vezes não pode criar duas turmas iguais e dobrar as vagas anunciadas.
    for (const course of [robotics, web]) {
      await Class.updateOrCreate(
        { courseId: course.id, name: 'Turma 1 / 2026' },
        {
          courseId: course.id,
          name: 'Turma 1 / 2026',
          startsAt: DateTime.fromISO('2026-03-07'),
          weekday: Weekdays.SATURDAY,
          shift: Shifts.MORNING,
          location: 'FAMETRO, Benjamin Constant/AM',
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
