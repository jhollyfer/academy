import { Badge } from '#/components/ui/badge'
import { TableColumnHeader } from '#/components/common/table'
import type { TableColumns } from '#/components/common/table'
import {
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_STATUS_VARIANTS,
} from '#/lib/labels'
import { formatDate, formatPhone } from '#/lib/format'
import type { EnrollmentResponse } from '#/integrations/response'

/**
 * `sortKey` só existe onde o backend ordena - o `paginate` de matrículas aceita
 * `studentName`, `status` e `createdAt`. Qualquer outra coluna oferecendo a
 * ordem viraria `422` ao primeiro clique no cabeçalho.
 */
export const enrollmentColumns: TableColumns<EnrollmentResponse> = [
  {
    accessorKey: 'studentName',
    meta: { label: 'Aluno' },
    size: 280,
    header: ({ column }) => (
      <TableColumnHeader sortKey="studentName" column={column}>
        Aluno
      </TableColumnHeader>
    ),
    // Nome e protocolo na mesma célula: é pelo protocolo que o candidato liga
    // perguntando da matrícula, e procurá-lo numa coluna própria custaria
    // largura que a tabela não tem.
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate leading-snug font-medium">
          {row.original.studentName}
        </span>
        <code className="text-muted-foreground truncate text-xs">
          {row.original.protocol}
        </code>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'class',
    meta: { label: 'Turma' },
    size: 240,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Turma</TableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate">
          {row.original.class?.course?.name ?? '-'}
        </span>
        <span className="text-muted-foreground truncate text-xs">
          {row.original.class?.name ?? '-'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    meta: { label: 'Contato' },
    size: 170,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Contato</TableColumnHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {formatPhone(row.original.phone)}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    meta: { label: 'Enviada em' },
    size: 150,
    header: ({ column }) => (
      <TableColumnHeader sortKey="createdAt" column={column}>
        Enviada em
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    meta: { label: 'Situação' },
    size: 150,
    header: ({ column }) => (
      <TableColumnHeader sortKey="status" column={column}>
        Situação
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <Badge variant={ENROLLMENT_STATUS_VARIANTS[row.original.status]}>
        {ENROLLMENT_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
]
