import { Badge } from '#/components/ui/badge'
import { TableColumnHeader } from '#/components/common/table'
import type { TableColumns } from '#/components/common/table'
import {
  ACTIVE_STATUS_LABELS,
  ACTIVE_STATUS_VARIANTS,
  COURSE_ACCENT_LABELS,
} from '#/lib/labels'
import { formatMoney } from '#/lib/format'
import type { CourseResponse } from '#/integrations/response'

/**
 * `meta.label` é o rótulo em texto puro, para o menu de colunas visíveis:
 * `header` virou componente, e `String(elemento)` imprime `[object Object]`.
 *
 * `sortKey` só existe onde o backend ordena - o `paginate` de cursos aceita
 * `name`, `position`, `status` e `createdAt`. Qualquer outra coluna oferecendo
 * a ordem viraria `422` ao primeiro clique no cabeçalho.
 *
 * `size` é obrigatório desde que a tabela passou a `table-layout: fixed`: é ele
 * que vira a largura da coluna, e sem ele toda coluna valeria o default de
 * 150px.
 */
export const courseColumns: TableColumns<CourseResponse> = [
  {
    accessorKey: 'name',
    meta: { label: 'Curso' },
    size: 300,
    header: ({ column }) => (
      <TableColumnHeader sortKey="name" column={column}>
        Curso
      </TableColumnHeader>
    ),
    // Nome e chamada na mesma célula: a chamada é o que distingue dois cursos
    // de nome parecido, e uma coluna só para ela alargaria a tabela sem dizer
    // nada a mais. `?sort=tagline` também não existe.
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate leading-snug font-medium">
          {row.original.name}
        </span>
        <span className="text-muted-foreground truncate text-xs">
          {row.original.tagline}
        </span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'slug',
    meta: { label: 'Slug' },
    size: 200,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Slug</TableColumnHeader>
    ),
    // É o endereço do curso na vitrine, e por isso aparece como código: quem
    // confere um link publicado precisa lê-lo caractere a caractere.
    cell: ({ row }) => (
      <code className="bg-muted block truncate rounded px-1.5 py-0.5 text-xs">
        {row.original.slug}
      </code>
    ),
  },
  {
    accessorKey: 'accent',
    meta: { label: 'Trilha' },
    size: 190,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Trilha</TableColumnHeader>
    ),
    // Texto e não `Badge`: o acento é a cor do curso na vitrine, não um estado,
    // e pintá-lo aqui competiria com a coluna que de fato muda, a de situação.
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {COURSE_ACCENT_LABELS[row.original.accent] ?? row.original.accent}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    meta: { label: 'Situação' },
    size: 140,
    header: ({ column }) => (
      <TableColumnHeader sortKey="status" column={column}>
        Situação
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <Badge variant={ACTIVE_STATUS_VARIANTS[row.original.status]}>
        {ACTIVE_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'classesCount',
    meta: { label: 'Turmas' },
    size: 110,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Turmas</TableColumnHeader>
    ),
    // `classesCount` some quando a leitura não contou. Zero e ausente não são a
    // mesma coisa, e o hífen diz "não sei" em vez de mentir "nenhuma".
    cell: ({ row }) => (
      <span className="text-muted-foreground tabular-nums">
        {row.original.classesCount ?? '-'}
      </span>
    ),
  },
  {
    accessorKey: 'monthlyFeeInCents',
    meta: { label: 'Mensalidade' },
    size: 150,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Mensalidade</TableColumnHeader>
    ),
    cell: ({ row }) => (
      <span className="tabular-nums">
        {formatMoney(row.original.monthlyFeeInCents)}
      </span>
    ),
  },
]
