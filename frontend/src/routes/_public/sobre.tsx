import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/_public/sobre')({
  head: () => {
    const title = `A escola - ${SITE_TITLE}`
    const description =
      'Quem é a Maiyu Academy, quem dá aula e onde as aulas acontecem em Benjamin Constant.'

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
      ],
    }
  },
})
