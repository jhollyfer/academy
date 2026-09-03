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
import { courseQueryOptions } from '#/integrations/tanstack-query/queries'
import {
  useCourseArchive,
  useCourseDelete,
  useCourseUnarchive,
} from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import {
  ACTIVE_STATUS_LABELS,
  ACTIVE_STATUS_VARIANTS,
  COURSE_ACCENT_LABELS,
} from '#/lib/labels'
import { formatMoney } from '#/lib/format'

const route = getRouteApi('/_private/administrator/courses/$id/')

export function CourseDetail(): React.JSX.Element {
  const { id } = route.useParams()
  // O client vem do contexto do router, que é onde `query-context.ts` o
  // coloca - o mesmo que os `loader` usam. `useQueryClient()` pediria de novo
  // o que a rota já entrega.
  const { queryClient, account } = route.useRouteContext()
  // Só o dono apaga de vez. Ver o comentário na listagem.
  const canDelete = account.role === UserRoles.OWNER
  const router = useRouter()

  const { data: course } = useSuspenseQuery(courseQueryOptions(id))

  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.courses.all })
  }

  const archive = useCourseArchive({
    onError: (error) => toast.error(error.message, { id: 'course-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = useCourseUnarchive({
    onError: (error) => toast.error(error.message, { id: 'course-archive' }),
    onSuccess: invalidate,
  })
  const remove = useCourseDelete({
    onError: (error) => toast.error(error.message, { id: 'course-delete' }),
    async onSuccess() {
      await invalidate()
      // O registro não existe mais: ficar na tela dele daria 404 no próximo
      // refetch.
      router.navigate({ to: '/administrator/courses' })
    },
  })

  const label = ACTIVE_STATUS_LABELS[course.status] ?? course.status
  const variant = ACTIVE_STATUS_VARIANTS[course.status]
  const accent = COURSE_ACCENT_LABELS[course.accent] ?? course.accent
  const modules = course.modules ?? []
  const faqs = course.faqs ?? []

  return (
    <PageShell>
      <PageShellHeader>
        <PageHeader>
          <PageHeaderBack to="/administrator/courses" />
          <PageHeaderTitle>{course.name}</PageHeaderTitle>
          <PageHeaderBadges>
            <Badge variant={variant}>{label}</Badge>
            <Badge variant="neutral">{accent}</Badge>
            {course.deletedAt && <Badge variant="neutral">Arquivado</Badge>}
          </PageHeaderBadges>
          <PageHeaderDescription>{course.tagline}</PageHeaderDescription>
          <PageHeaderActions>
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  to="/administrator/courses/$id/edit"
                  params={{ id: course.id }}
                >
                  <PencilSimpleIcon />
                  Editar
                </Link>
              }
            />

            {!course.deletedAt && (
              <ConfirmDialog
                onConfirm={() => archive.mutate(course.id)}
                trigger={
                  <Button variant="outline">
                    <ArchiveIcon />
                    Arquivar
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Arquivar "${course.name}"?`}</ConfirmDialogTitle>
                  <ConfirmDialogDescription>
                    O curso sai da vitrine e da listagem. As turmas e as
                    matrículas continuam onde estão, e dá para restaurar depois.
                  </ConfirmDialogDescription>
                </ConfirmDialogHeader>
                <ConfirmDialogFooter>
                  <ConfirmDialogCancel />
                  <ConfirmDialogConfirm>Arquivar</ConfirmDialogConfirm>
                </ConfirmDialogFooter>
              </ConfirmDialog>
            )}

            {course.deletedAt && (
              <ConfirmDialog
                onConfirm={() => unarchive.mutate(course.id)}
                trigger={
                  <Button variant="outline">
                    <ArrowCounterClockwiseIcon />
                    Restaurar
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Restaurar "${course.name}"?`}</ConfirmDialogTitle>
                  <ConfirmDialogDescription>
                    Ele volta para a listagem, na situação em que estava.
                  </ConfirmDialogDescription>
                </ConfirmDialogHeader>
                <ConfirmDialogFooter>
                  <ConfirmDialogCancel />
                  <ConfirmDialogConfirm>Restaurar</ConfirmDialogConfirm>
                </ConfirmDialogFooter>
              </ConfirmDialog>
            )}

            {/* Apagar só no que já está arquivado e sem turma: o
                `delete.use-case.ts` recusa os dois casos. */}
            {course.deletedAt && canDelete && (
              <ConfirmDialog
                destructive
                onConfirm={() => remove.mutate(course.id)}
                trigger={
                  <Button variant="outline">
                    <TrashIcon />
                    Remover
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Remover "${course.name}"?`}</ConfirmDialogTitle>
                  <ConfirmDialogDescription>
                    O registro é apagado de vez, com a grade, o FAQ e a capa.
                    Não dá para desfazer.
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
              <CardTitle>Números</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Fact label="Carga horária">{course.workloadHours}h</Fact>
              <Fact label="Duração">{course.durationMonths} meses</Fact>
              <Fact label="Inscrição">
                {formatMoney(course.enrollmentFeeInCents)}
              </Fact>
              <Fact label="Mensalidade">
                {formatMoney(course.monthlyFeeInCents)}
              </Fact>
              <Fact label="Idade mínima">
                {course.minimumAge ?? 'Sem exigência'}
              </Fact>
              <Fact label="Turmas">{course.classesCount ?? '-'}</Fact>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm whitespace-pre-line">
              {course.description}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade</CardTitle>
            </CardHeader>
            <CardContent>
              {modules.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhum módulo cadastrado.
                </p>
              )}
              <ol className="grid gap-3">
                {modules.map((entry) => (
                  <li key={entry.id} className="grid gap-0.5">
                    <span className="text-sm font-medium">{entry.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {entry.description}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent>
              {faqs.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Nenhuma pergunta cadastrada.
                </p>
              )}
              <ol className="grid gap-3">
                {faqs.map((entry) => (
                  <li key={entry.id} className="grid gap-0.5">
                    <span className="text-sm font-medium">
                      {entry.question}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {entry.answer}
                    </span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </PageShellContent>
    </PageShell>
  )
}

/** Rótulo e valor, do jeito que os quatro pares de "Números" repetem. */
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
