import type * as React from 'react'
import { CheckCircleIcon, MapPinIcon } from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'

import { PillButton } from '#/components/common/pill-button'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { SectionTitle } from './section-title'
import { REVEAL } from './reveal'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { formatMoney } from '#/lib/format'
import { CAMPUS, ENROLLMENT_DESK, whatsappUrl } from '#/lib/site'
import { cn } from '#/lib/utils'

/**
 * O passo do pagamento sai da API, e os outros quatro não.
 *
 * "Pague os R$ 150 de inscrição" estava escrito aqui dentro, e era o valor da
 * mensalidade, não o da inscrição. Um preço em texto fixo numa página de
 * matrícula é a linha que envelhece primeiro e a que custa mais caro quando
 * envelhece: quem lê chega ao Pix com outro número na cabeça.
 *
 * Sem curso carregado o passo cai para a forma genérica. Anunciar um valor que
 * a página não conseguiu ler seria repetir o defeito com outra roupa.
 */
function steps(feeInCents: number | null): ReadonlyArray<string> {
  let pagamento = 'Pague a inscrição por Pix.'

  if (feeInCents !== null) {
    pagamento = `Pague os ${formatMoney(feeInCents)} de inscrição por Pix.`
  }

  return [
    'Escolha a turma: robótica ou programação, no horário que cabe na sua semana.',
    'Preencha o formulário. Leva menos de cinco minutos.',
    pagamento,
    'Envie o comprovante pela própria página.',
    'Espere a confirmação da secretaria pelo WhatsApp.',
  ]
}

const ENROLL_MESSAGE = 'Olá! Quero saber como me matricular na Maiyu Academy.'

/**
 * Os cinco passos da matrícula.
 *
 * O título fala em celular porque é onde a maioria vai preencher: o público
 * usa o telefone como computador principal, e prometer "cinco minutos" só vale
 * se o formulário couber na mão dele.
 *
 * O caminho presencial fica ao lado e não escondido: quem não confia em pagar
 * pela internet, ou está sem dado, precisa saber que existe balcão antes de
 * desistir da página.
 *
 * E o balcão nomeia o prédio **e** nega o outro. São duas portas para a mesma
 * vaga em endereços diferentes - inscrição na FAMETRO, aula no CETI -, e este
 * rodapé dizia "no mesmo endereço das aulas". Quem leu aquilo iria ao prédio
 * errado num sábado de manhã.
 */
export function HowToEnroll(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())
  const passos = steps(data?.data.at(0)?.enrollmentFeeInCents ?? null)

  return (
    <section data-slot="home-how-to-enroll" className="bg-card">
      {/*
        Sangria total, como as faixas escuras: sem raio, sem borda e sem
        respiro lateral no invólucro. O recuo que sobra é o do conteúdo,
        no `mx-auto max-w-7xl` de dentro.
      */}
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className={cn(REVEAL)}>
            <SectionTitle lead="A matrícula" accent="cabe no celular" />

            <ol className="mt-9 grid gap-4">
              {passos.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  {/* `regular` e não `fill`: a identidade usa ícone de
                      contorno em todo lugar, e um chapado no meio da lista
                      quebra a família. */}
                  <CheckCircleIcon
                    weight="regular"
                    aria-hidden
                    className="mt-0.5 size-5 shrink-0 text-primary"
                  />
                  <span className="text-body-md text-muted-foreground">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <EnrollmentCta tone="ink" scale="lg" />

              <PillButton
                tone="outline"
                scale="lg"
                render={
                  <a
                    href={whatsappUrl(ENROLL_MESSAGE)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Tirar uma dúvida
                  </a>
                }
              />
            </div>

            <p className="mt-8 flex items-start gap-3 rounded-card bg-background px-5 py-4 text-body-sm text-muted-foreground">
              <MapPinIcon
                weight="regular"
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-primary"
              />
              Prefere resolver pessoalmente? A inscrição também é feita no
              balcão da {ENROLLMENT_DESK.name}. As aulas não são lá: acontecem
              no {CAMPUS.name}.
            </p>
          </div>

          <img
            src="/ilustracoes/matricula-no-celular.svg"
            alt="Um celular com o formulário de matrícula preenchido e a confirmação"
            width={400}
            height={300}
            loading="lazy"
            className={cn(
              REVEAL,
              'delay-100 w-full max-w-md justify-self-center',
            )}
          />
        </div>
      </div>
    </section>
  )
}
