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
      <div className="rounded-block border border-line bg-cream px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <h2
            className={cn(
              REVEAL,
              'text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl',
            )}
          >
            {title} <Highlight variant="outline">{highlight}</Highlight>
          </h2>

          <Accordion
            className={cn(
              REVEAL,
              'delay-100 rounded-card border-line bg-paper',
            )}
          >
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="px-2">
                <AccordionTrigger className="py-5 text-left text-base font-medium text-ink">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-base leading-relaxed text-ink-soft">
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
