import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { CircuitTrails, Leaf } from '#/components/common/marks'
import { Mission } from './-components/mission'
import { SectionTitle } from './-components/section-title'
import { School } from './-components/school'
import { Team } from './-components/team'
import { WhereAndWhen } from './-components/where-and-when'
import { WhatsappFloat } from './-components/whatsapp-float'
import { REVEAL } from './-components/reveal'
import { ADDRESS } from '#/lib/site'
import { cn } from '#/lib/utils'

export const Route = createLazyFileRoute('/_public/about')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  return (
    <>
      {/*
        A mesma faixa da home: preto esverdeado, sangria total, trilhas de
        circuito. Era um bloco verde arredondado com respiro lateral, e o site
        passou a ter duas aberturas diferentes conforme a página.
      */}
      <section className="relative overflow-hidden bg-brand-ink">
        <CircuitTrails className="text-neon/25" />
        <Leaf className="-top-24 -right-20 size-96 text-neon/5" />

        <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="relative mx-auto max-w-7xl">
            <SectionTitle
              as="h1"
              tone="ink"
              className={cn(REVEAL, 'lg:text-display-xl')}
              lead="Quem"
              accent="somos"
            />

            <div
              className={cn(
                REVEAL,
                'delay-100 mt-8 grid max-w-[62ch] gap-5 text-body-lg text-white/85',
              )}
            >
              <p>
                A Maiyu Academy é uma escola de tecnologia no Alto Solimões, e
                nasceu para responder uma coisa simples: quem mora em{' '}
                {ADDRESS.city} e quer trabalhar com tecnologia hoje precisa sair
                daqui para aprender.
              </p>
              <p>
                As aulas são presenciais, aos sábados, em {ADDRESS.city}. São
                quatro meses, com bancada, kit de eletrônica e computador no
                lugar. Ninguém precisa levar equipamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      <School />
      <Mission />
      <Team />
      <WhereAndWhen />

      <WhatsappFloat message="Olá! Quero saber mais sobre a Maiyu Academy." />
    </>
  )
}
