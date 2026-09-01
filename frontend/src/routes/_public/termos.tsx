import { createFileRoute } from '@tanstack/react-router'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/_public/termos')({
  head: () => ({
    meta: [
      { title: `Termos de uso - ${SITE_TITLE}` },
      {
        name: 'description',
        content:
          'As regras da matrícula, do pagamento e da participação nos cursos da Maiyu Academy.',
      },
    ],
  }),
})
