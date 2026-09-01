import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '#/components/ui/button'
import { Highlight } from '#/components/common/highlight'
import { Sparkles, Petal } from '#/components/common/marks'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { enrollmentStateFrom } from '#/lib/enrollment-state'
import { formatDate } from '#/lib/format'
import { REVEAL } from './reveal'
import { cn } from '#/lib/utils'

/**
 * A primeira dobra: o bloco verde arredondado com a chamada e a data da turma.
 *
 * O argumento é o da escola inteira, e ele não é sobre a Maiyu: é sobre quem lê.
 * "Você não precisa sair daqui" responde à razão pela qual alguém do Alto
 * Solimões desistiria antes de perguntar o preço.
 *
 * A subchamada carrega data, dia, horário e vagas porque são as quatro coisas
 * que a pessoa precisa saber para decidir se continua rolando. Elas vêm da
 * turma anunciada, e não escritas à mão: a página já anunciou 40 vagas em março
 * enquanto a matrícula dizia que não havia turma, e não vai anunciar de novo.
 *
 * O bloco tem margem lateral e canto de 32px em vez de sangrar até a borda:
 * é o gesto do sistema, e é o que faz o creme da página aparecer em volta como
 * moldura.
 */
export function Hero(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())
  const state = enrollmentStateFrom(data?.data)

  // Sem turma anunciada a frase perde a data em vez de inventar uma. O que
  // sobra continua verdadeiro.
  let schedule = 'Aulas presenciais aos sábados de manhã, em Benjamin Constant.'
  if (state.kind !== 'NONE') {
    schedule = `A turma de estreia começa em ${formatDate(state.startsAt)}. Aulas presenciais aos sábados de manhã, em Benjamin Constant.`
  }

  return (
    <section data-slot="home-hero" className="px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="relative overflow-hidden rounded-block bg-green px-6 pt-14 pb-0 sm:px-10 lg:px-14 lg:pt-20">
        <Petal className="-top-24 -right-20 size-96 text-ink/5" />

        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
          <h1
            className={cn(
              REVEAL,
              'text-4xl leading-[1.12] font-semibold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl',
            )}
          >
            Você não precisa sair daqui
            <br className="hidden sm:block" /> para aprender{' '}
            <Highlight variant="ink">tecnologia</Highlight>
            <Sparkles className="ml-3 inline-block size-6 align-super text-ink/50" />
          </h1>

          <div className={cn(REVEAL, 'delay-100')}>
            <p className="max-w-[46ch] text-base leading-relaxed text-ink/75 sm:text-lg">
              {schedule}
            </p>

            {/* TODO: trocar por "das 8h às 10h" quando a secretaria fechar o horário. */}
            <p className="mt-2 text-base leading-relaxed text-ink/75 sm:text-lg">
              São 40 vagas por turma.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <EnrollmentCta variant="pill" size="pill-lg" />

              {/*
                Âncora e não `Link`: os cursos são a seção logo abaixo, e não uma
                rota. Trocar de tela para ver dois cards seria pior que rolar
                até eles.
              */}
              <Button
                variant="pill-outline"
                size="pill-lg"
                render={<a href="#cursos">Ver os cursos</a>}
              />
            </div>
          </div>
        </div>

        {/*
          A ilustração encosta na base do bloco e transborda um pouco, que é o
          que impede o retângulo verde de terminar num corte reto. `mt-12` e não
          margem negativa: negativa criaria rolagem horizontal em 360px.
        */}
        <img
          src="/ilustracoes/bancada-arduino.svg"
          alt="Uma bancada com placa Arduino, protoboard e um notebook com código"
          width={400}
          height={300}
          // A primeira coisa que se vê. Adiá-la deixaria o bloco verde vazio
          // enquanto o resto da página já terminou de montar.
          loading="eager"
          fetchPriority="high"
          className={cn(
            REVEAL,
            'delay-200 relative mx-auto mt-12 w-full max-w-lg',
          )}
        />
      </div>
    </section>
  )
}
