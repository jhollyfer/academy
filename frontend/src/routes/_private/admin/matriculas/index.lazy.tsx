import type * as React from 'react'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { DownloadSimple } from '@phosphor-icons/react'
import { enrollmentsListQueryOptions } from '#/integrations/tanstack-query/queries'
import { ListShell } from '#/components/common/list-shell'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { formatDate, formatPhone } from '#/lib/format'
import { ENROLLMENT_STATUSES } from '#/lib/entity'
import { BASE_URL } from '#/integrations/tanstack-query/http'
import { Route as EnrollmentsRoute } from './index'
import type { Column } from '#/components/common/list-shell'
import type { EnrollmentResponse } from '#/integrations/response'

export const Route = createLazyFileRoute('/_private/admin/matriculas/')({
  component: RouteComponent,
})

const STATUS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  PENDING: { label: 'Aguardando', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmada', variant: 'default' },
  WAITLIST: { label: 'Fila de espera', variant: 'outline' },
  CANCELLED: { label: 'Cancelada', variant: 'destructive' },
}

const COLUMNS: ReadonlyArray<Column<EnrollmentResponse>> = [
  { key: 'student', header: 'Aluno', cell: (row) => row.studentName },
  {
    key: 'course',
    header: 'Curso',
    hideOnMobile: true,
    cell: (row) => row.class?.course?.name ?? '-',
  },
  {
    key: 'contact',
    header: 'Contato',
    hideOnMobile: true,
    cell: (row) => formatPhone(row.phone),
  },
  { key: 'sent', header: 'Enviada em', cell: (row) => formatDate(row.createdAt) },
  {
    key: 'status',
    header: 'Situação',
    cell: (row) => {
      const view = STATUS[row.status]

      return <Badge variant={view.variant}>{view.label}</Badge>
    },
  },
]

function RouteComponent(): React.JSX.Element {
  const search = EnrollmentsRoute.useSearch()
  const navigate = useNavigate({ from: EnrollmentsRoute.fullPath })
  const { data, isPending } = useQuery(enrollmentsListQueryOptions(search))

  return (
    <div className="grid gap-6">
      {/*
        Os filtros de situação como botões, e não um `<select>`: são quatro, a
        secretaria alterna entre eles o dia inteiro, e um select esconde as
        opções atrás de um clique a mais em cada troca.
      */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={search.status ? 'ghost' : 'secondary'}
          size="sm"
          onClick={() => navigate({ search: { ...search, status: undefined, page: undefined } })}
        >
          Todas
        </Button>
        {ENROLLMENT_STATUSES.map((status) => (
          <Button
            key={status}
            variant={search.status === status ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => navigate({ search: { ...search, status, page: undefined } })}
          >
            {STATUS[status].label}
          </Button>
        ))}

        {/*
          A exportação é um `<a>` para a API, e não um fetch: o CSV é um
          download, e o navegador sabe salvar arquivo melhor que qualquer código
          que eu escrevesse aqui. O cookie de sessão viaja junto porque é
          navegação de mesma origem lógica.
        */}
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          render={
            <a href={`${BASE_URL}/administrator/enrollments/export`} download>
              <DownloadSimple />
              Exportar CSV
            </a>
          }
        />
      </div>

      <ListShell
        title="Matrículas"
        description="A fila da secretaria. Confira o comprovante e confirme."
        search={search.search ?? ''}
        columns={COLUMNS}
        rows={data?.data ?? []}
        meta={data?.meta}
        isPending={isPending}
        emptyTitle="Nenhuma matrícula por aqui"
        emptyDescription="Quando alguém se inscrever pelo site, aparece nesta lista."
        rowTo={(row) => ({ to: '/admin/matriculas/$id', params: { id: row.id } })}
        onSearchChange={(term) => navigate({ search: { ...search, search: term, page: undefined } })}
        onPageChange={(page) => navigate({ search: { ...search, page } })}
      />
    </div>
  )
}
