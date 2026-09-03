import { getRouteApi, Link } from '@tanstack/react-router'
import type * as React from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowLeft, PencilSimpleIcon } from '@phosphor-icons/react'

import { Button } from '#/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { UserRoles } from '#/lib/entity'
import { userQueryOptions } from '#/integrations/tanstack-query/queries'
import {
  ACCOUNT_STATUS_LABELS,
  ACTIVE_STATUS_VARIANTS,
  USER_ROLE_LABELS,
  USER_ROLE_VARIANTS,
  initials,
} from '#/lib/labels'
import { formatDate, formatPhone } from '#/lib/format'
import type { AccountResponse } from '#/integrations/response'

const route = getRouteApi('/_private/administrator/users/$id/')

/**
 * A ficha da conta.
 *
 * Mostra os dois lados do vínculo de guarda porque é a única tela onde eles
 * aparecem: a listagem não tem largura para isso, e é aqui que a secretaria
 * confere quem responde por quem antes de atender no telefone.
 */
export function UserDetail(): React.JSX.Element {
  const { id } = route.useParams()
  const { data: user } = useSuspenseQuery(userQueryOptions(id))

  // O dono não é editável - a `UserPolicy` recusa, e a tela não oferece o botão
  // para não prometer o que a API nega.
  const editable = user.role !== UserRoles.OWNER

  return (
    <div className="grid gap-8">
      <div>
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link to="/administrator/users" />}
        >
          <ArrowLeft />
          Usuários
        </Button>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={user.avatar?.url} alt="" />
            <AvatarFallback className="bg-brand text-brand-ink font-semibold">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={USER_ROLE_VARIANTS[user.role]}>
                {USER_ROLE_LABELS[user.role]}
              </Badge>
              <Badge variant={ACTIVE_STATUS_VARIANTS[user.status]}>
                {ACCOUNT_STATUS_LABELS[user.status]}
              </Badge>
            </div>
          </div>
        </div>

        {editable && (
          <Button
            nativeButton={false}
            render={
              <Link to="/administrator/users/$id/edit" params={{ id }} />
            }
          >
            <PencilSimpleIcon />
            Editar
          </Button>
        )}
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Row label="E-mail">{user.email}</Row>
            <Row label="Telefone">{formatPhone(user.phone)}</Row>
            <Row label="Cadastro">{formatDate(user.createdAt)}</Row>
            <Row label="Acesso">
              <AccessState user={user} />
            </Row>
          </dl>
        </CardContent>
      </Card>

      {/* Os dois blocos aparecem só quando têm conteúdo: um responsável não tem
          responsáveis, e um administrador não tem nenhum dos dois. Cabeçalho
          vazio ocuparia a tela afirmando que falta preencher algo. */}
      {user.responsibles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <PeopleList people={user.responsibles} />
          </CardContent>
        </Card>
      )}

      {user.dependents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dependentes</CardTitle>
          </CardHeader>
          <CardContent>
            <PeopleList people={user.dependents} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Os três estados do acesso.
 *
 * A diferença entre "convite pendente" e "sem convite" é o que a secretaria
 * precisa saber ao atender: no primeiro caso o link já saiu e a pessoa não
 * clicou; no segundo, ninguém o enviou ainda.
 */
function AccessState({
  user,
}: {
  user: { invitedAt: string | null; emailVerifiedAt: string | null }
}): React.JSX.Element {
  if (user.emailVerifiedAt !== null) {
    return <Badge variant="success">Ativo</Badge>
  }

  if (user.invitedAt !== null) {
    return <Badge variant="warning">Convite pendente</Badge>
  }

  return <Badge variant="neutral">Sem convite</Badge>
}

function PeopleList({
  people,
}: {
  people: Array<AccountResponse>
}): React.JSX.Element {
  return (
    <ul className="flex flex-col gap-2">
      {people.map((person) => (
        <li key={person.id}>
          <Link
            to="/administrator/users/$id"
            params={{ id: person.id }}
            className="hover:bg-muted flex items-center gap-2.5 rounded-md p-2"
          >
            <Avatar className="size-8">
              <AvatarImage src={person.avatar?.url} alt="" />
              <AvatarFallback className="bg-brand text-brand-ink text-xs font-semibold">
                {initials(person.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">
                {person.name}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {person.email}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
