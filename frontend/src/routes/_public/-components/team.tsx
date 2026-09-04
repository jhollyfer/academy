import type * as React from 'react'

import { CardContent, CardTitle } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { REVEAL, STAGGER } from './reveal'
import { SectionTitle } from './section-title'
import { cn } from '#/lib/utils'

/**
 * Quem dá aula, e o que cada um faz.
 *
 * É a prova social desta página. Não há aluno formado, então não há depoimento,
 * não há nota e não há contagem de turmas: o que a escola tem para mostrar é
 * quem está na sala, e são quatro pessoas da região com formação na área.
 *
 * A linha abaixo do título nomeia as cinco especialidades do time. Ela fica
 * aqui, e não junto dos cursos, porque é o que estas quatro pessoas sabem - e
 * não o que a escola vende hoje. Confundir os dois seria anunciar turma de
 * segurança e de IA que não existe.
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
    <section data-slot="home-team" className="bg-background">
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
            eyebrow="Professores" lead="Quem vai"
            accent="ensinar você"
          />

          {/*
            As cinco áreas do time, e não as duas dos cursos abertos: a linha
            responde "essa gente sabe o quê?", que é a pergunta que a seção
            existe para responder. Os cursos que existem hoje continuam sendo os
            dois dos cards - a lista é de formação, não de catálogo, e é por isso
            que ela fala de "professores especializados" e não de "cursos de".
          */}
          <p
            className={cn(
              REVEAL,
              'delay-100 mt-6 max-w-[64ch] text-body-md text-muted-foreground sm:text-body-lg',
            )}
          >
            Professores especializados em robótica, análise de dados,
            programação, segurança e inteligência artificial. Todos da região,
            com formação na área.
          </p>

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
