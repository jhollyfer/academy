import { createFileRoute, notFound } from '@tanstack/react-router'
import {
  storefrontCourseQueryOptions,
  storefrontCoursesQueryOptions,
} from '#/integrations/tanstack-query/queries'
import { SITE_IMAGE, SITE_TITLE, SITE_URL, absoluteUrl } from '#/lib/site'
import type { CourseResponse } from '#/integrations/response'

/**
 * Os dados estruturados do curso.
 *
 * `Course` com `provider` e `hasCourseInstance`: é o que faz o resultado da
 * busca mostrar data de início e modalidade em vez de só o link. Para uma escola
 * que estreia sem histórico de domínio, é a diferença entre aparecer com um
 * cartão e aparecer com uma linha.
 */
/**
 * O FAQ do curso em `schema.org/FAQPage`, ou nada quando não há pergunta.
 *
 * Devolve lista para o `...` do `scripts` acima: é o que permite o bloco sumir
 * inteiro sem um `undefined` sobrando no array.
 */
function faqJsonLd(course: CourseResponse) {
  const faqs = course.faqs ?? []

  if (faqs.length === 0) return []

  return [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }),
    },
  ]
}

function courseJsonLd(course: CourseResponse) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    url: absoluteUrl(`/courses/${course.slug}`),
    inLanguage: 'pt-BR',
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE_TITLE,
      url: SITE_URL,
    },
    // ISO 8601 de duração, que é o formato que o schema.org espera: `PT32H` são
    // trinta e duas horas. Escrever "32h" aqui daria um campo que o buscador
    // ignora em silêncio.
    timeRequired: `PT${course.workloadHours}H`,
    /*
     * O preço da inscrição, que é o que a pessoa paga para entrar. A
     * mensalidade fica no `CourseInstance`, porque ela é da turma e não do
     * curso: a mesma grade pode abrir com outro valor no ano seguinte.
     */
    offers: {
      '@type': 'Offer',
      category: 'Taxa de inscrição',
      price: (course.enrollmentFeeInCents / 100).toFixed(2),
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      url: absoluteUrl('/enrollment'),
    },
  }

  /*
   * Uma `CourseInstance` por turma anunciada, e não só pela próxima.
   *
   * O curso tem duas turmas de manhã ou três à tarde, com horários diferentes,
   * e o buscador mostra as ocorrências que a página declara. Declarar uma só
   * esconderia as outras exatamente como o card escondia.
   */
  let fallback: Array<NonNullable<typeof course.nextClass>> = []
  if (course.nextClass) fallback = [course.nextClass]

  const classes = course.announcedClasses ?? fallback

  const instances = classes.map(function (entity) {
    const instance: Record<string, unknown> = {
      '@type': 'CourseInstance',
      // `onsite` é o argumento da escola inteira, e é o campo que faz o
      // resultado de busca dizer "presencial" antes de alguém clicar.
      courseMode: 'onsite',
      startDate: entity.startsAt,
      maximumAttendeeCapacity: entity.capacity,
      location: {
        '@type': 'Place',
        name: entity.location,
      },
      offers: {
        '@type': 'Offer',
        category: 'Mensalidade',
        price: (course.monthlyFeeInCents / 100).toFixed(2),
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
      },
    }

    // Só quando a turma tem fim marcado: `endDate` nulo é um campo que o
    // buscador lê como dado e mostra vazio.
    if (entity.endsAt) instance.endDate = entity.endsAt

    // `courseSchedule` é como o schema.org expressa "sábado, das 8h às 10h" -
    // e é a única forma de duas turmas do mesmo curso não parecerem a mesma.
    if (entity.startsAtTime) {
      instance.courseSchedule = {
        '@type': 'Schedule',
        byDay: 'https://schema.org/Saturday',
        startTime: entity.startsAtTime,
        endTime: entity.endsAtTime ?? undefined,
        repeatFrequency: 'P1W',
      }
    }

    return instance
  })

  if (instances.length > 0) {
    // Um objeto quando é uma só: o formato de item único é o que os validadores
    // do buscador mostram nos exemplos, e um array de um item é ruído.
    jsonLd.hasCourseInstance = instances
    if (instances.length === 1) jsonLd.hasCourseInstance = instances[0]
  }

  return jsonLd
}

export const Route = createFileRoute('/_public/courses/$slug')({
  loader: async ({ context, params }) => {
    /*
     * A lista da vitrine junto com o curso, e por `prefetchQuery`.
     *
     * O `EnrollmentCta` decide o rótulo lendo `storefrontCoursesQueryOptions`,
     * e sem esta linha essa consulta não existia no SSR: o botão caía no estado
     * `NONE` e o HTML do servidor anunciava "Avise quando abrir a turma" - com
     * turma aberta e 39 vagas. A hidratação corrigia depois, mas o buscador e
     * quem está sem JavaScript leem o HTML, e nele não havia link nenhum para
     * `/enrollment`. A home já fazia isto; a página do curso é que ficou de fora.
     *
     * `prefetchQuery` e não `ensureQueryData` pelo mesmo motivo da home: a
     * lista é enfeite do botão, e uma consulta fora do ar não pode derrubar a
     * página do curso, que se sustenta sozinha.
     */
    const courses = context.queryClient.prefetchQuery(
      storefrontCoursesQueryOptions(),
    )

    try {
      const [course] = await Promise.all([
        context.queryClient.ensureQueryData(
          storefrontCourseQueryOptions(params.slug),
        ),
        courses,
      ])

      return course
    } catch {
      // 404 de negócio lançado no loader: sem isto o componente renderizaria e
      // só então descobriria que não há curso, e a rota responderia 200 com uma
      // tela vazia - que é o que o buscador indexaria.
      throw notFound()
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {}

    // O título nomeia a cidade: a busca que traz aluno é "curso de robótica
    // Benjamin Constant", e um título só com o nome do curso concorre com o
    // mundo inteiro.
    const title = `${loaderData.name} em Benjamin Constant · ${SITE_TITLE}`
    const description =
      loaderData.tagline ?? loaderData.description.slice(0, 155)

    const url = absoluteUrl(`/courses/${loaderData.slug}`)

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        // A capa do curso, quando a escola cadastrar uma. Sem ela cai na
        // imagem do site: `content` vazio publicaria uma propriedade que não
        // aponta para lugar nenhum.
        { property: 'og:image', content: loaderData.cover?.url ?? SITE_IMAGE },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [{ rel: 'canonical', href: url }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(courseJsonLd(loaderData)),
        },
        /*
         * O FAQ como dado estruturado, além do acordeão na tela.
         *
         * É o mesmo conteúdo servido duas vezes para leitores diferentes - a
         * pessoa lê o acordeão, o buscador lê isto -, e é o que permite a
         * resposta aparecer direto no resultado de busca. Barato: a máquina de
         * JSON-LD já existe nesta rota para `Course` e `CourseInstance`.
         *
         * Só quando há pergunta: um `FAQPage` de lista vazia é marcação
         * inválida, e o buscador penaliza dado estruturado quebrado.
         */
        ...faqJsonLd(loaderData),
      ],
    }
  },
})
