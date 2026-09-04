import { Badge } from '#/components/ui/badge'
import { TableColumnHeader } from '#/components/common/table'
import type { TableColumns } from '#/components/common/table'
import { ACTIVE_STATUS_LABELS, ACTIVE_STATUS_VARIANTS } from '#/lib/labels'
import type { PartnerResponse } from '#/integrations/response'

/**
 * `sortKey` só existe onde o backend ordena - o `paginate` de parceiros aceita
 * `name`, `position` e `createdAt`. Qualquer outra coluna oferecendo a ordem
 * viraria `422` ao primeiro clique no cabeçalho.
 */
export const partnerColumns: TableColumns<PartnerResponse> = [
  {
    accessorKey: 'name',
    meta: { label: 'Instituição' },
    size: 280,
    header: ({ column }) => (
      <TableColumnHeader sortKey="name" column={column}>
        Instituição
      </TableColumnHeader>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'role',
    meta: { label: 'O que faz' },
    size: 360,
    header: ({ column }) => (
      <TableColumnHeader column={column}>O que faz</TableColumnHeader>
    ),
    // A coluna larga é esta, e não a do nome: é o papel que a página publica, e
    // é aqui que se percebe um texto genérico antes de ele ir para a home.
    cell: ({ row }) => (
      <span className="text-muted-foreground block truncate">
        {row.original.role}
      </span>
    ),
  },
  {
    accessorKey: 'position',
    meta: { label: 'Posição' },
    size: 110,
    header: ({ column }) => (
      <TableColumnHeader sortKey="position" column={column}>
        Posição
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {row.original.position}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    meta: { label: 'Situação' },
    size: 140,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Situação</TableColumnHeader>
    ),
    cell: ({ row }) => (
      <Badge variant={ACTIVE_STATUS_VARIANTS[row.original.status]}>
        {ACTIVE_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
]
