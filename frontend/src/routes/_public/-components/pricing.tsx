import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from '@phosphor-icons/react'
import { Button } from '#/components/ui/button'
import { formatMoney } from '#/lib/format'
import { Reveal } from './reveal'
import type { CourseResponse } from '#/integrations/response'

/**
 * O investimento, em números grandes.
 *
 * Não é uma tabela de planos: há um preço só, igual nos dois cursos. Montar três
 * colunas de plano para uma oferta única seria inventar escolha onde não há - e
 * o padrão de "plano do meio destacado" da referência só faz sentido quando
 * existem planos.
 *
 * Os valores vêm do curso, não de constante: quando a escola reajustar, ela
 * reajusta no painel e a página acompanha. Um número escrito aqui seria o
 * primeiro a ficar desatualizado.
 */
export function Pricing({ course }: { course: CourseResponse }): React.JSX.Element {
  return (
    <section className="border-y border-white/5 bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
        <Reveal>
          <h2 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight italic sm:text-4xl">
            Quanto <span className="text-neon">custa</span>
          </h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:max-w-3xl">
            <div>
              <p className="font-display text-5xl leading-none font-extrabold text-neon italic lg:text-6xl">
                {formatMoney(course.enrollmentFeeInCents)}
              </p>
              <p className="mt-3 text-muted-foreground">
                de inscrição, uma vez só, na hora da matrícula.
              </p>
            </div>

            <div>
              <p className="font-display text-5xl leading-none font-extrabold text-neon italic lg:text-6xl">
                {formatMoney(course.monthlyFeeInCents)}
              </p>
              <p className="mt-3 text-muted-foreground">
                por mês, durante os {course.durationMonths} meses do curso.
              </p>
            </div>
          </div>

          <p className="mt-10 max-w-[60ch] text-muted-foreground">
            O pagamento é por Pix. Você envia o comprovante junto com a matrícula e a secretaria
            confirma.
          </p>

          <Button render={<Link to="/matricula" />} size="lg" className="mt-8">
            Garanta sua vaga
            <ArrowRight />
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
