import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { PartnerBulkActions } from './bulk-actions'
import { partnerColumns } from './columns'
import { PartnerFilters } from './filters'
import { PartnerRowActions } from './row-actions'
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
import { partnersQueryOptions } from '#/integrations/tanstack-query/queries'

const route = getRouteApi('/_private/administrator/partners/')

export function PartnersTable(): React.JSX.Element {
  const { account } = route.useRouteContext()
  const search = route.useSearch()

  // Só o dono apaga de vez; o administrador arquiva e restaura. O guard do
  // backend responde 403, e a tela não oferece o botão para não prometer o que
  // a API recusa.
  const canDelete = account.role === UserRoles.OWNER

  const { data, isPlaceholderData, isError, refetch } = useQuery(
    partnersQueryOptions(search),
  )

  const table = useTable({
    rows: data?.data ?? [],
    columns: partnerColumns,
    getRowId: (row) => row.id,
    persistKey: 'administrator:partners',
    selectable: true,
    actions: (partner) => (
      <PartnerRowActions partner={partner} canDelete={canDelete} />
    ),
  })

  return (
    <Table
      to="/administrator/partners"
      search={search}
      isPlaceholderData={isPlaceholderData}
      isError={isError}
      onRetry={() => void refetch()}
    >
      <TableHeader>
        <TableTitle>Parceiros</TableTitle>
        <TableActions>
          <TableCreateButton to="/administrator/partners/new">
            Novo parceiro
          </TableCreateButton>
        </TableActions>
      </TableHeader>

      <TableToolbar>
        <TableSearch placeholder="Buscar parceiros…" />
        <PartnerFilters search={search} />
        <TableTrashToggle />
        <TableColumnToggle table={table} />
      </TableToolbar>

      <TableContent>
        <TableEmpty table={table}>
          <TableEmptyTitle>Nenhum parceiro cadastrado</TableEmptyTitle>
          <TableEmptyDescription>
            Enquanto não houver turma formada, é o parceiro nomeado que sustenta
            a página. A faixa da home só aparece quando há ao menos um no ar.
          </TableEmptyDescription>
          <TableEmptyActions>
            <TableCreateButton to="/administrator/partners/new">
              Novo parceiro
            </TableCreateButton>
          </TableEmptyActions>
        </TableEmpty>

        <TableGrid table={table} />

        <TableSelectionBar table={table} noun={['parceiro', 'parceiros']}>
          {(partners) => <PartnerBulkActions partners={partners} />}
        </TableSelectionBar>
      </TableContent>

      <TablePagination meta={data?.meta} />
    </Table>
  )
}
