import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { EnrollmentBulkActions } from './bulk-actions'
import { enrollmentColumns } from './columns'
import { EnrollmentFilters } from './filters'
import { EnrollmentRowActions } from './row-actions'
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
  TableSelectionBar,
  TableTitle,
  TableToolbar,
  TableTrashToggle,
  useTable,
} from '#/components/common/table'
import { Button } from '#/components/ui/button'
import { UserRoles } from '#/lib/entity'
import { BASE_URL } from '#/integrations/tanstack-query/http'
import { enrollmentsQueryOptions } from '#/integrations/tanstack-query/queries'

const route = getRouteApi('/_private/administrator/enrollments/')

export function EnrollmentsTable(): React.JSX.Element {
  const { account } = route.useRouteContext()
  const search = route.useSearch()

  const canDelete = account.role === UserRoles.OWNER

  const { data, isPlaceholderData, isError, refetch } = useQuery(
    enrollmentsQueryOptions(search),
  )

  const table = useTable({
    rows: data?.data ?? [],
    columns: enrollmentColumns,
    getRowId: (row) => row.id,
    persistKey: 'administrator:enrollments',
    selectable: true,
    actions: (enrollment) => (
      <EnrollmentRowActions enrollment={enrollment} canDelete={canDelete} />
    ),
  })

  return (
    <Table
      to="/administrator/enrollments"
      search={search}
      isPlaceholderData={isPlaceholderData}
      isError={isError}
      onRetry={() => void refetch()}
    >
      <TableHeader>
        <TableTitle>Matrículas</TableTitle>
        <TableActions>
          {/*
            A exportação é um `<a>` para a API, e não um fetch: o CSV é um
            download, e o navegador sabe salvar arquivo melhor que qualquer
            código que eu escrevesse aqui. O cookie de sessão viaja junto porque
            é navegação de mesma origem lógica.
          */}
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={
              <a
                href={BASE_URL.concat('/administrator/enrollments/export')}
                download
              >
                <DownloadSimpleIcon />
                Exportar CSV
              </a>
            }
          />
        </TableActions>
      </TableHeader>

      <TableToolbar>
        <TableSearch placeholder="Buscar por aluno ou protocolo…" />
        <EnrollmentFilters search={search} />
        <TableTrashToggle />
        <TableColumnToggle table={table} />
      </TableToolbar>

      <TableContent>
        {/*
          Sem `TableEmptyActions`: não há botão de criar. A matrícula nasce no
          site, pelo candidato - a secretaria confere, não cadastra.
        */}
        <TableEmpty table={table}>
          <TableEmptyTitle>Nenhuma matrícula por aqui</TableEmptyTitle>
          <TableEmptyDescription>
            Quando alguém se inscrever pelo site, aparece nesta lista com o
            comprovante do Pix para conferência.
          </TableEmptyDescription>
        </TableEmpty>

        <TableGrid table={table} />

        <TableSelectionBar table={table} noun={['matrícula', 'matrículas']}>
          {(enrollments) => <EnrollmentBulkActions enrollments={enrollments} />}
        </TableSelectionBar>
      </TableContent>

      <TablePagination meta={data?.meta} />
    </Table>
  )
}
