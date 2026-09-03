import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  EnvelopeSimple,
  IdentificationCard,
  PencilSimple,
  Phone,
  ShieldCheck,
} from '@phosphor-icons/react'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  PageShell,
  PageShellContent,
  PageShellHeader,
} from '#/components/common/page-shell'
import {
  ACCOUNT_STATUS_LABELS,
  ACTIVE_STATUS_VARIANTS,
  USER_ROLE_LABELS,
  USER_ROLE_VARIANTS,
  initials,
} from '#/lib/labels'
import { formatDate } from '#/lib/format'
import { accountQueryOptions } from '#/integrations/tanstack-query/queries'

/**
 * A ficha da própria conta.
 *
 * Papel e situação aparecem aqui e **não** no formulário, e é a mesma razão de
 * o `PUT /account` não os aceitar: o papel é decisão de quem cria a conta, e
 * ninguém se inativa. São dados a ler, não campos a preencher.
 */
export function Profile(): React.JSX.Element {
  // O `loader` da rota já garantiu o dado; aqui é leitura de cache.
  const { data: account } = useSuspenseQuery(accountQueryOptions())

  return (
    <PageShell>
      {/* `PageShellHeader` cru, e não `PageHeader`: o cabeçalho do perfil abre
          com o avatar, e não com um título - é o caso para o qual o slot existe
          separado do componente de título. */}
      <PageShellHeader>
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={account.avatar?.url ?? undefined} alt="" />
            <AvatarFallback className="font-semibold">
              {initials(account.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold">{account.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {/* O `??` cobre um papel ou uma situação nova do backend chegando
                  aqui antes de esta tela saber dela: melhor imprimir o valor
                  cru do que um badge vazio. */}
              <Badge variant={USER_ROLE_VARIANTS[account.role]}>
                {USER_ROLE_LABELS[account.role] ?? account.role}
              </Badge>
              <Badge variant={ACTIVE_STATUS_VARIANTS[account.status]}>
                {ACCOUNT_STATUS_LABELS[account.status] ?? account.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                No painel desde {formatDate(account.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <Button
          render={
            <Link to="/profile/edit">
              <PencilSimple />
              Editar perfil
            </Link>
          }
        />
      </PageShellHeader>

      <PageShellContent>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IdentificationCard />
              Identidade e acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Detail icon={<IdentificationCard />} label="Nome">
              {account.name}
            </Detail>
            <Detail icon={<EnvelopeSimple />} label="E-mail">
              {account.email}
            </Detail>
            <Detail icon={<Phone />} label="Telefone">
              {account.phone ?? 'Não informado'}
            </Detail>
            {/* A senha não se mostra, nem mascarada: um "••••••••" sugere que o
                painel a conhece, e ele não conhece - o backend guarda o hash. O
                que dá para dizer é onde trocá-la. */}
            <Detail icon={<ShieldCheck />} label="Senha">
              <Link
                to="/profile/edit"
                className="text-primary underline-offset-4 hover:underline"
              >
                Trocar senha
              </Link>
            </Detail>
          </CardContent>
        </Card>
      </PageShellContent>
    </PageShell>
  )
}

type DetailProps = {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

function Detail({ icon, label, children }: DetailProps): React.JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm">{children}</span>
      </div>
    </div>
  )
}
