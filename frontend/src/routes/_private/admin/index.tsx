import { createFileRoute } from '@tanstack/react-router'
import {
  classesListQueryOptions,
  enrollmentsListQueryOptions,
} from '#/integrations/tanstack-query/queries'

export const Route = createFileRoute('/_private/admin/')({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(classesListQueryOptions({ perPage: 100 })),
      // Cem últimas matrículas: o funil da tela é da turma corrente, e a escola
      // abre uma turma de quarenta por vez. Puxar tudo seria carregar o
      // histórico inteiro para desenhar quatro números.
      context.queryClient.ensureQueryData(enrollmentsListQueryOptions({ perPage: 100 })),
    ])
  },
})
