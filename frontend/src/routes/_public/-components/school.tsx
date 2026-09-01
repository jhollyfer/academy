import type * as React from 'react'

import { Highlight } from '#/components/common/highlight'
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
 * Nenhuma menção à instituição que cede o espaço: o endereço ainda não está
 * fechado, e nomear o prédio antes de saber o logradouro é o mesmo erro de
 * anunciar rua errada, só que com o nome de outra pessoa.
 */
export function School(): React.JSX.Element {
  return (
    <section data-slot="home-school" className="px-3 py-3 sm:px-4 sm:py-4">
      <div className="relative overflow-hidden rounded-block border border-line bg-cream px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <Leaf className="-bottom-24 -left-24 size-80 rotate-12 text-green/40" />

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
            <h2 className="text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl">
              Tecnologia se aprende{' '}
              <Highlight variant="outline">aqui</Highlight> mesmo
            </h2>

            <div className="mt-7 space-y-5 text-base leading-relaxed text-ink-soft sm:text-lg">
              <p>
                A Maiyu Academy é uma escola de tecnologia presencial em
                Benjamin Constant, no Alto Solimões. As aulas acontecem na
                secretaria, aos sábados, com bancada e computador no local.
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
