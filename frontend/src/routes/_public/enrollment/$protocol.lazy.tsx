import * as React from 'react'
import { Link, createLazyFileRoute, getRouteApi } from '@tanstack/react-router'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Check,
  CheckCircle,
  Copy,
  Hourglass,
  Warning,
} from '@phosphor-icons/react'
import { storefrontEnrollmentQueryOptions } from '#/integrations/tanstack-query/queries'
import { queryKeys } from '#/hooks/tanstack-query/_query-keys'
import { Button } from '#/components/ui/button'
import { Alert, AlertTitle } from '#/components/ui/alert'
import { Card, CardContent } from '#/components/ui/card'
import { PillButton } from '#/components/common/pill-button'
import { whatsappUrl } from '#/lib/site'
import { formatDate, formatMoney } from '#/lib/format'
import { EnrollmentStatuses } from '#/lib/entity'
import { ReceiptUpload } from './-components/receipt-upload'
import type { EnrollmentStatus } from '#/lib/entity'

const route = getRouteApi('/_public/enrollment/$protocol')

export const Route = createLazyFileRoute('/_public/enrollment/$protocol')({
  component: RouteComponent,
  notFoundComponent: ProtocolNotFound,
})

/**
 * O protocolo que não existe.
 *
 * Separado do 404 genérico do site porque a pergunta é outra: quem chega aqui
 * não digitou um endereço errado, chegou por um link que tinha um número - e o
 * que ele precisa saber é que aquele número não corresponde a matrícula
 * nenhuma, e que a inscrição pode ser refeita.
 *
 * Os dois motivos possíveis vêm escritos porque mudam o que a pessoa faz a
 * seguir: link cortado pelo aplicativo de mensagem se resolve pedindo o link
 * inteiro de novo; matrícula que nunca foi enviada se resolve preenchendo o
 * formulário. Mandar direto ao formulário quem só perdeu metade do link o faria
 * se inscrever duas vezes.
 */
function ProtocolNotFound(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="text-foreground [&_svg]:mx-auto [&_svg]:size-10">
        <Warning weight="regular" />
      </div>

      <h1 className="mt-5 text-3xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-4xl">
        Matrícula não encontrada
      </h1>

      <p className="mx-auto mt-5 max-w-[52ch] leading-relaxed text-muted-foreground">
        Este protocolo não corresponde a nenhuma matrícula. Ou o link veio
        cortado - o que costuma acontecer quando ele é encaminhado -, ou a
        inscrição não chegou a ser enviada.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <PillButton
          tone="ink"
          scale="lg"
          render={<Link to="/enrollment">Fazer minha matrícula</Link>}
        />

        <Button
          variant="outline"
          nativeButton={false}
          render={
            <a
              href={whatsappUrl(PROTOCOL_HELP_MESSAGE)}
              target="_blank"
              rel="noreferrer"
            >
              Falar com a secretaria
            </a>
          }
        />
      </div>
    </div>
  )
}

/**
 * A conversa que a secretaria recebe de quem tem o link e não a matrícula.
 *
 * Ela existe porque a secretaria **tem** o pedido: quem se inscreveu está no
 * painel, e é ela que consegue reencontrar o protocolo pelo nome. Mandar essa
 * pessoa preencher tudo de novo criaria uma segunda matrícula para a mesma
 * vaga.
 */
const PROTOCOL_HELP_MESSAGE =
  'Olá! Abri o link da minha matrícula na Maiyu Academy e ele diz que o protocolo não existe. ' +
  'Podem me ajudar a localizar?'

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
    icon: <Hourglass weight="regular" />,
    title: 'Matrícula recebida',
    description:
      'Sua vaga está reservada. Assim que a secretaria conferir o comprovante do Pix, ela confirma e avisa você.',
  },
  CONFIRMED: {
    icon: <CheckCircle weight="regular" />,
    title: 'Matrícula confirmada',
    description: 'Está tudo certo. Nos vemos no primeiro sábado de aula.',
  },
  WAITLIST: {
    icon: <Hourglass weight="regular" />,
    title: 'Você está na fila de espera',
    description:
      'A turma encheu antes do seu envio. Você não perdeu o lugar na fila: se abrir vaga, a secretaria chama pela ordem.',
  },
  CANCELLED: {
    icon: <Warning weight="regular" />,
    title: 'Matrícula cancelada',
    description:
      'Se isso não era o esperado, fale com a secretaria pelo WhatsApp.',
  },
}

/**
 * A chave Pix da escola.
 *
 * TODO: trocar pela chave real antes de publicar. Enquanto for este valor, o
 * pagamento não chega em lugar nenhum.
 */
const PIX_KEY = '00.000.000/0001-00'

