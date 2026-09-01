import type * as React from 'react'
import { CheckCircle, MapPin } from '@phosphor-icons/react'

import { PillButton } from '#/components/common/pill-button'
import { Highlight } from '#/components/common/highlight'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { REVEAL } from './reveal'
import { CAMPUS, ENROLLMENT_DESK, whatsappUrl } from '#/lib/site'
import { cn } from '#/lib/utils'

const STEPS = [
  'Escolha a turma: robótica ou programação, no horário que cabe na sua semana.',
  'Preencha o formulário. Leva menos de cinco minutos.',
  'Pague os R$ 150 de inscrição por Pix.',
  'Envie o comprovante pela própria página.',
  'Espere a confirmação da secretaria pelo WhatsApp.',
] as const

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
  return (
    <section
      data-slot="home-how-to-enroll"
      className="px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="rounded-block border border-border bg-card px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className={cn(REVEAL)}>
            <h2 className="max-w-[16ch] text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl">
              A matrícula cabe no{' '}
              <Highlight variant="outline">celular</Highlight>
            </h2>

            <ol className="mt-9 grid gap-4">
              {STEPS.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <CheckCircle
                    weight="fill"
                    aria-hidden
                    className="mt-0.5 size-5 shrink-0 text-foreground"
                  />
                  <span className="text-base leading-relaxed text-muted-foreground">
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

            <p className="mt-8 flex items-start gap-3 rounded-card bg-background px-5 py-4 text-sm leading-relaxed text-muted-foreground">
              <MapPin
                weight="duotone"
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-foreground"
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
