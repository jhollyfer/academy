import { createFileRoute } from '@tanstack/react-router'
import {
  classDetailQueryOptions,
  coursesListQueryOptions,
} from '#/integrations/tanstack-query/queries'

export const Route = createFileRoute('/_private/admin/turmas/$id/')({
  loader: async ({ context, params }) => {
    // `Promise.all` e não em sequência: as duas leituras são independentes, e
    // encadeá-las somaria os dois tempos de espera sem motivo.
    await Promise.all([
      context.queryClient.ensureQueryData(classDetailQueryOptions(params.id)),
      context.queryClient.ensureQueryData(coursesListQueryOptions({ perPage: 100 })),
    ])
  },
})
