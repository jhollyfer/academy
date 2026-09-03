import { getRouteApi } from '@tanstack/react-router'
import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import { saveBlob } from '#/lib/download'
import { useEnrollmentsExport } from '#/integrations/tanstack-query/mutations'
import { enrollmentsQueryOptions } from '#/integrations/tanstack-query/queries'

const route = getRouteApi('/_private/administrator/enrollments/')

export function EnrollmentsTable(): React.JSX.Element {
  const { account } = route.useRouteContext()
  const search = route.useSearch()

  const canDelete = account.role === UserRoles.OWNER

  const { data, isPlaceholderData, isError, refetch } = useQuery(
    enrollmentsQueryOptions(search),
  )

  const exportCsv = useEnrollmentsExport({
    onSuccess: ({ blob, filename }) =>
      // O nome vem do `Content-Disposition` da API; o daqui é o que sobra se o
      // header não vier. Sem extensão o navegador salva um arquivo que o
      // sistema não sabe abrir.
      saveBlob(blob, filename ?? 'matriculas.csv'),
    onError: (error) =>
      toast.error(error.message, { id: 'enrollments-export' }),
  })

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
            A exportação passa pelo cliente HTTP, e não por um `<a href>` para a
            API. Âncora é navegação do navegador: o cookie vai junto, mas a
            requisição não passa pelo `request`, que é quem renova o access token
            vencido. Um dia depois do login o botão baixava o JSON do erro 401
            com nome de planilha - arquivo que abre no Excel como lixo, sem
            nenhum aviso de que a sessão é que estava velha.
          */}
          <Button
            variant="outline"
            size="sm"
            disabled={exportCsv.isPending}
            onClick={() => exportCsv.mutate()}
          >
            <DownloadSimpleIcon />
            Exportar CSV
          </Button>
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
