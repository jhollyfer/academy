import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { ClassBulkActions } from './bulk-actions'
import { classColumns } from './columns'
import { ClassFilters } from './filters'
import { ClassRowActions } from './row-actions'
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
import { classesQueryOptions } from '#/integrations/tanstack-query/queries'

const route = getRouteApi('/_private/administrator/classes/')

export function ClassesTable(): React.JSX.Element {
  const { account } = route.useRouteContext()
  const search = route.useSearch()

  const canDelete = account.role === UserRoles.OWNER

  const { data, isPlaceholderData, isError, refetch } = useQuery(
    classesQueryOptions(search),
  )

  const table = useTable({
    rows: data?.data ?? [],
    columns: classColumns,
    getRowId: (row) => row.id,
    persistKey: 'administrator:classes',
    selectable: true,
    actions: (entity) => (
      <ClassRowActions entity={entity} canDelete={canDelete} />
    ),
  })

  return (
    <Table
      to="/administrator/classes"
      search={search}
      isPlaceholderData={isPlaceholderData}
      isError={isError}
      onRetry={() => void refetch()}
    >
      <TableHeader>
        <TableTitle>Turmas</TableTitle>
        <TableActions>
          <TableCreateButton to="/administrator/classes/new">
            Nova turma
          </TableCreateButton>
        </TableActions>
      </TableHeader>

      <TableToolbar>
        <TableSearch placeholder="Buscar turmas…" />
        <ClassFilters search={search} />
        <TableTrashToggle />
        <TableColumnToggle table={table} />
      </TableToolbar>

      <TableContent>
        <TableEmpty table={table}>
          <TableEmptyTitle>Nenhuma turma cadastrada</TableEmptyTitle>
          <TableEmptyDescription>
            Sem turma aberta, a matrícula do site não tem o que oferecer.
          </TableEmptyDescription>
          <TableEmptyActions>
            <TableCreateButton to="/administrator/classes/new">
              Nova turma
            </TableCreateButton>
          </TableEmptyActions>
        </TableEmpty>

        <TableGrid table={table} />

        <TableSelectionBar table={table} noun={['turma', 'turmas']}>
          {(entities) => <ClassBulkActions entities={entities} />}
        </TableSelectionBar>
      </TableContent>

      <TablePagination meta={data?.meta} />
    </Table>
  )
}
