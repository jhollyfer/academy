import type * as React from 'react'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  classesListQueryOptions,
  enrollmentsListQueryOptions,
} from '#/integrations/tanstack-query/queries'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent } from '#/components/ui/card'
import { Empty, EmptyDescription, EmptyTitle } from '#/components/ui/empty'
import { Progress } from '#/components/ui/progress'
import { formatDate } from '#/lib/format'
import { ClassStatuses, EnrollmentStatuses } from '#/lib/entity'
import type { EnrollmentStatus } from '#/lib/entity'

export const Route = createLazyFileRoute('/_private/admin/')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  const { data: classes } = useSuspenseQuery(
    classesListQueryOptions({ perPage: 100 }),
  )
  const { data: enrollments } = useSuspenseQuery(
    enrollmentsListQueryOptions({ perPage: 100 }),
  )

  const rows = enrollments.data

  // O funil, contado no cliente sobre o que já veio. Um endpoint de métricas
  // seria a resposta certa se a escala pedisse; com uma turma de quarenta, ele
  // seria uma rota a mais para somar quatro números que já estão na memória.
  const counts = {
    pending: rows.filter((row) => row.status === EnrollmentStatuses.PENDING)
      .length,
    confirmed: rows.filter((row) => row.status === EnrollmentStatuses.CONFIRMED)
      .length,
    waitlist: rows.filter((row) => row.status === EnrollmentStatuses.WAITLIST)
      .length,
  }

  const open = classes.data.filter(
    (entity) => entity.status !== ClassStatuses.CLOSED,
  )

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Onde estão as matrículas e quanto falta encher cada turma.
        </p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Aguardando conferência"
          value={counts.pending}
          hint="Comprovante para olhar"
          to={{ status: EnrollmentStatuses.PENDING }}
        />
        <Stat
          label="Confirmadas"
          value={counts.confirmed}
          hint="Vaga garantida"
          to={{ status: EnrollmentStatuses.CONFIRMED }}
        />
        <Stat
          label="Fila de espera"
          value={counts.waitlist}
          hint="Entram se abrir vaga"
          to={{ status: EnrollmentStatuses.WAITLIST }}
        />
      </dl>

      <section>
        <h2 className="font-semibold">Ocupação das turmas</h2>

        {open.length === 0 && (
          <Empty className="mt-3 border">
            <EmptyTitle>Nenhuma turma aberta</EmptyTitle>
            <EmptyDescription>
              Sem turma, o site não tem o que oferecer na matrícula.
            </EmptyDescription>
          </Empty>
        )}

        <ul className="mt-4 grid gap-3">
          {open.map((entity) => {
            const taken = entity.seatsTaken ?? 0
            const percent = Math.round((taken / entity.capacity) * 100)

            return (
              <li key={entity.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link
                        to="/admin/turmas/$id"
                        params={{ id: entity.id }}
                        className="font-medium hover:underline"
                      >
                        {entity.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {entity.course?.name} · começa em{' '}
                        {formatDate(entity.startsAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm tabular-nums">
                        {taken} de {entity.capacity}
                      </span>
                      {entity.status === ClassStatuses.FULL && (
                        <Badge variant="secondary">Lotada</Badge>
                      )}
                    </div>
                  </CardContent>

                  {/*
                  `Progress` do registry, e não a barra montada à mão que estava
                  aqui: ela já traz o trilho, o indicador e o `aria-valuenow`
                  que a barra manual não tinha - o rótulo `role="img"` era o
                  remendo para isso.
                */}
                  <CardContent>
                    <Progress
                      value={percent}
                      aria-label={`${percent}% das vagas ocupadas`}
                    />
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
  to,
}: {
  label: string
  value: number
  hint: string
  to: { status: EnrollmentStatus }
}): React.JSX.Element {
  return (
    <Card>
      {/*
        O número é um link para a listagem já filtrada: ver "3 aguardando" e ter
        que ir até Matrículas e filtrar à mão é o atrito que faz ninguém usar o
        painel.
      */}
      <CardContent>
        <Link to="/admin/matriculas" search={to} className="block">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-3xl font-semibold tabular-nums">{value}</dd>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </Link>
      </CardContent>
    </Card>
  )
}
