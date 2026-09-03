import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarBlankIcon,
  ClockIcon,
  SeatIcon,
  TimerIcon,
} from '@phosphor-icons/react'

import { Separator } from '#/components/ui/separator'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { scheduleSummary } from '#/lib/enrollment-state'
import { REVEAL } from './reveal'
import { cn } from '#/lib/utils'

/**
 * Os quatro números do curso, logo abaixo do hero.
 *
 * São os únicos números que a escola tem, e é de propósito que não há um quinto:
 * não existe aluno formado, então não há nota, não há contagem de alunos e não
 * há depoimento. A prova social desta página é a equipe, o laboratório e o
 * projeto final.
 *
 * `<dl>` com `<dd>` antes do `<dt>` na leitura visual: o número vem primeiro na
 * tela e o rótulo embaixo, mas na ordem do documento o termo precede a
 * definição, que é o que um leitor de tela anuncia. `flex-col-reverse` resolve
 * os dois.
 */
type Fact = { value: string; label: string; icon: React.ElementType }

/**
 * Os ícones vêm em `outline` (o `regular` do Phosphor), nunca preenchidos.
 * É a regra da identidade: nas artes de divulgação todo ícone é contorno, e um
 * ícone chapado no meio de quatro contornos é o que quebra a família.
 */
const FACTS: ReadonlyArray<Fact> = [
  { value: '4', label: 'meses de curso', icon: CalendarBlankIcon },
  { value: '16', label: 'sábados de aula', icon: TimerIcon },
  { value: '32h', label: 'de carga horária', icon: ClockIcon },
]

export function StatsBar(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())
  const summary = scheduleSummary(data?.data)

  /*
   * O quarto número vem das turmas, e os três primeiros não.
   *
   * Meses, sábados e carga horária são do curso e valem para as cinco turmas.
   * Vagas era o que estava escrito "40" aqui enquanto havia uma turma por
   * curso - e virou mentira no dia em que a escola abriu cinco. Sem turma
   * anunciada o número sai da barra em vez de anunciar zero vaga.
   */
  const facts = [...FACTS]

  if (summary.seatsPerClass !== null) {
    facts.push({
      value: String(summary.seatsPerClass),
      label: 'vagas por turma',
      icon: SeatIcon,
    })
  } else if (summary.classCount > 0) {
    facts.push({
      value: String(summary.totalSeats),
      label: 'vagas abertas',
      icon: SeatIcon,
    })
  }

  return (
    <section data-slot="home-stats" className="bg-brand-ink">
      <dl
        className={cn(
          REVEAL,
          // `flex` no desktop e não uma grade de colunas fixas: a barra tem
          // três ou quatro números conforme haja turma anunciada, e um
          // `grid-cols` escrito para quatro deixaria uma coluna vazia.
          // A faixa é a continuação do hero e encosta nele: o `border-t` em
          // neon é o que separa os dois sem abrir um vão de fundo entre eles.
          'mx-auto grid max-w-7xl grid-cols-2 items-center gap-y-8 border-t border-neon/20 px-4 py-10 sm:px-6 lg:flex lg:justify-between lg:px-8',
        )}
      >
        {facts.map((fact, index) => (
          <React.Fragment key={fact.label}>
            <div className="flex flex-col-reverse items-center gap-1 text-center lg:flex-1">
              <dt className="text-sm text-white/70">{fact.label}</dt>
              <dd className="brand-title text-display-md leading-none text-neon sm:text-display-lg">
                {fact.value}
              </dd>
              {/*
                O ícone acima do número na leitura visual, e primeiro na ordem
                do documento entre os três: `flex-col-reverse` inverte a
                pintura, então quem está aqui embaixo aparece em cima. Ele é
                decorativo e o `aria-hidden` do Phosphor já o esconde.
              */}
              <fact.icon
                aria-hidden
                weight="regular"
                className="mb-2 size-6 text-neon/70"
              />
            </div>

            {/*
              O divisor só existe entre dois números, e só onde a linha é uma
              só: em duas colunas ele cairia no meio da grade, separando itens
              que estão um embaixo do outro.
            */}
            {index < facts.length - 1 && (
              <Separator
                orientation="vertical"
                className="hidden h-12 bg-neon/20 lg:block"
              />
            )}
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}
