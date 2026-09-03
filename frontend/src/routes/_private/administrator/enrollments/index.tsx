import { createFileRoute } from '@tanstack/react-router'
import { enrollmentsListQueryOptions } from '#/integrations/tanstack-query/queries'
import { validateListSearch } from '#/lib/list-search'
import { ENROLLMENT_STATUSES } from '#/lib/entity'
import type { EnrollmentStatus } from '#/lib/entity'
import type { ListSearch } from '#/lib/list-search'
import type { Merge } from '#/lib/interfaces'

/**
 * Os filtros da fila da secretaria: os de toda listagem, mais o status.
 *
 * O status entra na URL como o resto: "me manda as pendentes" é um link, e um
 * `useState` obrigaria a descrever o caminho por escrito.
 */
function validateSearch(
  search: Record<string, unknown>,
): Merge<ListSearch, { status?: EnrollmentStatus }> {
  // O retorno é um tipo só, e não uma união com e sem `status`: uma união faria
  // o campo sumir do tipo em quem lê o search, e a tela não conseguiria nem ler
  // o filtro que ela mesma escreveu.
  const result: Merge<ListSearch, { status?: EnrollmentStatus }> =
    validateListSearch(search)

  const status = ENROLLMENT_STATUSES.find((value) => value === search.status)

  if (status) result.status = status

  return result
}

export const Route = createFileRoute('/_private/admin/matriculas/')({
  validateSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(enrollmentsListQueryOptions(deps)),
})
