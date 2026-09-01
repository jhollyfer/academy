import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import { Highlight } from '#/components/common/highlight'
import { Leaf } from '#/components/common/marks'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { enrollmentStateFrom, scheduleSummary } from '#/lib/enrollment-state'
import { formatMonthYear, pluralize } from '#/lib/format'
import { REVEAL } from './reveal'
import { cn } from '#/lib/utils'

/**
 * O último convite, no bloco verde que fecha a página.
 *
 * O mês do título vem da turma, e é a única palavra da pílula que não é fixa:
 * quando a turma de estreia passar e a próxima entrar, o título acompanha sem
 * ninguém editar JSX. Sem turma anunciada a frase muda inteira, porque prometer
 * um mês que não existe é o mesmo defeito que esta reforma veio consertar.
 */
export function FinalBanner(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())
  const state = enrollmentStateFrom(data?.data)

  let heading = (
    <>
      A próxima turma ainda não tem <Highlight variant="ink">data</Highlight>
    </>
  )
  let support =
    'Deixe seu contato com a secretaria e avisamos quando as inscrições abrirem.'

  if (state.kind !== 'NONE') {
    heading = (
      <>
        A próxima turma começa em{' '}
        <Highlight variant="ink">{formatMonthYear(state.startsAt)}</Highlight>
      </>
    )

    // As vagas vêm das turmas: "40 vagas por curso" estava escrito aqui e
    // deixou de valer quando o curso passou a ter mais de uma turma.
    const summary = scheduleSummary(data?.data)
    let seats = `São ${summary.totalSeats} vagas`
    if (summary.seatsPerClass !== null) {
      seats = `São ${pluralize(summary.classCount, 'turma', 'turmas')} de ${summary.seatsPerClass} vagas`
    }

    support = `${seats}, e a inscrição é por Pix.`
  }

  return (
    <section
      data-slot="home-final-banner"
      className="px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="relative overflow-hidden rounded-block bg-green px-6 py-14 sm:px-10 lg:px-14 lg:py-16">
        <Leaf className="-top-20 -right-16 size-80 -rotate-12 text-ink/5" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-16">
          <img
            src="/ilustracoes/turma-no-laboratorio.svg"
            alt="Três alunos em pé no laboratório, ao lado da bancada"
            width={400}
            height={300}
            loading="lazy"
            className={cn(REVEAL, 'w-full max-w-xs justify-self-center')}
          />

          <div className={cn(REVEAL, 'delay-100')}>
            <h2 className="max-w-[18ch] text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl">
              {heading}
            </h2>

            <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-ink/75 sm:text-lg">
              {support}
            </p>

            <EnrollmentCta tone="ink" scale="lg" className="mt-8" />
          </div>
        </div>
      </div>
    </section>
  )
}
