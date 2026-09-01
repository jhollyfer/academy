import * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle, Copy, Hourglass, Warning } from '@phosphor-icons/react'
import { storefrontEnrollmentQueryOptions } from '#/integrations/tanstack-query/queries'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { Button } from '#/components/ui/button'
import { CircuitBackground } from '#/components/common/neon'
import { formatDate, formatMoney } from '#/lib/format'
import { EnrollmentStatuses } from '#/lib/entity'
import { Route as ProtocolRoute } from './$protocol'
import { ReceiptUpload } from './-components/receipt-upload'
import type { EnrollmentStatus } from '#/lib/entity'

export const Route = createLazyFileRoute('/_public/matricula/$protocol')({
  component: RouteComponent,
})

/**
 * O que cada estado significa **para o candidato**.
 *
 * Um mapa e não uma cadeia de `if`: são quatro estados, a pergunta "o que
 * mostro em CONFIRMED?" se responde lendo uma linha, e um estado novo entra sem
 * tocar em condição nenhuma.
 *
 * O texto é escrito do ponto de vista dele, não do banco: `PENDING` não é
 * "pendente", é "recebemos e estamos conferindo".
 */
const STATUS_VIEW: Record<
  EnrollmentStatus,
  { icon: React.ReactNode; title: string; description: string }
> = {
  PENDING: {
    icon: <Hourglass weight="fill" />,
    title: 'Matrícula recebida',
    description:
      'Sua vaga está reservada. Assim que a secretaria conferir o comprovante do Pix, ela confirma e avisa você.',
  },
  CONFIRMED: {
    icon: <CheckCircle weight="fill" />,
    title: 'Matrícula confirmada',
    description: 'Está tudo certo. Nos vemos no primeiro sábado de aula.',
  },
  WAITLIST: {
    icon: <Hourglass weight="fill" />,
    title: 'Você está na fila de espera',
    description:
      'A turma encheu antes do seu envio. Você não perdeu o lugar na fila: se abrir vaga, a secretaria chama pela ordem.',
  },
  CANCELLED: {
    icon: <Warning weight="fill" />,
    title: 'Matrícula cancelada',
    description: 'Se isso não era o esperado, fale com a secretaria pelo WhatsApp.',
  },
}

/**
 * A chave Pix da escola.
 *
 * TODO: trocar pela chave real antes de publicar. Enquanto for este valor, o
 * pagamento não chega em lugar nenhum.
 */
const PIX_KEY = '00.000.000/0001-00'

function RouteComponent(): React.JSX.Element {
  const { protocol } = ProtocolRoute.useParams()
  const { data: enrollment } = useSuspenseQuery(storefrontEnrollmentQueryOptions(protocol))
  const queryClient = useQueryClient()

  const view = STATUS_VIEW[enrollment.status]
  const course = enrollment.class?.course
  const hasReceipt = (enrollment.files ?? []).length > 0

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      toast.success('Chave Pix copiada')
    } catch {
      // `clipboard` falha sem HTTPS e em alguns navegadores embutidos. A chave
      // está visível na tela de qualquer forma, então o aviso diz o que fazer em
      // vez de só reclamar.
      toast.error('Não deu para copiar. Selecione a chave na tela e copie à mão.')
    }
  }

  return (
    <div className="relative">
      <CircuitBackground />

      <div className="relative mx-auto max-w-2xl px-4 py-16 lg:py-20">
        <div className="text-neon [&_svg]:size-10">{view.icon}</div>

        <h1 className="mt-5 font-display text-3xl leading-[1.05] font-extrabold tracking-tight italic sm:text-4xl">
          {view.title}
        </h1>
        <p className="mt-4 max-w-[52ch] leading-relaxed text-muted-foreground">
          {view.description}
        </p>

        {/*
          O protocolo em destaque e em `tabular-nums`: é o número que a pessoa
          vai ditar no WhatsApp, e dígito de largura variável se lê pior em voz
          alta.
        */}
        <div className="chamfer mt-10 border border-white/10 bg-card p-6">
          <p className="text-sm text-muted-foreground">Seu protocolo</p>
          <p className="mt-2 font-mono text-sm break-all tabular-nums">{enrollment.protocol}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            Guarde este endereço. É por ele que você acompanha a matrícula.
          </p>
        </div>

        {course && (
          <dl className="mt-8 grid gap-3 text-sm">
            <div className="grid grid-cols-[8rem_1fr] gap-3">
              <dt className="text-muted-foreground">Curso</dt>
              <dd>{course.name}</dd>
            </div>
            {enrollment.class && (
              <div className="grid grid-cols-[8rem_1fr] gap-3">
                <dt className="text-muted-foreground">Turma</dt>
                <dd>
                  {enrollment.class.name}, a partir de {formatDate(enrollment.class.startsAt)}
                </dd>
              </div>
            )}
          </dl>
        )}

        {enrollment.status !== EnrollmentStatuses.CANCELLED && (
          <section className="mt-12 border-t border-white/5 pt-10">
            <h2 className="font-display text-xl font-bold italic">
              {enrollment.status === EnrollmentStatuses.WAITLIST
                ? 'Pagamento da inscrição'
                : 'Pague a inscrição e envie o comprovante'}
            </h2>

            {enrollment.status === EnrollmentStatuses.WAITLIST && (
              <p className="mt-3 text-sm text-muted-foreground">
                Você só paga se abrir vaga e a secretaria chamar. Não pague agora.
              </p>
            )}

            {enrollment.status !== EnrollmentStatuses.WAITLIST && (
              <>
                <p className="mt-3 max-w-[52ch] text-sm text-muted-foreground">
                  {course && `São ${formatMoney(course.enrollmentFeeInCents)} de inscrição. `}
                  Pague por Pix e anexe o comprovante aqui embaixo.
                </p>

                <div className="chamfer mt-6 flex flex-wrap items-center justify-between gap-4 border border-white/10 bg-card p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">Chave Pix</p>
                    <p className="mt-1 font-mono text-sm">{PIX_KEY}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyPix}>
                    <Copy />
                    Copiar
                  </Button>
                </div>

                <div className="mt-8">
                  {hasReceipt && (
                    <p className="mb-4 inline-flex items-center gap-2 text-sm text-neon">
                      <CheckCircle weight="fill" className="size-4" />
                      Comprovante enviado. A secretaria vai conferir.
                    </p>
                  )}

                  <ReceiptUpload
                    protocol={protocol}
                    onAttached={async function () {
                      // Invalidar em vez de mexer no cache à mão: a resposta do
                      // anexo já traz a matrícula atualizada, mas o estado pode
                      // ter mudado no servidor entre uma coisa e outra.
                      await queryClient.invalidateQueries({
                        queryKey: queryKeys.storefront.enrollment(protocol),
                      })
                    }}
                  />
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
