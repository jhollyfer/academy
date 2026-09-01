import type * as React from 'react'

import { CardContent, CardTitle, CardDescription } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { Highlight } from '#/components/common/highlight'
import { REVEAL, STAGGER } from './reveal'
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
 * O último período é a única vez em que a página fala de emprego, e é para
 * negar. Escola que estreia sem aluno formado não tem como prometer carreira.
 */
export function WhoItsFor(): React.JSX.Element {
  return (
    <section data-slot="home-who-its-for" className="px-3 py-3 sm:px-4 sm:py-4">
      <div className="rounded-block border border-border bg-background px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2
            className={cn(
              REVEAL,
              'max-w-[18ch] text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl',
            )}
          >
            Para quem é esta <Highlight variant="fill">turma</Highlight>
          </h2>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {PROFILES.map((profile, index) => (
              <SectionCard
                key={profile.title}
                className={cn(REVEAL, 'h-full')}
                style={{ animationDelay: `${index * STAGGER}ms` }}
              >
                <CardContent className="flex flex-col gap-3">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {profile.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
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
            <p className="max-w-[76ch] text-base leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">
                Não é para quem
              </strong>{' '}
              procura curso online, aula gravada ou certificado rápido. As aulas
              são presenciais, aos sábados, e exigem presença. Também não é para
              quem espera emprego garantido no fim. O que a escola entrega é a
              base e o projeto.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
