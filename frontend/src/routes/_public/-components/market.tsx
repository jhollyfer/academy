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
 *
 * **A seção já foi lida como promessa, e por isso a forma importa tanto quanto
 * o texto.** Um teste de aceitação apontou que ela podia configurar publicidade
 * enganosa, e o defeito não estava em nenhuma frase isolada - estava no arranjo:
 * a cifra vinha em tamanho de manchete, antes do cargo a que pertencia; a
 * ressalva de metodologia ficava dois parágrafos abaixo, depois de a impressão
 * já estar formada; e um parágrafo punha o preço da inscrição ao lado da média
 * do júnior, que se lê como conta mesmo sem prometer nada.
 *
 * Três correções, então: o cargo antes do valor e o valor em corpo de texto, a
 * ressalva logo abaixo dos cartões, e o parágrafo do preço sem a comparação.
 * O dado continua na página inteiro - o que saiu foi o destaque que o
 * transformava em oferta.
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
                {/*
                  O nome do cargo primeiro, e o valor depois - na ordem que
                  `dl` já pedia (`dt` é o termo, `dd` a descrição) e que estava
                  invertida aqui.

                  A inversão não era só semântica: com o valor em
                  `text-display-md` no topo, o que a página gritava era a cifra,
                  e o cargo a que ela pertence chegava depois, menor. Um leitor
                  que passasse os olhos levava o número sem levar o "de quem" -
                  e foi assim que a seção acabou lida como promessa de salário.
                */}
                <dt className="text-heading-sm font-semibold text-white">
                  {card.titulo}
                </dt>
                <dd className="brand-title mt-2 text-heading-md text-neon">
                  {formatMoney(card.valor)}
                  <span className="ml-1 text-body-sm font-normal text-white/55">
                    por mês
                  </span>
                </dd>
                <p className="mt-2 text-body-sm text-white/65">{card.nota}</p>
              </div>
            ))}
          </dl>

          {/*
            A ressalva sobe para junto dos cartões.

            Ela ficava no fim da seção, dois parágrafos abaixo - e o teste de
            aceitação leu os números sem nunca chegar nela. Ressalva que só
            aparece depois de a pessoa ter formado a impressão não é ressalva, é
            rodapé.
          */}
          <p className="mt-6 max-w-[62ch] text-body-sm text-white/55">
            Fonte: Pesquisa Salarial de Programadores 2026, Código Fonte TV.
            17.046 respondentes, coleta de fevereiro a junho de 2026. A
            amostragem é por conveniência, então os números são um panorama do
            mercado e não um censo. As médias são nacionais e puxadas por
            Sudeste e Sul.
          </p>

          {inscricao !== null && (
            <p
              className={cn(
                REVEAL,
                'delay-300 mt-10 max-w-[62ch] text-body-md text-white sm:text-body-lg',
              )}
            >
              {/*
                O preço fica; a comparação sai.

                A frase punha o valor da inscrição ao lado da média do júnior,
                e duas cifras lado a lado se leem como uma conta - "pago isto,
                ganho aquilo" -, ainda que nenhuma palavra prometesse nada. O
                que a escola pode afirmar é o que ela cobra e o que ela faz;
                quanto alguém vai ganhar não é dela para dizer.
              */}
              A inscrição na Maiyu custa{' '}
              <strong className="font-semibold text-neon">
                {formatMoney(inscricao)}
              </strong>
              . Os números acima são do mercado, não uma promessa da escola:
              quanto cada pessoa ganha depende da empresa, da região e do
              momento em que ela procura o primeiro emprego.
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
        </div>
      </div>
    </section>
  )
}
