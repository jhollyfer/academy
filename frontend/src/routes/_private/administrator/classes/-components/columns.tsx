import { Badge } from '#/components/ui/badge'
import { TableColumnHeader } from '#/components/common/table'
import type { TableColumns } from '#/components/common/table'
import { CLASS_STATUS_LABELS, CLASS_STATUS_VARIANTS } from '#/lib/labels'
import { formatDate } from '#/lib/format'
import { formatTimeRange } from '#/lib/enrollment-state'
import type { ClassResponse } from '#/integrations/response'

/**
 * `sortKey` só existe onde o backend ordena - o `paginate` de turmas aceita
 * `name`, `startsAt`, `status` e `createdAt`. Qualquer outra coluna oferecendo
 * a ordem viraria `422` ao primeiro clique no cabeçalho.
 */
export const classColumns: TableColumns<ClassResponse> = [
  {
    accessorKey: 'name',
    meta: { label: 'Turma' },
    size: 260,
    header: ({ column }) => (
      <TableColumnHeader sortKey="name" column={column}>
        Turma
      </TableColumnHeader>
    ),
    // Nome e curso na mesma célula: o nome sozinho ("Turma de estreia") não diz
    // de que curso é, e é essa a primeira pergunta de quem abre a lista.
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate leading-snug font-medium">
          {row.original.name}
        </span>
        <span className="text-muted-foreground truncate text-xs">
          {row.original.course?.name ?? '-'}
        </span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'startsAt',
    meta: { label: 'Começa em' },
    size: 150,
    header: ({ column }) => (
      <TableColumnHeader sortKey="startsAt" column={column}>
        Começa em
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {formatDate(row.original.startsAt)}
      </span>
    ),
  },
  {
    // O horário é o que separa duas turmas do mesmo curso na mesma manhã: sem
    // esta coluna a lista mostra duas linhas que parecem a mesma turma.
    accessorKey: 'startsAtTime',
    meta: { label: 'Horário' },
    size: 140,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Horário</TableColumnHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {formatTimeRange(row.original.startsAtTime, row.original.endsAtTime) ||
          '-'}
      </span>
    ),
  },
  {
    accessorKey: 'capacity',
    meta: { label: 'Vagas' },
    size: 130,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Vagas</TableColumnHeader>
    ),
    cell: ({ row }) => <Seats entity={row.original} />,
  },
  {
    accessorKey: 'status',
    meta: { label: 'Situação' },
    size: 130,
    header: ({ column }) => (
      <TableColumnHeader sortKey="status" column={column}>
        Situação
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <Badge variant={CLASS_STATUS_VARIANTS[row.original.status]}>
        {CLASS_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
]

/**
 * As vagas restantes sobre a capacidade.
 *
 * `seatsRemaining` some quando a leitura não contou. Mostrar a capacidade
 * sozinha daria a impressão de turma vazia, então o texto muda de forma em vez
 * de mentir um número.
 */
function Seats({ entity }: { entity: ClassResponse }): React.JSX.Element {
  if (entity.seatsRemaining === undefined) {
    return (
      <span className="text-muted-foreground tabular-nums">
        {entity.capacity} no total
      </span>
    )
  }

  return (
    <span className="tabular-nums">
      {entity.seatsRemaining} de {entity.capacity}
    </span>
  )
}
