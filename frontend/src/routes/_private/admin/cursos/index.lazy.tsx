import type * as React from 'react'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { coursesListQueryOptions } from '#/integrations/tanstack-query/queries'
import { ListShell } from '#/components/common/list-shell'
import { Badge } from '#/components/ui/badge'
import { formatMoney } from '#/lib/format'
import { ActiveStatuses } from '#/lib/entity'
import { Route as CoursesRoute } from './index'
import type { Column } from '#/components/common/list-shell'
import type { CourseResponse } from '#/integrations/response'

export const Route = createLazyFileRoute('/_private/admin/cursos/')({
  component: RouteComponent,
})

const COLUMNS: ReadonlyArray<Column<CourseResponse>> = [
  { key: 'name', header: 'Curso', cell: (course) => course.name },
  {
    key: 'status',
    header: 'Situação',
    cell: (course) => {
      if (course.status === ActiveStatuses.ACTIVE) return <Badge>No ar</Badge>

      return <Badge variant="secondary">Fora do ar</Badge>
    },
  },
  {
    key: 'classes',
    header: 'Turmas',
    hideOnMobile: true,
    // `classesCount` some quando a leitura não contou. Zero e ausente não são a
    // mesma coisa, e o hífen diz "não sei" em vez de mentir "nenhuma".
    cell: (course) => course.classesCount ?? '-',
  },
  {
    key: 'fee',
    header: 'Mensalidade',
    hideOnMobile: true,
    cell: (course) => formatMoney(course.monthlyFeeInCents),
  },
]

function RouteComponent(): React.JSX.Element {
  const search = CoursesRoute.useSearch()
  const navigate = useNavigate({ from: CoursesRoute.fullPath })

  // `useQuery` e não `useSuspenseQuery`: a listagem precisa de
  // `isPlaceholderData` para manter a página anterior enquanto a nova carrega.
  const { data, isPending } = useQuery(coursesListQueryOptions(search))

  return (
    <ListShell
      title="Cursos"
      description="O que a escola oferece, com a grade e o FAQ de cada um."
      createTo="/admin/cursos/novo"
      createLabel="Novo curso"
      search={search.search ?? ''}
      columns={COLUMNS}
      rows={data?.data ?? []}
      meta={data?.meta}
      isPending={isPending}
      emptyTitle="Nenhum curso cadastrado"
      emptyDescription="Cadastre o primeiro curso para abrir turma e receber matrícula."
      rowTo={(course) => ({ to: '/admin/cursos/$id', params: { id: course.id } })}
      onSearchChange={(term) => navigate({ search: { ...search, search: term, page: undefined } })}
      onPageChange={(page) => navigate({ search: { ...search, page } })}
    />
  )
}
