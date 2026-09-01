import { createFileRoute, notFound } from '@tanstack/react-router'
import { storefrontCourseQueryOptions } from '#/integrations/tanstack-query/queries'
import { SITE_TITLE } from '#/lib/site'
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
    'name': course.name,
    'description': course.description,
    'provider': { '@type': 'EducationalOrganization', 'name': SITE_TITLE },
  }

  if (course.nextClass) {
    jsonLd.hasCourseInstance = {
      '@type': 'CourseInstance',
      'courseMode': 'onsite',
      'startDate': course.nextClass.startsAt,
      'location': { '@type': 'Place', 'name': course.nextClass.location },
    }
  }

  return jsonLd
}

export const Route = createFileRoute('/_public/cursos/$slug')({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(storefrontCourseQueryOptions(params.slug))
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
    const description = loaderData.tagline ?? loaderData.description.slice(0, 155)

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
      ],
      scripts: [
        { type: 'application/ld+json', children: JSON.stringify(courseJsonLd(loaderData)) },
      ],
    }
  },
})
