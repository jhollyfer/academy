import { createFileRoute } from '@tanstack/react-router'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { ADDRESS, SITE_DESCRIPTION, SITE_TAGLINE, SITE_TITLE, WHATSAPP_NUMBER } from '#/lib/site'

/**
 * Os dados estruturados da escola.
 *
 * `EducationalOrganization` e não `Organization`: o buscador usa o tipo para
 * decidir o que mostrar no resultado, e escola tem campos que empresa genérica
 * não tem. O endereço vai junto porque a busca que traz aluno é local.
 */
function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': SITE_TITLE,
    'description': SITE_DESCRIPTION,
    'telephone': `+${WHATSAPP_NUMBER}`,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': ADDRESS.street,
      'addressLocality': ADDRESS.city,
      'addressRegion': ADDRESS.state,
      'addressCountry': ADDRESS.country,
    },
  }
}

export const Route = createFileRoute('/_public/')({
  // `ensureQueryData` no loader: a home é a primeira navegação de quem vem do
  // anúncio, e sem isto o Nitro renderizaria a casca e o navegador buscaria os
  // cursos depois - dois tempos de espera em vez de um.
  loader: ({ context }) => context.queryClient.ensureQueryData(storefrontCoursesQueryOptions()),
  head: () => ({
    meta: [
      { title: SITE_TAGLINE },
      { name: 'description', content: SITE_DESCRIPTION },
      { property: 'og:title', content: SITE_TAGLINE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:type', content: 'website' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(organizationJsonLd()),
      },
    ],
  }),
})
