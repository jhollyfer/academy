import type * as React from 'react'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { classesListQueryOptions } from '#/integrations/tanstack-query/queries'
import { ListShell } from '#/components/common/list-shell'
import { Badge } from '#/components/ui/badge'
import { formatDate } from '#/lib/format'
import { ClassStatuses } from '#/lib/entity'
import { Route as ClassesRoute } from './index'
import type { Column } from '#/components/common/list-shell'
import type { ClassResponse } from '#/integrations/response'

export const Route = createLazyFileRoute('/_private/admin/turmas/')({
  component: RouteComponent,
})

/**
 * O rótulo de cada situação, em português.
 *
 * Um mapa e não uma cadeia de `if`: são três valores, e a variante do `Badge`
 * anda junto com o rótulo - separá-los daria duas listas para divergir.
 */
const STATUS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  OPEN: { label: 'Aberta', variant: 'default' },
  FULL: { label: 'Lotada', variant: 'secondary' },
  CLOSED: { label: 'Fechada', variant: 'outline' },
}

const COLUMNS: ReadonlyArray<Column<ClassResponse>> = [
  { key: 'name', header: 'Turma', cell: (entity) => entity.name },
  {
    key: 'course',
    header: 'Curso',
    hideOnMobile: true,
    cell: (entity) => entity.course?.name ?? '-',
  },
  {
    key: 'starts',
    header: 'Começa em',
    cell: (entity) => formatDate(entity.startsAt),
  },
  {
    key: 'seats',
    header: 'Vagas',
    cell: (entity) => {
      // `seatsRemaining` some quando a leitura não contou. Mostrar a capacidade
      // sozinha daria a impressão de turma vazia.
      if (entity.seatsRemaining === undefined) return `${entity.capacity} no total`

      return `${entity.seatsRemaining} de ${entity.capacity}`
    },
  },
  {
    key: 'status',
    header: 'Situação',
    cell: (entity) => {
      const view = STATUS[entity.status] ?? STATUS[ClassStatuses.OPEN]

      return <Badge variant={view.variant}>{view.label}</Badge>
    },
  },
]

function RouteComponent(): React.JSX.Element {
  const search = ClassesRoute.useSearch()
  const navigate = useNavigate({ from: ClassesRoute.fullPath })
  const { data, isPending } = useQuery(classesListQueryOptions(search))

  return (
    <ListShell
      title="Turmas"
      description="Quando cada curso acontece, e quantas vagas restam."
      createTo="/admin/turmas/nova"
      createLabel="Nova turma"
      search={search.search ?? ''}
      columns={COLUMNS}
      rows={data?.data ?? []}
      meta={data?.meta}
      isPending={isPending}
      emptyTitle="Nenhuma turma cadastrada"
      emptyDescription="Sem turma aberta, a matrícula do site não tem o que oferecer."
      rowTo={(entity) => ({ to: '/admin/turmas/$id', params: { id: entity.id } })}
      onSearchChange={(term) => navigate({ search: { ...search, search: term, page: undefined } })}
      onPageChange={(page) => navigate({ search: { ...search, page } })}
    />
  )
}
