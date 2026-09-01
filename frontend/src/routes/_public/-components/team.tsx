import type * as React from 'react'

import { Card, CardContent, CardTitle } from '#/components/ui/card'
import { Highlight } from '#/components/common/highlight'
import { REVEAL, STAGGER } from './reveal'
import { cn } from '#/lib/utils'

/**
 * Quem dá aula, e o que cada um faz.
 *
 * É a prova social desta página. Não há aluno formado, então não há depoimento,
 * não há nota e não há contagem de turmas: o que a escola tem para mostrar é
 * quem está na sala, e são quatro pessoas da região com formação na área.
 *
 * Cinco tópicos por pessoa, e não um parágrafo de biografia: quem lê está
 * decidindo se essa gente sabe o que vai ensinar, e a lista responde isso em
 * dois segundos de leitura.
 *
 * TODO: faltam os sobrenomes de Leonardo e de Victor. Enquanto não chegarem, a
 * página mostra o primeiro nome em vez de inventar um.
 */
const TEAM = [
  {
    name: 'Jhollyfer Rodrigues',
    role: 'Engenheiro de software',
    portrait: '/ilustracoes/retrato-jhollyfer.svg',
    skills: [
      'Desenvolvimento de software',
      'Programação web',
      'Front-end e back-end',
      'Arquitetura de sistemas',
      'Projetos tecnológicos',
    ],
  },
  {
    name: 'Caik Farias',
    role: 'Engenheiro da computação, responsável técnico da robótica',
    portrait: '/ilustracoes/retrato-caik.svg',
    skills: [
      'Infraestrutura de TI',
      'Manutenção e suporte',
      'Redes e sistemas',
      'Gestão de projetos',
      'Tecnologia educacional',
    ],
  },
  {
    name: 'Leonardo',
    role: 'Engenheiro eletricista',
    portrait: '/ilustracoes/retrato-leonardo.svg',
    skills: [
      'Eletricidade e eletrônica',
      'Automação',
      'Robótica',
      'Circuitos e sensores',
      'Integração eletroeletrônica',
    ],
  },
  {
    name: 'Victor',
    role: 'Analista de sistemas',
    portrait: '/ilustracoes/retrato-victor.svg',
    skills: [
      'Análise de sistemas',
      'Cibersegurança',
      'Suporte e processos',
      'Documentação e modelagem',
      'Soluções digitais',
    ],
  },
] as const

export function Team(): React.JSX.Element {
  return (
    <section data-slot="home-team" className="px-3 py-3 sm:px-4 sm:py-4">
      <div className="rounded-block border border-line bg-cream px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2
            className={cn(
              REVEAL,
              'max-w-[16ch] text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl',
            )}
          >
            Quem vai <Highlight variant="outline">ensinar</Highlight> você
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((person, index) => (
              <Card
                key={person.name}
                size="lg"
                className={cn(REVEAL, 'h-full')}
                style={{ animationDelay: `${index * STAGGER}ms` }}
              >
                <img
                  src={person.portrait}
                  alt={`Retrato ilustrado de ${person.name}`}
                  width={400}
                  height={300}
                  loading="lazy"
                  className="aspect-4/3 w-full bg-paper object-contain"
                />

                <CardContent className="flex flex-col gap-3">
                  <div>
                    <CardTitle className="text-lg font-semibold text-ink">
                      {person.name}
                    </CardTitle>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      {person.role}
                    </p>
                  </div>

                  <ul className="grid gap-1.5">
                    {person.skills.map((skill) => (
                      <li
                        key={skill}
                        className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft"
                      >
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-neon-ink"
                        />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
