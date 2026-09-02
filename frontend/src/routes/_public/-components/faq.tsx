import type * as React from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import { Highlight } from '#/components/common/highlight'
import { REVEAL } from './reveal'
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
    <section data-slot="home-faq" className="px-3 py-3 sm:px-4 sm:py-4">
      <div className="rounded-block border border-border bg-background px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <h2
            className={cn(
              REVEAL,
              'display-title text-heading-lg font-semibold text-balance text-foreground sm:text-display-md lg:text-display-lg',
            )}
          >
            {title} <Highlight variant="outline">{highlight}</Highlight>
          </h2>

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
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="px-2">
                <AccordionTrigger
                  aria-controls={panelId(faq.id)}
                  className="py-5 text-left text-base font-medium text-foreground"
                >
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
