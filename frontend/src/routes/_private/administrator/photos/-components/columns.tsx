import { Badge } from '#/components/ui/badge'
import { TableColumnHeader } from '#/components/common/table'
import type { TableColumns } from '#/components/common/table'
import { ACTIVE_STATUS_LABELS, ACTIVE_STATUS_VARIANTS } from '#/lib/labels'
import type { PhotoResponse } from '#/integrations/response'

export const photoColumns: TableColumns<PhotoResponse> = [
  {
    accessorKey: 'caption',
    meta: { label: 'Foto' },
    size: 460,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Foto</TableColumnHeader>
    ),
    // A miniatura junto da legenda: numa galeria, reconhecer a foto pelo texto
    // é mais lento que vê-la, e a legenda sozinha não diz qual imagem é.
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center gap-3">
        {row.original.image?.url && (
          <img
            src={row.original.image.url}
            alt=""
            className="bg-muted size-10 shrink-0 rounded object-cover"
          />
        )}
        <span className="truncate">{row.original.caption}</span>
      </div>
    ),
    enableHiding: false,
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
