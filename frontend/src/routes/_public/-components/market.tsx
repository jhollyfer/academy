import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import { SectionTitle } from './section-title'
import { CircuitTrails } from '#/components/common/marks'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { formatMoney } from '#/lib/format'
import { REVEAL, STAGGER } from './reveal'
import { cn } from '#/lib/utils'

/**
 * O panorama do mercado brasileiro de programação.
 *
 * **Nada aqui é promessa, e a formulação é o que garante isso.** Os números
 * dizem como o mercado remunera hoje, no país inteiro, e nunca o que alguém vai
 * ganhar. A diferença não é sutil: "júnior ganha em média X" é dado; "você vai
 * ganhar X" é propaganda enganosa numa escola que ainda não formou ninguém, e a
 * página inteira foi escrita para não precisar disso.
 *
 * A média de júnior é **nacional** e puxada por Sudeste e Sul. Ela entra como
 * horizonte do mercado, não como expectativa de primeiro emprego em Benjamin
 * Constant, e a legenda diz isso com todas as letras.
 *
 * Quatro cartões e não oito: dois níveis dão a escada, e duas tecnologias
 * mostram que o que se ensina aqui é o que o mercado paga. Mais números viram
 * planilha, e planilha não convence ninguém a se inscrever.
 *
 * A fonte e o ano ficam colados no bloco, com o tamanho da amostra e a ressalva
 * de amostragem por conveniência. Número sem fonte numa página de escola é o
 * mesmo que número inventado.
 */
type Card = {
  valor: number
  titulo: string
  nota: string
}

const CARDS: ReadonlyArray<Card> = [
  {
    valor: 506034,
    titulo: 'Pessoa desenvolvedora júnior',
    nota: 'Média nacional de quem está começando na carreira.',
  },
  {
    valor: 846652,
    titulo: 'Pessoa desenvolvedora pleno',
    nota: 'O degrau seguinte, depois de alguns anos de estrada.',
  },
  {
    valor: 1114204,
    titulo: 'Quem trabalha com TypeScript',
    nota: 'A linguagem do curso de desenvolvimento web.',
  },
  {
    valor: 1124181,
    titulo: 'Quem trabalha com Node.js',
    nota: 'O ambiente que o curso usa no servidor.',
  },
]

export function Market(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())

  /*
   * A taxa de inscrição vem da API, e não escrita aqui: ela é dado de curso e
   * muda no painel. O contraste desta seção é justamente entre ela e a média de
   * júnior, então um número desatualizado aqui destruiria o argumento inteiro.
   *
   * Sem curso carregado o parágrafo do contraste não aparece. Prometer "R$ 50"
   * numa página que não conseguiu ler o preço é o defeito que a escola menos
   * pode ter.
   */
  const inscricao = data?.data.at(0)?.enrollmentFeeInCents ?? null

  return (
    <section
      data-slot="home-market"
      className="relative overflow-hidden bg-brand-ink"
    >
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <CircuitTrails className="text-neon/20" />

        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            tone="ink"
            className={REVEAL}
            lead="É assim que o mercado"
            accent="brasileiro paga hoje"
          />

          <p
            className={cn(
              REVEAL,
              'delay-100 mt-6 max-w-[62ch] text-body-md text-white/80 sm:text-body-lg',
            )}
          >
            Não é o que a escola promete. É o que uma pesquisa com 17.046
            profissionais registrou em 2026, no Brasil inteiro.
          </p>

          <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((card, index) => (
              <div
                key={card.titulo}
                className={cn(
                  REVEAL,
                  // Card da identidade: borda fina neon, canto arredondado,
                  // fundo quase preto. O brilho fica na borda, nunca no texto.
                  'rounded-card border border-neon/30 bg-brand-ink-soft p-6 shadow-[0_0_24px_-12px_var(--neon)]',
                )}
                style={{ animationDelay: `${index * STAGGER}ms` }}
              >
                <dd className="brand-title text-display-md text-neon">
                  {formatMoney(card.valor)}
                </dd>
                <dt className="mt-3 text-heading-sm font-semibold text-white">
                  {card.titulo}
                </dt>
                <p className="mt-2 text-body-sm text-white/65">{card.nota}</p>
              </div>
            ))}
          </dl>

          {inscricao !== null && (
            <p
              className={cn(
                REVEAL,
                'delay-300 mt-10 max-w-[62ch] text-body-md text-white sm:text-body-lg',
              )}
            >
              A inscrição na Maiyu custa{' '}
              <strong className="font-semibold text-neon">
                {formatMoney(inscricao)}
              </strong>
              . A média de quem já está dentro dessa carreira, no primeiro
              degrau, é {formatMoney(CARDS[0].valor)} por mês.
            </p>
          )}

          {/*
            O argumento regional, e ele é narrativo e não estatístico. A
            formulação é exata de propósito: a pesquisa não alcançou o Norte, e
            isso é diferente de dizer que não há programadores aqui. A primeira
            frase é verdade e sustenta a tese da escola; a segunda seria mentira
            sobre a própria região.
          */}
          <p
            className={cn(
              REVEAL,
              'delay-300 mt-4 max-w-[62ch] text-body-md text-white/80 sm:text-body-lg',
            )}
          >
            Entre os 12 estados com mais respostas na pesquisa, nenhum é do
            Norte. Não falta talento na região. Falta porta de entrada.
          </p>

          <p className="mt-10 max-w-[62ch] text-body-sm text-white/55">
            Fonte: Pesquisa Salarial de Programadores 2026, Código Fonte TV.
            17.046 respondentes, coleta de fevereiro a junho de 2026. A
            amostragem é por conveniência, então os números são um panorama do
            mercado e não um censo. As médias são nacionais e puxadas por
            Sudeste e Sul.
          </p>
        </div>
      </div>
    </section>
  )
}
