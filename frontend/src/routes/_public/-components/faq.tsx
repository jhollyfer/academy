import type * as React from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import { REVEAL } from './reveal'
import { SectionTitle } from './section-title'
import { cn } from '#/lib/utils'
import type { CourseFaqResponse } from '#/integrations/response'

/**
 * As perguntas frequentes, vindas do banco.
 *
 * A home lê o FAQ geral, o de `courseId` nulo, servido por `/storefront/faqs`.
 * Antes deste ciclo essas perguntas estavam no seed e nenhum endpoint as servia,
 * então a home simplesmente não renderizava FAQ nenhum - e a seção existia no
 * código.
 *
 * Sem pergunta a seção some inteira, em vez de deixar um título sobre um vazio.
 */
/**
 * O `id` do painel de uma pergunta, escrito nos dois lados da relação: no
 * `id` do próprio painel e no `aria-controls` do botão que o abre.
 *
 * Prefixado porque `faq.id` é um uuid do banco, e um `id` de HTML que começa
 * com dígito é válido mas trava seletor de CSS.
 */
function panelId(faqId: string): string {
  return `faq-resposta-${faqId}`
}

export function Faq({
  faqs,
  title = 'Perguntas',
  highlight = 'frequentes',
}: {
  faqs: ReadonlyArray<CourseFaqResponse>
  title?: string
  highlight?: string
}): React.JSX.Element {
  if (faqs.length === 0) return <></>

  return (
    <section data-slot="home-faq" className="bg-background">
      {/*
        Sangria total, como as faixas escuras: sem raio, sem borda e sem
        respiro lateral no invólucro. Cada seção era um cartão flutuando
        sobre o fundo, e empilhadas viravam uma pilha de cartões com
        listras de fundo entre eles. O recuo que sobra é o do conteúdo,
        no `mx-auto max-w-7xl` de dentro.
      */}
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <SectionTitle className={REVEAL} eyebrow="Dúvidas" lead={title} accent={highlight} />

          {/*
            `keepMounted` porque o `aria-controls` abaixo é escrito à mão. Por
            padrão o Base UI mantém o painel fora do DOM enquanto fechado, e
            justamente por isso o trigger dele só emite `aria-controls` quando
            aberto - apontar para um `id` inexistente seria pior que a
            ausência. Com o painel persistido (e `hidden` enquanto fechado), a
            referência vale nos dois estados.
          */}
          <Accordion
            keepMounted
            className={cn(
              REVEAL,
              'delay-100 rounded-card border-border bg-card',
            )}
          >
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.id} value={faq.id} className="px-2">
                <AccordionTrigger
                  aria-controls={panelId(faq.id)}
                  className="py-5 text-left text-base font-medium text-foreground"
                >
                  {/*
                    O número antes da pergunta, `aria-hidden`: dá à lista a
                    cadência de documento, e um leitor de tela que anunciasse
                    "zero um" antes de cada pergunta só atrasaria quem já sabe
                    que está num acordeão.
                  */}
                  <span
                    aria-hidden
                    className="mr-3 text-sm text-muted-foreground tabular-nums"
                  >
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent
                  id={panelId(faq.id)}
                  className="pb-5 text-body-md text-muted-foreground"
                >
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
