import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE, absoluteUrl } from '#/lib/site'

const PATH = '/about'

export const Route = createFileRoute('/_public/about')({
  head: () => {
    const title = `Quem somos · ${SITE_TITLE}`
    const description =
      'Quem é a Maiyu Academy, quem dá aula e onde as aulas acontecem em Benjamin Constant.'

    const url = absoluteUrl(PATH)

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        // `og:url` junto do canônico e sempre igual a ele: são a mesma
        // afirmação para leitores diferentes - o buscador lê um, o cartão de
        // link do WhatsApp lê o outro -, e divergirem é anunciar dois endereços
        // para a mesma página.
        { property: 'og:url', content: url },
      ],
      links: [{ rel: 'canonical', href: url }],
    }
  },
})
