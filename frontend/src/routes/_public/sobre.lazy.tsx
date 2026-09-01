import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { CircuitBackground } from '#/components/common/neon'
import { Team } from './-components/team'
import { Lab } from './-components/lab'
import { WhatsappFloat } from './-components/whatsapp-float'
import { ADDRESS } from '#/lib/site'

export const Route = createLazyFileRoute('/_public/sobre')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <CircuitBackground />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-16 lg:pt-24">
          <h1 className="max-w-[20ch] font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance italic sm:text-5xl lg:text-6xl">
            Uma escola de tecnologia <span className="text-neon">no Alto Solimões</span>
          </h1>

          <div className="mt-8 grid max-w-[62ch] gap-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              A Maiyu Academy nasceu para responder uma coisa simples: quem mora em{' '}
              {ADDRESS.city} e quer trabalhar com tecnologia hoje precisa sair daqui para aprender.
            </p>
            <p>
              As aulas são presenciais, aos sábados, na {ADDRESS.street}. São quatro meses, com
              bancada, kit de eletrônica e computador no lugar. Ninguém precisa levar equipamento.
            </p>
          </div>
        </div>
      </section>

      <Team />
      <Lab />

      <WhatsappFloat message="Olá! Quero saber mais sobre a Maiyu Academy." />
    </>
  )
}
