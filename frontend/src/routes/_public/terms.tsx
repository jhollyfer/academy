import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE, absoluteUrl } from '#/lib/site'

const PATH = '/terms'

export const Route = createFileRoute('/_public/terms')({
  head: () => {
    const title = `Termos de uso · ${SITE_TITLE}`
    const description =
      'As regras da matrícula, do pagamento e da participação nos cursos da Maiyu Academy.'

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
