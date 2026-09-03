import { createFileRoute } from '@tanstack/react-router'
import { coursesQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * A rota de criação tem `loader`, ao contrário da de curso: o formulário da
 * turma tem um select de curso, e ele lê por `useSuspenseQuery`. Sem aquecer a
 * chave aqui, o componente suspenderia de verdade no cliente - a tela abriria
 * em branco e só então buscaria o catálogo.
 */
export const Route = createFileRoute('/_private/administrator/classes/new')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(coursesQueryOptions({ perPage: 100 })),
})
