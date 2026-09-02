import type * as React from 'react'

import { CardContent, CardTitle } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
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
 * TODO: falta o sobrenome do Leonardo. Enquanto não chegar, a página mostra o
 * primeiro nome em vez de inventar um.
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
    name: 'Victor Rodrigues',
    role: 'Analista de sistemas e cibersegurança',
    portrait: '/ilustracoes/retrato-victor.svg',
    skills: [
      'Análise de sistemas',
      'Cibersegurança',
      'Segurança de aplicações',
      'Testes de segurança',
      'Modelagem de ameaças',
    ],
  },
] as const

export function Team(): React.JSX.Element {
  return (
    <section data-slot="home-team" className="px-3 py-3 sm:px-4 sm:py-4">
      <div className="rounded-block border border-border bg-background px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <h2
            className={cn(
              REVEAL,
              'display-title max-w-[16ch] text-heading-lg font-semibold text-balance text-foreground sm:text-display-md lg:text-display-lg',
            )}
          >
            Quem vai <Highlight variant="outline">ensinar</Highlight> você
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((person, index) => (
              <SectionCard
                key={person.name}
                className={cn(REVEAL, 'h-full')}
                style={{ animationDelay: `${index * STAGGER}ms` }}
              >
                <img
                  src={person.portrait}
                  alt={`Retrato ilustrado de ${person.name}`}
                  width={400}
                  height={300}
                  loading="lazy"
                  className="aspect-4/3 w-full bg-card object-contain"
                />

                <CardContent className="flex flex-col gap-3">
                  <div>
                    <CardTitle className="text-heading-sm text-foreground">
                      {person.name}
                    </CardTitle>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {person.role}
                    </p>
                  </div>

                  <ul className="grid gap-1.5">
                    {person.skills.map((skill) => (
                      <li
                        key={skill}
                        className="flex items-start gap-2 text-body-sm text-muted-foreground"
                      >
                        <span
                          aria-hidden
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground"
                        />
                        {skill}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </SectionCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
