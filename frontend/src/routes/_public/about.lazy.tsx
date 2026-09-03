import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'

import { Highlight } from '#/components/common/highlight'
import { Leaf } from '#/components/common/marks'
import { School } from './-components/school'
import { Team } from './-components/team'
import { WhereAndWhen } from './-components/where-and-when'
import { WhatsappFloat } from './-components/whatsapp-float'
import { REVEAL } from './-components/reveal'
import { ADDRESS } from '#/lib/site'
import { cn } from '#/lib/utils'

export const Route = createLazyFileRoute('/_public/sobre')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  return (
    <>
      <section className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="relative overflow-hidden rounded-block bg-primary px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
          <Leaf className="-top-24 -right-20 size-96 text-primary-foreground/5" />

          <div className="relative mx-auto max-w-7xl">
            <h1
              className={cn(
                REVEAL,
                'display-title max-w-[20ch] text-display-md font-semibold text-balance text-primary-foreground sm:text-display-lg lg:text-display-xl',
              )}
            >
              Uma escola de tecnologia no{' '}
              <Highlight variant="ink">Solimões</Highlight>
            </h1>

            <div
              className={cn(
                REVEAL,
                'delay-100 mt-8 grid max-w-[62ch] gap-5 text-body-lg text-primary-foreground',
              )}
            >
              <p>
                A Maiyu Academy nasceu para responder uma coisa simples: quem
                mora em {ADDRESS.city} e quer trabalhar com tecnologia hoje
                precisa sair daqui para aprender.
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
      <Team />
      <WhereAndWhen />

      <WhatsappFloat message="Olá! Quero saber mais sobre a Maiyu Academy." />
    </>
  )
}
