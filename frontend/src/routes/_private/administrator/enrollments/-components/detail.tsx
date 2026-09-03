import * as React from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, FileArrowDown } from '@phosphor-icons/react'
import { enrollmentQueryOptions } from '#/integrations/tanstack-query/queries'
import { useEnrollmentUpdate } from '#/integrations/tanstack-query/mutations'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Empty, EmptyDescription, EmptyTitle } from '#/components/ui/empty'
import { Textarea } from '#/components/ui/textarea'
import {
  ConfirmDialog,
  ConfirmDialogCancel,
  ConfirmDialogConfirm,
  ConfirmDialogDescription,
  ConfirmDialogFooter,
  ConfirmDialogHeader,
  ConfirmDialogTitle,
} from '#/components/common/confirm-dialog'
import { formatCpf, formatDate, formatPhone } from '#/lib/format'
import { ENROLLMENT_TRANSITIONS, EnrollmentStatuses } from '#/lib/entity'
import {
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_STATUS_VARIANTS,
} from '#/lib/labels'
import type { EnrollmentStatus } from '#/lib/entity'

const route = getRouteApi('/_private/administrator/enrollments/$id/')

/**
 * O verbo de cada transição, e só ele.
 *
 * O rótulo e a cor saem de `lib/labels.ts`, com o resto do painel: aqui ficava
 * uma terceira cópia de "Aguardando/Confirmada/..." e das variantes do `Badge`,
 * e três cópias divergem no primeiro estado novo.
 *
 * O que sobra é o que só existe nesta tela: o texto do **botão**. "Confirmar
 * matrícula", não "Mudar para CONFIRMED" - a secretaria pensa na ação, não na
 * máquina de estados.
 */
const ENROLLMENT_ACTIONS: Record<EnrollmentStatus, string> = {
  PENDING: 'Voltar para aguardando',
  CONFIRMED: 'Confirmar matrícula',
  WAITLIST: 'Mandar para a fila',
  CANCELLED: 'Cancelar matrícula',
}

/** Cancelar não pode parecer a ação principal, mesmo sendo a única disponível. */
function triggerVariant(status: EnrollmentStatus): 'outline' | 'default' {
  if (status === EnrollmentStatuses.CANCELLED) return 'outline'

  return 'default'
}

