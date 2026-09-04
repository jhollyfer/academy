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
import { partnerQueryOptions } from '#/integrations/tanstack-query/queries'
import {
  usePartnerArchive,
  usePartnerDelete,
  usePartnerUnarchive,
} from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { ACTIVE_STATUS_LABELS, ACTIVE_STATUS_VARIANTS } from '#/lib/labels'

const route = getRouteApi('/_private/administrator/partners/$id/')

export function PartnerDetail(): React.JSX.Element {
  const { id } = route.useParams()
  const { queryClient, account } = route.useRouteContext()
  const canDelete = account.role === UserRoles.OWNER
  const router = useRouter()

  const { data: partner } = useSuspenseQuery(partnerQueryOptions(id))

  async function invalidate(): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: queryKeys.partners.all })
  }

  const archive = usePartnerArchive({
    onError: (error) => toast.error(error.message, { id: 'partner-archive' }),
    onSuccess: invalidate,
  })
  const unarchive = usePartnerUnarchive({
    onError: (error) => toast.error(error.message, { id: 'partner-archive' }),
    onSuccess: invalidate,
  })
  const remove = usePartnerDelete({
    onError: (error) => toast.error(error.message, { id: 'partner-delete' }),
    async onSuccess() {
      await invalidate()
      // O registro não existe mais: ficar na tela dele daria 404 no próximo
      // refetch.
      router.navigate({ to: '/administrator/partners' })
    },
  })

  const label = ACTIVE_STATUS_LABELS[partner.status] ?? partner.status
  const variant = ACTIVE_STATUS_VARIANTS[partner.status]

  return (
    <PageShell>
      <PageShellHeader>
        <PageHeader>
          <PageHeaderBack to="/administrator/partners" />
          <PageHeaderTitle>{partner.name}</PageHeaderTitle>
          <PageHeaderBadges>
            <Badge variant={variant}>{label}</Badge>
            {partner.deletedAt && <Badge variant="neutral">Arquivado</Badge>}
          </PageHeaderBadges>
          <PageHeaderDescription>{partner.role}</PageHeaderDescription>
          <PageHeaderActions>
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  to="/administrator/partners/$id/edit"
                  params={{ id: partner.id }}
                >
                  <PencilSimpleIcon />
                  Editar
                </Link>
              }
            />

            {!partner.deletedAt && (
              <ConfirmDialog
                onConfirm={() => archive.mutate(partner.id)}
                trigger={
                  <Button variant="outline">
                    <ArchiveIcon />
                    Arquivar
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Arquivar "${partner.name}"?`}</ConfirmDialogTitle>
                  <ConfirmDialogDescription>
                    O parceiro sai da faixa da home e da listagem, e dá para
                    restaurar depois.
                  </ConfirmDialogDescription>
                </ConfirmDialogHeader>
                <ConfirmDialogFooter>
                  <ConfirmDialogCancel />
                  <ConfirmDialogConfirm>Arquivar</ConfirmDialogConfirm>
                </ConfirmDialogFooter>
              </ConfirmDialog>
            )}

            {partner.deletedAt && (
              <ConfirmDialog
                onConfirm={() => unarchive.mutate(partner.id)}
                trigger={
                  <Button variant="outline">
                    <ArrowCounterClockwiseIcon />
                    Restaurar
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Restaurar "${partner.name}"?`}</ConfirmDialogTitle>
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

            {partner.deletedAt && canDelete && (
              <ConfirmDialog
                destructive
                onConfirm={() => remove.mutate(partner.id)}
                trigger={
                  <Button variant="outline">
                    <TrashIcon />
                    Remover
                  </Button>
                }
              >
                <ConfirmDialogHeader>
                  <ConfirmDialogTitle>{`Remover "${partner.name}"?`}</ConfirmDialogTitle>
                  <ConfirmDialogDescription>
                    O registro é apagado de vez. A logomarca continua em
                    Arquivos, para ser apagada de lá se ninguém mais a usar.
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
              <CardTitle>Na vitrine</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground text-xs">
                    O que faz pela escola
                  </dt>
                  <dd className="mt-1">{partner.role}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Posição</dt>
                  <dd className="mt-1 tabular-nums">{partner.position}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">Site</dt>
                  <dd className="mt-1">
                    {partner.url && (
                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4"
                      >
                        {partner.url}
                      </a>
                    )}
                    {/* Hífen e não "sem site": o campo é opcional, e a
                        ausência não é informação sobre a instituição. */}
                    {!partner.url && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logomarca</CardTitle>
            </CardHeader>
            <CardContent>
              {partner.logo?.url && (
                <img
                  src={partner.logo.url}
                  alt={`Logomarca de ${partner.name}`}
                  className="bg-muted max-h-40 rounded-md object-contain p-4"
                />
              )}
              {!partner.logo?.url && (
                <p className="text-muted-foreground text-body-sm">
                  Sem logomarca. A faixa da home mostra o nome da instituição no
                  lugar dela.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </PageShellContent>
    </PageShell>
  )
}
