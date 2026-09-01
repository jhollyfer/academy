import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/_public/privacidade')({
  head: () => ({
    meta: [
      { title: `Política de privacidade - ${SITE_TITLE}` },
      {
        name: 'description',
        content:
          'Como a Maiyu Academy coleta, usa e guarda os dados de quem se matricula, incluindo dados de menores de idade.',
      },
    ],
  }),
})
