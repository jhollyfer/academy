import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { TableColumnHeader } from '#/components/common/table'
import type { TableColumns } from '#/components/common/table'
import {
  ACTIVE_STATUS_LABELS,
  ACTIVE_STATUS_VARIANTS,
  USER_ROLE_LABELS,
  USER_ROLE_VARIANTS,
  initials,
} from '#/lib/labels'
import { formatDate } from '#/lib/format'
import type { ManagedUserResponse } from '#/integrations/response'

/**
 * `sortKey` só onde o backend ordena - o `paginate` de usuários aceita `name`,
 * `email`, `role` e `createdAt`. Oferecer a ordem em outra coluna viraria 422 ao
 * primeiro clique no cabeçalho.
 */
export const userColumns: TableColumns<ManagedUserResponse> = [
  {
    accessorKey: 'name',
    meta: { label: 'Usuário' },
    size: 250,
    header: ({ column }) => (
      <TableColumnHeader sortKey="name" column={column}>
        Usuário
      </TableColumnHeader>
    ),
    // A foto acompanha o nome na mesma célula: uma coluna só para o avatar
    // deixaria a tabela mais larga sem dizer nada a mais, e `?sort=avatarId`
    // não existe no backend.
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarImage src={row.original.avatar?.url} alt="" />
          <AvatarFallback className="bg-brand text-brand-ink text-xs font-semibold">
            {initials(row.original.name)}
          </AvatarFallback>
        </Avatar>
        <span className="truncate leading-none font-medium">
          {row.original.name}
        </span>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    meta: { label: 'E-mail' },
    size: 270,
    header: ({ column }) => (
      <TableColumnHeader sortKey="email" column={column}>
        E-mail
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground block truncate">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: 'role',
    meta: { label: 'Papel' },
    size: 150,
    header: ({ column }) => (
      <TableColumnHeader sortKey="role" column={column}>
        Papel
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <Badge variant={USER_ROLE_VARIANTS[row.original.role]}>
        {USER_ROLE_LABELS[row.original.role]}
      </Badge>
    ),
  },
  {
    accessorKey: 'status',
    meta: { label: 'Situação' },
    size: 130,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Situação</TableColumnHeader>
    ),
    cell: ({ row }) => (
      <Badge variant={ACTIVE_STATUS_VARIANTS[row.original.status]}>
        {ACTIVE_STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: 'invitedAt',
    meta: { label: 'Acesso' },
    size: 150,
    header: ({ column }) => (
      <TableColumnHeader column={column}>Acesso</TableColumnHeader>
    ),
    // Três estados, e a diferença importa para quem atende no telefone: quem
    // nunca foi convidado, quem foi e ainda não entrou, e quem já usa a conta.
    cell: ({ row }) => <AccessCell user={row.original} />,
  },
  {
    accessorKey: 'createdAt',
    meta: { label: 'Criado em' },
    size: 130,
    header: ({ column }) => (
      <TableColumnHeader sortKey="createdAt" column={column}>
        Criado em
      </TableColumnHeader>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
]

function AccessCell({ user }: { user: ManagedUserResponse }) {
  if (user.emailVerifiedAt !== null) {
    return <Badge variant="success">Ativo</Badge>
  }

  if (user.invitedAt !== null) {
    return <Badge variant="warning">Convite pendente</Badge>
  }

  return <Badge variant="neutral">Sem convite</Badge>
}
