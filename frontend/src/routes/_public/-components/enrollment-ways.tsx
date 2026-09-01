import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, MapPin, WhatsappLogo } from '@phosphor-icons/react'
import { NeonCard, NeonCardDescription, NeonCardTitle } from '#/components/common/neon'
import { ADDRESS, whatsappUrl } from '#/lib/site'
import { Reveal } from './reveal'

/**
 * As duas formas de se matricular.
 *
 * A seção existe por causa de uma contradição no material impresso: uma arte diz
 * "cursos presenciais" e outra diz "matrícula virtual". Não é contradição, mas
 * quem lê as duas fica em dúvida - então a página diz as duas coisas junto, e no
 * mesmo lugar: a aula é presencial, a matrícula pode ser feita de casa.
 *
 * O card da matrícula virtual é o **preenchido**. É o único card cheio da
 * página, e é aqui porque é a ação que o site existe para provocar - quem chega
 * do anúncio já pode fechar sem sair de onde está.
 */
export function EnrollmentWays(): React.JSX.Element {
  return (
    <section className="border-y border-white/5 bg-surface/30">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28">
        <Reveal>
          <NeonCard variant="filled" className="h-full justify-between gap-6 p-8 lg:p-10">
            <div className="grid gap-3">
              <NeonCardTitle className="text-3xl">Matrícula virtual</NeonCardTitle>
              <NeonCardDescription className="max-w-[46ch] text-base">
                Preencha o formulário, envie o comprovante do Pix e pronto. A secretaria confirma e
                avisa você.
              </NeonCardDescription>
            </div>

            <Link
              to="/matricula"
              className="inline-flex w-fit items-center gap-2 bg-[var(--accent-fg)] px-5 py-3 font-medium text-[var(--accent)] transition-opacity hover:opacity-90"
            >
              Garanta sua vaga
              <ArrowRight className="size-4" />
            </Link>
          </NeonCard>
        </Reveal>

        <Reveal delay={0.08}>
          <NeonCard className="h-full justify-between gap-6 p-8">
            <div className="grid gap-3">
              <NeonCardTitle className="text-2xl">Ou presencialmente</NeonCardTitle>
              <NeonCardDescription className="text-base">
                As aulas são em {ADDRESS.city}/{ADDRESS.state}. Passe na secretaria para se
                matricular no balcão.
              </NeonCardDescription>
            </div>

            <div className="grid gap-3 text-sm">
              <span className="inline-flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-neon" />
                {ADDRESS.city}/{ADDRESS.state}
              </span>
              <a
                href={whatsappUrl('Olá! Quero saber como me matricular na Maiyu Academy.')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 font-medium text-neon hover:underline"
              >
                <WhatsappLogo className="size-4" />
                Tirar uma dúvida no WhatsApp
              </a>
            </div>
          </NeonCard>
        </Reveal>
      </div>
    </section>
  )
}