/**
 * Quanto tempo o botão fica em "Copiado!" antes de voltar a "Copiar".
 *
 * Dois segundos: tempo de a confirmação ser lida sem que o botão fique
 * mentindo depois, quando a área de transferência já pode ter outro conteúdo.
 */
const COPIED_RESET_MS = 2_000

function RouteComponent(): React.JSX.Element {
  const { protocol } = route.useParams()
  const { data: enrollment } = useSuspenseQuery(
    storefrontEnrollmentQueryOptions(protocol),
  )
  const queryClient = useQueryClient()

  const view = STATUS_VIEW[enrollment.status]
  const course = enrollment.class?.course
  // Sem `?? []`: a projeção pública sempre manda a lista, vazia quando não há
  // anexo. O `??` cobria o `files?` opcional do tipo antigo, que descrevia a
  // resposta do painel e não esta.
  const hasReceipt = enrollment.files.length > 0

  const [copied, setCopied] = React.useState(false)

  /**
   * O timer do "Copiado!" vive num `ref` para poder ser cancelado: sem isso,
   * sair da tela dentro dos dois segundos deixa um `setState` mirando um
   * componente que não existe mais, e clicar duas vezes seguidas encurta a
   * segunda confirmação para o que sobrou da primeira.
   */
  const copiedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    }
  }, [])

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      toast.success('Chave Pix copiada')

      setCopied(true)
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS)
    } catch {
      // `clipboard` falha sem HTTPS e em alguns navegadores embutidos. A chave
      // está visível na tela de qualquer forma, então o aviso diz o que fazer em
      // vez de só reclamar.
      toast.error(
        'Não deu para copiar. Selecione a chave na tela e copie à mão.',
      )
    }
  }

  let copyLabel = 'Copiar'
  if (copied) copyLabel = 'Copiado!'

  return (
    <div className="relative">
      <div className="relative mx-auto max-w-2xl px-4 py-16 lg:py-20">
        <div className="text-foreground [&_svg]:size-10">{view.icon}</div>

        <h1 className="brand-title mt-5 text-heading-lg text-foreground sm:text-display-md">
          {view.title}
        </h1>
        <p className="mt-4 max-w-[52ch] text-body-md text-muted-foreground">
          {view.description}
        </p>

        {/*
          O protocolo em destaque e em `tabular-nums`: é o número que a pessoa
          vai ditar no WhatsApp, e dígito de largura variável se lê pior em voz
          alta.
        */}
        <Card className="rounded-card mt-10 [--card-spacing:--spacing(6)]">
          <CardContent>
            <p className="text-sm text-muted-foreground">Seu protocolo</p>
            <p className="mt-2 font-mono text-sm break-all tabular-nums">
              {enrollment.protocol}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Guarde este endereço. É por ele que você acompanha a matrícula.
            </p>
          </CardContent>
        </Card>

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
                  {enrollment.class.name}, a partir de{' '}
                  {formatDate(enrollment.class.startsAt)}
                </dd>
              </div>
            )}
          </dl>
        )}

        {enrollment.status !== EnrollmentStatuses.CANCELLED && (
          <section className="mt-12 border-t border-border pt-10">
            <h2 className="text-heading-md font-bold">
              {enrollment.status === EnrollmentStatuses.WAITLIST &&
                'Pagamento da inscrição'}
              {enrollment.status !== EnrollmentStatuses.WAITLIST &&
                'Pague a inscrição e envie o comprovante'}
            </h2>

            {enrollment.status === EnrollmentStatuses.WAITLIST && (
              <p className="mt-3 text-sm text-muted-foreground">
                Você só paga se abrir vaga e a secretaria chamar. Não pague
                agora.
              </p>
            )}

            {enrollment.status !== EnrollmentStatuses.WAITLIST && (
              <>
                <p className="mt-3 max-w-[52ch] text-sm text-muted-foreground">
                  {course &&
                    `São ${formatMoney(course.enrollmentFeeInCents)} de inscrição. `}
                  Pague por Pix e anexe o comprovante aqui embaixo.
                </p>

                <Card className="rounded-card mt-6 [--card-spacing:--spacing(5)]">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Chave Pix</p>
                      <p className="mt-1 font-mono text-sm">{PIX_KEY}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyPix}>
                      {copied && <Check />}
                      {!copied && <Copy />}
                      {/*
                        O rótulo é a região viva, e não o botão inteiro: o
                        leitor de tela anuncia a troca do texto sem reler o
                        ícone a cada render. O toast do sonner sozinho não
                        cobre isso em todo navegador.
                      */}
                      <span aria-live="polite">{copyLabel}</span>
                    </Button>
                  </CardContent>
                </Card>

                <div className="mt-8">
                  {hasReceipt && (
                    <Alert className="mb-4">
                      <CheckCircle weight="regular" />
                      <AlertTitle>
                        Comprovante enviado. A secretaria vai conferir.
                      </AlertTitle>
                    </Alert>
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
