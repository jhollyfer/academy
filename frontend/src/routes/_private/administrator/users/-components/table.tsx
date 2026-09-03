import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { UserBulkActions } from './bulk-actions'
import { userColumns } from './columns'
import { UserFilters } from './filters'
import { UserRowActions } from './row-actions'
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
    // Predicado, e não `true`: a própria conta e a do dono nascem com a caixa
    // desabilitada. É o que torna a ação em massa aceitável aqui - arquivar em
    // lote tira acesso de várias pessoas, e as duas linhas que quem clicou não
    // conseguiria desfazer ficam fora da seleção. O backend recusa as duas de
    // todo modo, com 403.
    selectable: (row) => row.id !== account.id && row.role !== UserRoles.OWNER,
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
        <TableActions>
          <TableCreateButton to="/administrator/users/new">
            Adicionar usuário
          </TableCreateButton>
        </TableActions>
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
          <TableEmptyActions>
            <TableCreateButton to="/administrator/users/new">
              Adicionar usuário
            </TableCreateButton>
          </TableEmptyActions>
        </TableEmpty>

        <TableGrid table={table} />

        <TableSelectionBar table={table} noun={['conta', 'contas']}>
          {(users) => <UserBulkActions users={users} />}
        </TableSelectionBar>
      </TableContent>

      <TablePagination meta={data?.meta} />
    </Table>
  )
}
