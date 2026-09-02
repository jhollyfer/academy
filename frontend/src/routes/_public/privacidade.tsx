import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE, absoluteUrl } from '#/lib/site'

const PATH = '/privacidade'

export const Route = createFileRoute('/_public/privacidade')({
  head: () => {
    const title = `Política de privacidade - ${SITE_TITLE}`
    const description =
      'Como a Maiyu Academy coleta, usa e guarda os dados de quem se matricula, incluindo dados de menores de idade.'

    const url = absoluteUrl(PATH)

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
      ],
      links: [{ rel: 'canonical', href: url }],
    }
  },
})
