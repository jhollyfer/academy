import type * as React from 'react'

import { CardContent, CardTitle, CardDescription } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { REVEAL, STAGGER } from './reveal'
import { SectionTitle } from './section-title'
import { cn } from '#/lib/utils'

const PROFILES = [
  {
    title: 'Quem nunca programou',
    description:
      'Você nunca escreveu uma linha de código nem mexeu com eletrônica. Os dois cursos começam do zero, e a primeira aula foi escrita para você.',
  },
  {
    title: 'Quem quer trabalhar com isso',
    description:
      'Você já mexe com computador e quer sair do uso para a construção. Aqui você monta um projeto do começo ao fim.',
  },
  {
    title: 'Estudante a partir de 14 anos',
    description:
      'A idade mínima é 14 anos. Menor de 18 se matricula com os dados do responsável no formulário.',
  },
] as const

/**
 * Para quem é, e para quem não é.
 *
 * O bloco de recusa não é honestidade decorativa: sem ele a página só teria
 * convites, e quem procura curso online descobriria que a aula é presencial
 * depois de pagar a inscrição. Dizer não antes do Pix é mais barato para os
 * dois lados.
 *
 * O último período é onde a página resolve a única tensão que ela tem: a seção
 * de missão diz que a escola existe para abrir a porta do mercado de TI, e esta
 * diz que ninguém sai daqui com vaga garantida. As duas são verdade, e a frase
 * as separa em vez de deixar o leitor supor a mais generosa - escola que estreia
 * sem aluno formado não tem como prometer carreira.
 */
export function WhoItsFor(): React.JSX.Element {
  return (
    <section data-slot="home-who-its-for" className="bg-background">
      {/*
        Sangria total, como as faixas escuras: sem raio, sem borda e sem
        respiro lateral no invólucro. Cada seção era um cartão flutuando
        sobre o fundo, e empilhadas viravam uma pilha de cartões com
        listras de fundo entre eles. O recuo que sobra é o do conteúdo,
        no `mx-auto max-w-7xl` de dentro.
      */}
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            className={REVEAL}
            eyebrow="Público" lead="Para quem é"
            accent="esta turma"
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {PROFILES.map((profile, index) => (
              <SectionCard
                key={profile.title}
                className={cn(REVEAL, 'h-full')}
                style={{ animationDelay: `${index * STAGGER}ms` }}
              >
                <CardContent className="flex flex-col gap-3">
                  <CardTitle className="text-heading-sm text-foreground">
                    {profile.title}
                  </CardTitle>
                  <CardDescription className="text-body-sm text-muted-foreground">
                    {profile.description}
                  </CardDescription>
                </CardContent>
              </SectionCard>
            ))}
          </div>

          <div
            className={cn(
              REVEAL,
              'delay-300 mt-4 rounded-card border border-dashed border-foreground/25 px-6 py-7 sm:px-8',
            )}
          >
            <p className="max-w-[76ch] text-body-md text-muted-foreground">
              <strong className="font-semibold text-foreground">
                Não é para quem
              </strong>{' '}
              procura curso online, aula gravada ou certificado rápido. As aulas
              são presenciais, aos sábados, e exigem presença. E abrir a porta
              do mercado, que é o que a escola existe para fazer, não é o mesmo
              que garantir a passagem por ela: no fim do curso o que você leva é
              a base e o projeto, não uma vaga.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
