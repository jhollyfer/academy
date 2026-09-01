import { createFileRoute } from '@tanstack/react-router'
import { storefrontEnrollmentQueryOptions } from '#/integrations/tanstack-query/queries'
import { SITE_TITLE } from '#/lib/site'

export const Route = createFileRoute('/_public/matricula/$protocol')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      storefrontEnrollmentQueryOptions(params.protocol),
    ),
  head: () => ({
    meta: [
      { title: `Sua matrícula - ${SITE_TITLE}` },
      // A URL contém o protocolo, que é a credencial do candidato. Indexá-la
      // colocaria o dado pessoal de alguém no resultado de busca.
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
})
