import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { portalEnrollmentsQueryOptions } from '#/integrations/tanstack-query/queries'
import { ENROLLMENT_STATUS_LABELS, ENROLLMENT_STATUS_VARIANTS } from '#/lib/labels'
import { Badge } from '#/components/ui/badge'

export const Route = createLazyFileRoute('/_private/portal/')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  const { data } = useQuery(portalEnrollmentsQueryOptions())
  const enrollments = data?.data ?? []

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Minhas matrículas</h1>
        <p className="text-muted-foreground text-sm">
          O acompanhamento das matrículas ligadas à sua conta.
        </p>
      </header>

      {enrollments.length === 0 && (
        // O estado vazio é comum e não é erro: a conta nasce na confirmação, e
        // quem chega aqui logo depois pode não ter nada ainda ligado a ela.
        <p className="text-muted-foreground text-sm">
          Nenhuma matrícula ligada a esta conta ainda.
        </p>
      )}

      {enrollments.length > 0 && (
        <ul className="flex flex-col gap-3">
          {enrollments.map((enrollment) => (
            <li
              key={enrollment.id}
              className="border-border flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{enrollment.studentName}</span>
                <span className="text-muted-foreground text-sm">
                  Protocolo {enrollment.protocol}
                </span>
              </div>
              <Badge variant={ENROLLMENT_STATUS_VARIANTS[enrollment.status]}>
                {ENROLLMENT_STATUS_LABELS[enrollment.status]}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