export function EnrollmentDetail(): React.JSX.Element {
  const { id } = route.useParams()
  const { data: enrollment } = useSuspenseQuery(enrollmentQueryOptions(id))
  const queryClient = useQueryClient()

  const [notes, setNotes] = React.useState(enrollment.notes ?? '')

  const mutation = useEnrollmentUpdate(id, {
    onSuccess: async function () {
      toast.success('Matrícula atualizada')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.all,
      })
      // A turma também muda: confirmar ou cancelar mexe na ocupação.
      await queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
    },
    // O 409 de comprovante ausente e o de transição inválida chegam aqui. A
    // mensagem do servidor já diz o que fazer.
    onError: (error) => toast.error(error.message),
  })

  // Só as transições que o servidor aceita viram botão. Mostrar as outras seria
  // oferecer um clique que sempre dá 409.
  const allowed = ENROLLMENT_TRANSITIONS[enrollment.status]
  const receipt = (enrollment.files ?? []).at(-1)

  return (
    <div className="grid gap-8">
      <div>
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link to="/administrator/enrollments" />}
        >
          <ArrowLeft />
          Matrículas
        </Button>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {enrollment.studentName}
          </h1>
          <Badge variant={ENROLLMENT_STATUS_VARIANTS[enrollment.status]}>
            {ENROLLMENT_STATUS_LABELS[enrollment.status] ?? enrollment.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-8">
          <Card className="[--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle render={<h2 />} className="text-base font-semibold">
                Dados enviados
              </CardTitle>
              <CardDescription className="text-sm">
                Como o candidato preencheu. O painel não edita: os dados são
                dele.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Row label="Curso">{enrollment.class?.course?.name ?? '-'}</Row>
                <Row label="Turma">{enrollment.class?.name ?? '-'}</Row>
                <Row label="Nascimento">
                  {formatDate(enrollment.studentBirthDate)} (
                  {enrollment.ageAtEnrollment} anos na inscrição)
                </Row>
                <Row label="CPF">{formatCpf(enrollment.studentDocument)}</Row>
                <Row label="E-mail">{enrollment.email}</Row>
                <Row label="Telefone">{formatPhone(enrollment.phone)}</Row>
              </dl>

              {enrollment.requiresGuardian && (
                <>
                  <h3 className="mt-8 font-medium">Responsável legal</h3>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Row label="Nome">{enrollment.guardianName ?? '-'}</Row>
                    <Row label="CPF">
                      {formatCpf(enrollment.guardianDocument)}
                    </Row>
                    <Row label="Telefone">
                      {formatPhone(enrollment.guardianPhone)}
                    </Row>
                  </dl>
                </>
              )}

              <dl className="mt-8 grid gap-4 border-t pt-6 sm:grid-cols-2">
                <Row label="Protocolo">
                  <span className="font-mono text-xs break-all">
                    {enrollment.protocol}
                  </span>
                </Row>
                <Row label="Consentimento LGPD">
                  {formatDate(enrollment.lgpdConsentAt)}
                </Row>
              </dl>
            </CardContent>
          </Card>

          <Card className="[--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle render={<h2 />} className="text-base font-semibold">
                Comprovante do Pix
              </CardTitle>
            </CardHeader>

            <CardContent>
              {!receipt && (
                <Empty className="border">
                  <EmptyTitle>Ainda não enviado</EmptyTitle>
                  <EmptyDescription>
                    Sem ele, a confirmação é recusada.
                  </EmptyDescription>
                </Empty>
              )}

              {receipt?.storage && (
                <div className="mt-4 grid gap-4">
                  <p className="text-sm text-muted-foreground">
                    Enviado em {formatDate(receipt.createdAt)}.{' '}
                    {receipt.storage.originalName}
                  </p>

                  {/*
                  Imagem aparece inline; PDF vira link. É a diferença entre a
                  secretaria conferir num olhar e ter que baixar um arquivo para
                  cada matrícula da fila.
                */}
                  {receipt.storage.mimetype.startsWith('image/') && (
                    <img
                      src={receipt.storage.url}
                      alt={`Comprovante enviado por ${enrollment.studentName}`}
                      className="max-h-[420px] w-fit rounded-md border object-contain"
                    />
                  )}

                  <Button
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    render={
                      <a
                        href={receipt.storage.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileArrowDown />
                        Abrir arquivo
                      </a>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 self-start">
          <Card className="[--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle render={<h2 />} className="text-base font-semibold">
                Situação
              </CardTitle>
            </CardHeader>

            <CardContent>
              {allowed.length === 0 && (
                <Empty className="border">
                  <EmptyTitle>Estado final</EmptyTitle>
                  <EmptyDescription>Não há para onde mover.</EmptyDescription>
                </Empty>
              )}

              <div className="mt-4 grid gap-2">
                {allowed.map((status) => (
                  <ConfirmDialog
                    key={status}
                    trigger={
                      <Button
                        variant={triggerVariant(status)}
                        disabled={mutation.isPending}
                        className="w-full justify-start"
                      >
                        {ENROLLMENT_ACTIONS[status]}
                      </Button>
                    }
                    onConfirm={() => mutation.mutate({ status })}
                    destructive={status === EnrollmentStatuses.CANCELLED}
                  >
                    <ConfirmDialogHeader>
                      <ConfirmDialogTitle>
                        {ENROLLMENT_ACTIONS[status]}: {enrollment.studentName}?
                      </ConfirmDialogTitle>
                      <ConfirmDialogDescription>
                        {status === EnrollmentStatuses.CONFIRMED &&
                          'Confirme só depois de ver o comprovante. A vaga passa a ser dela.'}
                        {status === EnrollmentStatuses.CANCELLED &&
                          'A vaga volta para a turma e o candidato deixa de ocupá-la.'}
                        {status === EnrollmentStatuses.PENDING &&
                          'A matrícula volta a ocupar vaga e aguarda conferência.'}
                        {status === EnrollmentStatuses.WAITLIST &&
                          'A matrícula deixa de ocupar vaga e entra na fila.'}
                      </ConfirmDialogDescription>
                    </ConfirmDialogHeader>
                    <ConfirmDialogFooter>
                      <ConfirmDialogCancel />
                      <ConfirmDialogConfirm>
                        {ENROLLMENT_ACTIONS[status]}
                      </ConfirmDialogConfirm>
                    </ConfirmDialogFooter>
                  </ConfirmDialog>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="[--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle render={<h2 />} className="text-base font-semibold">
                Anotação interna
              </CardTitle>
              <CardDescription className="text-sm">
                Só a secretaria vê. Não aparece para o candidato.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                aria-label="Anotação interna"
              />

              <Button
                size="sm"
                className="mt-3"
                disabled={
                  mutation.isPending || notes === (enrollment.notes ?? '')
                }
                onClick={() => mutation.mutate({ notes: notes || null })}
              >
                Salvar anotação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
