import { createFileRoute } from '@tanstack/react-router'
import { coursesListQueryOptions } from '#/integrations/tanstack-query/queries'

export const Route = createFileRoute('/_private/admin/turmas/nova')({
  // A turma precisa da lista de cursos para o seletor. Cem por página porque a
  // escola tem dois: paginar um seletor de dois itens seria trabalho para nada.
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      coursesListQueryOptions({ perPage: 100 }),
    ),
})
