import { createFileRoute, notFound } from '@tanstack/react-router'
import { storefrontCourseQueryOptions } from '#/integrations/tanstack-query/queries'
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
function courseJsonLd(course: CourseResponse) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    url: absoluteUrl(`/cursos/${course.slug}`),
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
      url: absoluteUrl('/matricula'),
    },
  }

  if (course.nextClass) {
    const instance: Record<string, unknown> = {
      '@type': 'CourseInstance',
      // `onsite` é o argumento da escola inteira, e é o campo que faz o
      // resultado de busca dizer "presencial" antes de alguém clicar.
      courseMode: 'onsite',
      startDate: course.nextClass.startsAt,
      maximumAttendeeCapacity: course.nextClass.capacity,
      location: {
        '@type': 'Place',
        name: course.nextClass.location,
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
    if (course.nextClass.endsAt) instance.endDate = course.nextClass.endsAt

    jsonLd.hasCourseInstance = instance
  }

  return jsonLd
}

export const Route = createFileRoute('/_public/cursos/$slug')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        storefrontCourseQueryOptions(params.slug),
      )
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
    const title = `${loaderData.name} em Benjamin Constant - ${SITE_TITLE}`
    const description =
      loaderData.tagline ?? loaderData.description.slice(0, 155)

    const url = absoluteUrl(`/cursos/${loaderData.slug}`)

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
      ],
    }
  },
})
