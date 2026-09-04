import { createFileRoute } from '@tanstack/react-router'
import { storefrontPartnersQueryOptions } from '#/integrations/tanstack-query/queries'
import { SITE_TITLE, absoluteUrl } from '#/lib/site'

const PATH = '/partners'

export const Route = createFileRoute('/_public/partners')({
  /*
   * `prefetchQuery` e não `ensureQueryData`, pela mesma razão da home: a API
   * fora do ar não pode derrubar a página. O texto institucional desta página
   * não depende de consulta nenhuma, e é justamente ele que interessa a quem
   * chega aqui - a lista de parceiros some sozinha se não vier.
   */
  loader: ({ context }) =>
    context.queryClient.prefetchQuery(storefrontPartnersQueryOptions()),
  head: () => {
    const title = `Para escolas e instituições · ${SITE_TITLE}`
    const description =
      'Como levar robótica e programação para a sua escola ou instituição no Alto Solimões, e ' +
      'quem já sustenta a Maiyu Academy em Benjamin Constant.'

    const url = absoluteUrl(PATH)

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        // `og:url` junto do canônico e sempre igual a ele: são a mesma
        // afirmação para leitores diferentes.
        { property: 'og:url', content: url },
      ],
      links: [{ rel: 'canonical', href: url }],
    }
  },
})
