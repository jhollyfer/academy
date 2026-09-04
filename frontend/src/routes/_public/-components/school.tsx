import type * as React from 'react'

import { CAMPUS } from '#/lib/site'
import { Leaf } from '#/components/common/marks'
import { REVEAL } from './reveal'
import { SectionTitle } from './section-title'
import { cn } from '#/lib/utils'

/**
 * O que a escola é, e por que ela é presencial.
 *
 * O parágrafo do meio é o argumento inteiro da Maiyu em duas frases: quem mora
 * aqui não precisa se mudar, e não precisa depender de aula gravada numa
 * conexão que cai. É a razão de a escola existir, e por isso ela é a segunda
 * coisa que a página diz.
 *
 * "Nasce para ser a primeira" e não "é a primeira": o pioneirismo entra como
 * propósito declarado, que é o que a escola pode sustentar hoje. Afirmar o
 * superlativo seria uma alegação de mercado que alguém pode contestar, e a
 * página inteira foi escrita para não precisar defender nenhuma.
 *
 * O prédio das aulas aparece pelo nome, e vem de `CAMPUS` em vez de escrito
 * aqui: o mesmo nome sai no bloco de "onde e quando" e no rodapé da matrícula,
 * e três cópias divergiriam no dia em que a escola mudasse de sala.
 *
 * O logradouro continua de fora. Numa cidade deste tamanho o CETI é referência
 * conhecida, e o número da rua não é o que falta para alguém chegar lá.
 */
export function School(): React.JSX.Element {
  return (
    <section
      data-slot="home-school"
      className="relative overflow-hidden bg-background"
    >
      {/*
        Sangria total, como as faixas escuras: sem raio, sem borda e sem
        respiro lateral no invólucro. Cada seção era um cartão flutuando
        sobre o fundo, e empilhadas viravam uma pilha de cartões com
        listras de fundo entre eles. O recuo que sobra é o do conteúdo,
        no `mx-auto max-w-7xl` de dentro.
      */}
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Leaf className="-bottom-24 -left-24 size-80 rotate-12 text-primary/10" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <img
            src="/ilustracoes/sala-presencial.svg"
            alt="Uma sala de aula presencial com quadro, mesas e alunos"
            width={400}
            height={300}
            loading="lazy"
            className={cn(REVEAL, 'w-full max-w-md justify-self-center')}
          />

          <div className={cn(REVEAL, 'delay-100')}>
            <SectionTitle eyebrow="A escola" lead="Quem" accent="somos" />

            <div className="mt-7 space-y-5 text-body-md text-muted-foreground sm:text-body-lg">
              <p>
                A Maiyu Academy nasce para ser a primeira escola de tecnologia
                do Alto Solimões. Presencial, em Benjamin Constant: as aulas
                acontecem no {CAMPUS.name}, aos sábados, com bancada e
                computador no local.
              </p>
              <p>
                Quem mora aqui não precisa se mudar para Manaus nem depender de
                aula gravada com internet que cai. A turma é presencial, o
                professor está na sala e o kit fica na sua mão.
              </p>
              <p>
                Começa com dois cursos, robótica e desenvolvimento web, em
                turmas de manhã, tarde e noite. Os dois do zero, para quem nunca
                escreveu uma linha de código.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
