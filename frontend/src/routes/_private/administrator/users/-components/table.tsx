import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { userColumns } from './columns'
import { UserFilters } from './filters'
import { UserRowActions } from './row-actions'
import {
  Table,
  TableActions,
  TableColumnToggle,
  TableContent,
  TableEmpty,
  TableEmptyDescription,
  TableEmptyTitle,
  TableGrid,
  TableHeader,
  TablePagination,
  TableSearch,
  TableTitle,
  TableToolbar,
  TableTrashToggle,
  useTable,
} from '#/components/common/table'
import { UserRoles } from '#/lib/entity'
import { usersQueryOptions } from '#/integrations/tanstack-query/queries'

const route = getRouteApi('/_private/administrator/users/')

export function UsersTable(): React.JSX.Element {
  const { account } = route.useRouteContext()
  const search = route.useSearch()

  // Mesma linha do resto do painel: só o dono apaga de vez. Aqui ela tem um
  // segundo efeito - o dono também é o único que enxerga o próprio registro na
  // lista, porque o backend o filtra para quem não é ele.
  const canDelete = account.role === UserRoles.OWNER

  const { data, isPlaceholderData, isError, refetch } = useQuery(
    usersQueryOptions(search),
  )

  const table = useTable({
    rows: data?.data ?? [],
    columns: userColumns,
    getRowId: (row) => row.id,
    persistKey: 'administrator:users',
    // Sem seleção: as ações em massa deste recurso seriam arquivar gente, e um
    // clique errado tira o acesso de uma turma inteira de famílias.
    selectable: false,
    actions: (user) => (
      <UserRowActions
        user={user}
        canDelete={canDelete}
        isSelf={user.id === account.id}
      />
    ),
  })

  return (
    <Table
      to="/administrator/users"
      search={search}
      isPlaceholderData={isPlaceholderData}
      isError={isError}
      onRetry={() => void refetch()}
    >
      <TableHeader>
        <TableTitle>Usuários</TableTitle>
        <TableActions />
      </TableHeader>

      <TableToolbar>
        <TableSearch placeholder="Buscar por nome ou e-mail…" />
        <UserFilters search={search} />
        <TableTrashToggle />
        <TableColumnToggle table={table} />
      </TableToolbar>

      <TableContent>
        <TableEmpty table={table}>
          <TableEmptyTitle>Nenhum usuário encontrado</TableEmptyTitle>
          <TableEmptyDescription>
            A equipe da escola nasce com senha; responsável e aluno nascem por
            convite, na confirmação da matrícula.
          </TableEmptyDescription>
        </TableEmpty>

        <TableGrid table={table} />
      </TableContent>

      <TablePagination meta={data?.meta} />
    </Table>
  )
}
