import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  CirclesThreePlus,
  Cpu,
  PresentationChart,
  Toolbox,
  UsersThree,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

import { CardContent, CardTitle, CardDescription } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { Highlight } from '#/components/common/highlight'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { scheduleSummary } from '#/lib/enrollment-state'
import { pluralize } from '#/lib/format'
import { REVEAL, STAGGER } from './reveal'
import { cn } from '#/lib/utils'

/**
 * O que a matrícula entrega, item a item.
 *
 * Cinco cards, e nenhum deles promete emprego, salário ou mercado. Não é
 * modéstia: a escola estreia sem nenhum aluno formado, e uma promessa de
 * carreira aqui seria a única frase da página que ninguém pode sustentar.
 *
 * TODO: falta o card de certificado. A política ainda não está definida, e
 * anunciar certificado antes de a secretaria fechar é prometer documento que
 * talvez não exista. Entra aqui quando decidirem, com o texto do FAQ junto.
 */
const ITEMS: ReadonlyArray<{ icon: Icon; title: string; description: string }> =
  [
    {
      icon: Cpu,
      title: 'A placa na sua mão',
      description:
        'Aula prática desde o primeiro sábado. Você monta o circuito, escreve o código e vê funcionar.',
    },
    {
      icon: Toolbox,
      title: 'Kit e bancada inclusos',
      description:
        'O laboratório tem computador, kit de eletrônica e ferramenta. Você não precisa levar nada.',
    },
    {
      icon: UsersThree,
      title: 'Turma pequena',
      // O tamanho da turma sai do dado, e por isso este card é montado no
      // componente: o texto dizia "uma turma por curso, com quarenta lugares" e
      // deixou de valer quando a escola abriu cinco turmas.
      description: '',
    },
    {
      icon: PresentationChart,
      title: 'Projeto final apresentado',
      description:
        'No último sábado cada aluno apresenta o que construiu. É o que fica com você no fim.',
    },
    {
      icon: CirclesThreePlus,
      title: 'Professores engenheiros da região',
      description:
        'Quem dá aula mora aqui e trabalha com isso. Engenharia de software, engenharia da computação e engenharia elétrica.',
    },
  ]

export function WhatYouGet(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())
  const summary = scheduleSummary(data?.data)

  /*
   * O card das vagas, preenchido com o que as turmas dizem.
   *
   * Sem turma anunciada ele fala do tamanho da turma sem prometer número: a
   * frase continua verdadeira, e é a mesma escolha que o hero faz com a data.
   */
  let seats = 'Turma pequena, sem sala lotada e sem fila para usar a bancada.'

  if (summary.seatsPerClass !== null) {
    seats = `${pluralize(summary.classCount, 'turma', 'turmas')} de ${summary.seatsPerClass} lugares. Sem sala lotada e sem fila para usar a bancada.`
  } else if (summary.classCount > 0) {
    seats = `${summary.totalSeats} lugares em ${summary.classCount} turmas. Sem sala lotada e sem fila para usar a bancada.`
  }

  const items = ITEMS.map(function (item) {
    if (item.icon === UsersThree) return { ...item, description: seats }

    return item
  })

  return (
    <section
      data-slot="home-what-you-get"
      className="px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
        {/*
          O card escuro é o único bloco de contraste desta metade da página, e é
          ele que carrega o CTA. `on-ink` não é enfeite de nome: nada aqui
          depende dela, mas ela marca a região escura para quem for acrescentar
          um estado de foco próprio depois.
        */}
        <div
          className={cn(
            REVEAL,
            'flex flex-col justify-between gap-10 rounded-block bg-foreground dark:bg-card p-8 sm:p-10',
          )}
        >
          <h2 className="text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-background dark:text-card-foreground sm:text-4xl">
            O que você <Highlight variant="slab">leva</Highlight> daqui
          </h2>

          <div>
            <p className="mb-7 text-base leading-relaxed text-background/70 dark:text-muted-foreground">
              Tudo o que a aula precisa já está no laboratório. Você leva o
              caderno e a vontade.
            </p>

            <EnrollmentCta
              tone="slab"
              scale="lg"
              className="w-full sm:w-auto"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <SectionCard
              key={item.title}
              className={cn(REVEAL, 'h-full')}
              style={{ animationDelay: `${index * STAGGER}ms` }}
            >
              <CardContent className="flex flex-col gap-4">
                {/*
                  O círculo verde deslocado atrás do ícone, como na referência.
                  Dois elementos e não uma borda: o deslocamento é o que dá a
                  sensação de recorte colado, e uma borda ficaria concêntrica.
                */}
                <span className="relative inline-flex size-11 items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute -top-1 -left-1 size-9 rounded-full bg-primary"
                  />
                  <item.icon
                    weight="duotone"
                    className="relative size-7 text-primary-foreground"
                  />
                </span>

                <CardTitle className="text-lg font-semibold text-foreground">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </CardDescription>
              </CardContent>
            </SectionCard>
          ))}
        </div>
      </div>
    </section>
  )
}
