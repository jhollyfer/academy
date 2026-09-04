import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { PhotoBulkActions } from './bulk-actions'
import { photoColumns } from './columns'
import { PhotoFilters } from './filters'
import { PhotoRowActions } from './row-actions'
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
import { photosQueryOptions } from '#/integrations/tanstack-query/queries'

const route = getRouteApi('/_private/administrator/photos/')

export function PhotosTable(): React.JSX.Element {
  const { account } = route.useRouteContext()
  const search = route.useSearch()

  const canDelete = account.role === UserRoles.OWNER

  const { data, isPlaceholderData, isError, refetch } = useQuery(
    photosQueryOptions(search),
  )

  const table = useTable({
    rows: data?.data ?? [],
    columns: photoColumns,
    getRowId: (row) => row.id,
    persistKey: 'administrator:photos',
    selectable: true,
    actions: (photo) => (
      <PhotoRowActions photo={photo} canDelete={canDelete} />
    ),
  })

  return (
    <Table
      to="/administrator/photos"
      search={search}
      isPlaceholderData={isPlaceholderData}
      isError={isError}
      onRetry={() => void refetch()}
    >
      <TableHeader>
        <TableTitle>Galeria</TableTitle>
        <TableActions>
          <TableCreateButton to="/administrator/photos/new">
            Nova foto
          </TableCreateButton>
        </TableActions>
      </TableHeader>

      <TableToolbar>
        <TableSearch placeholder="Buscar por legenda…" />
        <PhotoFilters search={search} />
        <TableTrashToggle />
        <TableColumnToggle table={table} />
      </TableToolbar>

      <TableContent>
        <TableEmpty table={table}>
          <TableEmptyTitle>Nenhuma foto publicada</TableEmptyTitle>
          <TableEmptyDescription>
            A vitrine é ilustrada, e ilustração não prova que o lugar existe.
            Foto da sala, da bancada e dos equipamentos é a prova mais direta
            que a escola tem enquanto não há turma formada. A galeria só aparece
            no site quando há ao menos uma foto no ar.
          </TableEmptyDescription>
          <TableEmptyActions>
            <TableCreateButton to="/administrator/photos/new">
              Nova foto
            </TableCreateButton>
          </TableEmptyActions>
        </TableEmpty>

        <TableGrid table={table} />

        <TableSelectionBar table={table} noun={['foto', 'fotos']}>
          {(photos) => <PhotoBulkActions photos={photos} />}
        </TableSelectionBar>
      </TableContent>

      <TablePagination meta={data?.meta} />
    </Table>
  )
}
