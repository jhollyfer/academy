import { getRouteApi, Link, useRouter } from '@tanstack/react-router'
import type * as React from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  ArchiveIcon,
  ArrowCounterClockwiseIcon,
  PencilSimpleIcon,
  TrashIcon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderBadges,
  PageHeaderDescription,
  PageHeaderTitle,
  PageShell,
  PageShellContent,
  PageShellHeader,
} from '#/components/common/page-shell'
import { Badge } from '#/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  ConfirmDialog,
  ConfirmDialogCancel,
  ConfirmDialogConfirm,
  ConfirmDialogDescription,
  ConfirmDialogFooter,
  ConfirmDialogHeader,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { UserRoles } from '#/lib/entity'
import { classQueryOptions } from '#/integrations/tanstack-query/queries'
import {
  useClassArchive,
  useClassDelete,
  useClassUnarchive,
} from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import {
  CLASS_STATUS_LABELS,
  CLASS_STATUS_VARIANTS,
  SHIFT_LABELS,
  WEEKDAY_LABELS,
} from '#/lib/labels'
import { formatDate } from '#/lib/format'
import { formatTimeRange } from '#/lib/enrollment-state'

const route = getRouteApi('/_private/administrator/classes/$id/')

export function ClassDetail(): React.JSX.Element {
  const { id } = route.useParams()
  const { queryClient, account } = route.useRouteContext()
  const canDelete = account.role === UserRoles.OWNER
  const router = useRouter()

  const { data: entity } = useSuspenseQuery(classQueryOptions(id))

  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
  }

  const archive = useClassArchive({
    onError: (error) => toast.error(error.message, { id: 'class-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = useClassUnarchive({
    onError: (error) => toast.error(error.message, { id: 'class-archive' }),
    onSuccess: invalidate,
  })
  const remove = useClassDelete({
    onError: (error) => toast.error(error.message, { id: 'class-delete' }),
    async onSuccess() {
      await invalidate()
      router.navigate({ to: '/administrator/classes' })
    },
  })

  const label = CLASS_STATUS_LABELS[entity.status] ?? entity.status
  const variant = CLASS_STATUS_VARIANTS[entity.status]
  const weekday = WEEKDAY_LABELS[entity.weekday] ?? entity.weekday
  const shift = SHIFT_LABELS[entity.shift] ?? entity.shift
  const time = formatTimeRange(entity.startsAtTime, entity.endsAtTime)

  return (
    <PageShell>
      <PageShellHeader>
        <PageHeader>
          <PageHeaderBack to="/administrator/classes" />
          <PageHeaderTitle>{entity.name}</PageHeaderTitle>
          <PageHeaderBadges>
            <Badge variant={variant}>{label}</Badge>
            {entity.deletedAt && <Badge variant="neutral">Arquivada</Badge>}
          </PageHeaderBadges>
          <PageHeaderDescription>
            {entity.course?.name ?? 'Curso não carregado'}
          </PageHeaderDescription>
          <PageHeaderActions>
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  to="/administrator/classes/$id/edit"
                  params={{ id: entity.id }}
                >
                  <PencilSimpleIcon />
                  Editar
                </Link>
              }
            />

            {!entity.deletedAt && (
              <ConfirmDialog
                onConfirm={() => archive.mutate(entity.id)}
                trigger={
                  <Button variant="outline">
                    <ArchiveIcon />
                    Arquivar
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Arquivar "${entity.name}"?`}</ConfirmDialogTitle>
                  <ConfirmDialogDescription>
                    A turma sai da listagem e da matrícula do site. As
                    matrículas já feitas continuam onde estão.
                  </ConfirmDialogDescription>
                </ConfirmDialogHeader>
                <ConfirmDialogFooter>
                  <ConfirmDialogCancel />
                  <ConfirmDialogConfirm>Arquivar</ConfirmDialogConfirm>
                </ConfirmDialogFooter>
              </ConfirmDialog>
            )}

            {entity.deletedAt && (
              <ConfirmDialog
                onConfirm={() => unarchive.mutate(entity.id)}
                trigger={
                  <Button variant="outline">
                    <ArrowCounterClockwiseIcon />
                    Restaurar
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Restaurar "${entity.name}"?`}</ConfirmDialogTitle>
                  <ConfirmDialogDescription>
                    Ela volta para a listagem, na situação em que estava.
                  </ConfirmDialogDescription>
                </ConfirmDialogHeader>
                <ConfirmDialogFooter>
                  <ConfirmDialogCancel />
                  <ConfirmDialogConfirm>Restaurar</ConfirmDialogConfirm>
                </ConfirmDialogFooter>
              </ConfirmDialog>
            )}

            {entity.deletedAt && canDelete && (
              <ConfirmDialog
                destructive
                onConfirm={() => remove.mutate(entity.id)}
                trigger={
                  <Button variant="outline">
                    <TrashIcon />
                    Remover
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Remover "${entity.name}"?`}</ConfirmDialogTitle>
                  <ConfirmDialogDescription>
                    O registro é apagado de vez. Não dá para desfazer, e só
                    funciona em turma sem matrícula.
                  </ConfirmDialogDescription>
                </ConfirmDialogHeader>
                <ConfirmDialogFooter>
                  <ConfirmDialogCancel />
                  <ConfirmDialogConfirm>Remover</ConfirmDialogConfirm>
                </ConfirmDialogFooter>
              </ConfirmDialog>
            )}
          </PageHeaderActions>
        </PageHeader>
      </PageShellHeader>

      <PageShellContent>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quando</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Fact label="Primeira aula">{formatDate(entity.startsAt)}</Fact>
              <Fact label="Última aula">{lastLesson(entity.endsAt)}</Fact>
              <Fact label="Dia">{weekday}</Fact>
              <Fact label="Turno">{shift}</Fact>
              <Fact label="Horário">{time || 'A definir'}</Fact>
              <Fact label="Local">{entity.location}</Fact>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vagas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Fact label="Capacidade">{entity.capacity}</Fact>
              <Fact label="Restantes">
                {/* Ausente e zero não são a mesma coisa: o hífen diz "a leitura
                    não contou", e não "acabaram as vagas". */}
                {entity.seatsRemaining ?? '-'}
              </Fact>
            </CardContent>
          </Card>
        </div>
      </PageShellContent>
    </PageShell>
  )
}

/**
 * A data da última aula, ou o texto de quando ela não foi definida.
 *
 * Função e não ternário no JSX: a regra `no-ternary` do `eslint.config.js` o
 * proíbe, e a razão aparece aqui - "Em aberto" é uma decisão de produto (a
 * turma sem data de término é normal, não um dado faltando), e ela merece um
 * nome em vez de ficar escondida depois de dois-pontos.
 */
function lastLesson(endsAt: string | null): string {
  if (!endsAt) return 'Em aberto'

  return formatDate(endsAt)
}

/** Rótulo e valor, do jeito que os pares de "Quando" e "Vagas" repetem. */
function Fact({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="grid gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}
