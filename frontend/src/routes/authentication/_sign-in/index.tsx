import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/authentication/')({
  head: () => ({
    meta: [
      { title: `Entrar - ${SITE_TITLE}` },
      // A tela de login não tem por que aparecer em busca, e indexá-la só
      // gastaria orçamento de rastreamento numa página que ninguém procura.
      { name: 'robots', content: 'noindex' },
    ],
  }),
})
