import type * as React from 'react'

import { Highlight } from '#/components/common/highlight'
import { CAMPUS } from '#/lib/site'
import { Leaf } from '#/components/common/marks'
import { REVEAL } from './reveal'
import { cn } from '#/lib/utils'

/**
 * O que a escola é, e por que ela é presencial.
 *
 * O parágrafo do meio é o argumento inteiro da Maiyu em duas frases: quem mora
 * aqui não precisa se mudar, e não precisa depender de aula gravada numa
 * conexão que cai. É a razão de a escola existir, e por isso ela é a segunda
 * coisa que a página diz.
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
    <section data-slot="home-school" className="px-3 py-3 sm:px-4 sm:py-4">
      <div className="relative overflow-hidden rounded-block border border-border bg-background px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <Leaf className="-bottom-24 -left-24 size-80 rotate-12 text-primary/40" />

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
            <h2 className="display-title text-heading-lg font-semibold text-balance text-foreground sm:text-display-md lg:text-display-lg">
              Tecnologia se aprende{' '}
              <Highlight variant="outline">aqui</Highlight> mesmo
            </h2>

            <div className="mt-7 space-y-5 text-body-md text-muted-foreground sm:text-body-lg">
              <p>
                A Maiyu Academy é uma escola de tecnologia presencial em
                Benjamin Constant, no Alto Solimões. As aulas acontecem no{' '}
                {CAMPUS.name}, aos sábados, com bancada e computador no local.
              </p>
              <p>
                Quem mora aqui não precisa se mudar para Manaus nem depender de
                aula gravada com internet que cai. A turma é presencial, o
                professor está na sala e o kit fica na sua mão.
              </p>
              <p>
                São dois cursos, em turmas de manhã, tarde e noite. Robótica e
                desenvolvimento web, os dois começando do zero.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
