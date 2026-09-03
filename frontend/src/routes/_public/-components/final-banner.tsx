import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import { CircuitTrails, Leaf } from '#/components/common/marks'
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
      A próxima turma ainda não tem <span className="text-neon">data</span>
    </>
  )
  let support =
    'Deixe seu contato com a secretaria e avisamos quando as inscrições abrirem.'

  if (state.kind !== 'NONE') {
    heading = (
      <>
        A próxima turma começa em{' '}
        <span className="text-neon">{formatMonthYear(state.startsAt)}</span>
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
      className="relative overflow-hidden bg-brand-ink"
    >
      {/*
        O bloco de marca fecha a página do mesmo jeito que abre. Era
        `bg-primary`, o verde chapado: o hero e o convite final são as duas
        pontas da mesma assinatura, e só uma delas tinha virado.
      */}
      <div className="relative px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <CircuitTrails className="text-neon/20" />
        <Leaf className="-top-20 -right-16 size-80 -rotate-12 text-neon/5" />

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
            {/*
              Aqui o `SectionTitle` não serve: o título é montado no corpo do
              componente e muda de forma conforme haja turma anunciada, então
              ele não se parte em duas linhas fixas. O que se aproveita é a
              tipografia da marca.
            */}
            <h2 className="brand-title max-w-[18ch] text-heading-lg text-balance text-white sm:text-display-md lg:text-display-lg">
              {heading}
            </h2>

            <p className="mt-5 max-w-[52ch] text-body-md text-white/85 sm:text-body-lg">
              {support}
            </p>

            <EnrollmentCta tone="neon" scale="lg" className="mt-8" />
          </div>
        </div>
      </div>
    </section>
  )
}
