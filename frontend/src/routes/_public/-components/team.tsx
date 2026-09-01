import * as React from 'react'
import { SectionTitle } from '#/components/common/neon'
import { Reveal } from './reveal'

/**
 * Quem ensina.
 *
 * Numa cidade pequena isto pesa mais que qualquer selo: o aluno provavelmente
 * conhece alguém que conhece essas pessoas, e o nome real é a prova social que
 * nenhum depoimento inventado substitui. É também por isso que a página não tem
 * seção de depoimento: a escola está estreando e não tem ex-aluno, e depoimento
 * fabricado é o que queima confiança mais rápido num lugar onde todo mundo se
 * fala.
 *
 * TODO: trocar as fotos por retratos reais dos quatro, 800x800.
 */
const TEAM = [
  { name: 'Jhollyfer Rodrigues', role: 'Desenvolvimento web', seed: 'maiyu-team-jhollyfer' },
  { name: 'Caik Farias', role: 'Robótica e eletrônica', seed: 'maiyu-team-caik' },
  { name: 'Leonardo', role: 'Robótica', seed: 'maiyu-team-leonardo' },
  { name: 'Victor', role: 'Desenvolvimento web', seed: 'maiyu-team-victor' },
] as const

export function Team(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
      <SectionTitle first="Quem vai" second="ensinar você" />

      <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {TEAM.map((person, index) => (
          <Reveal key={person.name} delay={index * 0.06}>
            <figure className="grid gap-4">
              <div className="chamfer aspect-square overflow-hidden bg-surface">
                <img
                  src={`https://picsum.photos/seed/${person.seed}/800/800`}
                  alt={`Retrato de ${person.name}`}
                  width={800}
                  height={800}
                  loading="lazy"
                  className="h-full w-full object-cover grayscale transition-[filter] duration-500 hover:grayscale-0"
                />
              </div>
              <figcaption>
                <p className="font-display font-bold tracking-tight italic">{person.name}</p>
                <p className="text-sm text-muted-foreground">{person.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
