import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CourseBulkActions } from './bulk-actions'
import { courseColumns } from './columns'
import { CourseFilters } from './filters'
import { CourseRowActions } from './row-actions'
import {
  Table,
  TableActions,
  TableColumnToggle,
  TableContent,
  TableCreateButton,
  TableEmpty,
  TableEmptyActions,
  TableEmptyDescription,
  TableEmptyTitle,
  TableGrid,
  TableHeader,
  TablePagination,
  TableSearch,
  TableSelectionBar,
  TableTitle,
  TableToolbar,
  TableTrashToggle,
  useTable,
} from '#/components/common/table'
import { UserRoles } from '#/lib/entity'
import { coursesQueryOptions } from '#/integrations/tanstack-query/queries'

const route = getRouteApi('/_private/administrator/courses/')

export function CoursesTable(): React.JSX.Element {
  const { account } = route.useRouteContext()
  const search = route.useSearch()

  // Só o dono apaga de vez; o administrador arquiva e restaura. O guard do
  // backend responde 403, e a tela não oferece o botão para não prometer o que
  // a API recusa. O papel vem do `beforeLoad` de `_private/layout.tsx`.
  const canDelete = account.role === UserRoles.OWNER

  // `useQuery` e não `useSuspenseQuery`: a listagem precisa de
  // `isPlaceholderData` e de `isError` para manter as linhas antigas na troca
  // de página e para trocar o vazio pelo estado de erro. O `loader` já encheu o
  // cache, então não há requisição a mais.
  const { data, isPlaceholderData, isError, refetch } = useQuery(
    coursesQueryOptions(search),
  )

  const table = useTable({
    rows: data?.data ?? [],
    columns: courseColumns,
    getRowId: (row) => row.id,
    persistKey: 'administrator:courses',
    selectable: true,
    actions: (course) => (
      <CourseRowActions course={course} canDelete={canDelete} />
    ),
  })

  return (
    <Table
      to="/administrator/courses"
      search={search}
      isPlaceholderData={isPlaceholderData}
      isError={isError}
      onRetry={() => void refetch()}
    >
      <TableHeader>
        <TableTitle>Cursos</TableTitle>
        <TableActions>
          <TableCreateButton to="/administrator/courses/new">
            Novo curso
          </TableCreateButton>
        </TableActions>
      </TableHeader>

      <TableToolbar>
        <TableSearch placeholder="Buscar cursos…" />
        <CourseFilters search={search} />
        <TableTrashToggle />
        <TableColumnToggle table={table} />
      </TableToolbar>

      <TableContent>
        <TableEmpty table={table}>
          <TableEmptyTitle>Nenhum curso cadastrado</TableEmptyTitle>
          <TableEmptyDescription>
            Cadastre o primeiro curso para abrir turma e receber matrícula. O
            que estiver no ar aparece na vitrine, com a grade e o FAQ.
          </TableEmptyDescription>
          <TableEmptyActions>
            <TableCreateButton to="/administrator/courses/new">
              Novo curso
            </TableCreateButton>
          </TableEmptyActions>
        </TableEmpty>

        <TableGrid table={table} />

        <TableSelectionBar table={table} noun={['curso', 'cursos']}>
          {(courses) => <CourseBulkActions courses={courses} />}
        </TableSelectionBar>
      </TableContent>

      <TablePagination meta={data?.meta} />
    </Table>
  )
}
