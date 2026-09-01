import * as React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import { Reveal } from './reveal'
import type { CourseFaqResponse } from '#/integrations/response'

/**
 * As perguntas frequentes.
 *
 * Accordion e não uma lista de dez linhas com hairline: são perguntas, e
 * pergunta fechada é o formato que deixa a pessoa varrer a lista e abrir só a
 * que é dela. Uma lista aberta empurraria tudo que vem depois para bem longe.
 *
 * O conteúdo vem do banco: a escola escreve as perguntas no painel, e o site não
 * precisa de deploy para responder uma dúvida nova que apareceu no WhatsApp.
 */
export function Faq({
  faqs,
  title = 'Perguntas',
  highlight = 'frequentes',
}: {
  faqs: Array<CourseFaqResponse>
  title?: string
  highlight?: string
}): React.JSX.Element {
  if (faqs.length === 0) return <></>

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <h2 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight text-balance italic sm:text-4xl">
          {title} <span className="text-neon">{highlight}</span>
        </h2>

        <Reveal>
          <Accordion>
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left text-base">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
