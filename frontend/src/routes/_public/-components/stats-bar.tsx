import * as React from 'react'

import { Separator } from '#/components/ui/separator'
import { REVEAL } from './reveal'
import { cn } from '#/lib/utils'

/**
 * Os quatro números do curso, logo abaixo do hero.
 *
 * São os únicos números que a escola tem, e é de propósito que não há um quinto:
 * não existe aluno formado, então não há nota, não há contagem de alunos e não
 * há depoimento. A prova social desta página é a equipe, o laboratório e o
 * projeto final.
 *
 * `<dl>` com `<dd>` antes do `<dt>` na leitura visual: o número vem primeiro na
 * tela e o rótulo embaixo, mas na ordem do documento o termo precede a
 * definição, que é o que um leitor de tela anuncia. `flex-col-reverse` resolve
 * os dois.
 */
const FACTS = [
  { value: '4', label: 'meses de curso' },
  { value: '16', label: 'sábados de aula' },
  { value: '32h', label: 'de carga horária' },
  { value: '40', label: 'vagas por turma' },
] as const

export function StatsBar(): React.JSX.Element {
  return (
    <section data-slot="home-stats" className="px-3 pt-3 sm:px-4 sm:pt-4">
      <dl
        className={cn(
          REVEAL,
          'mx-auto grid max-w-7xl grid-cols-2 items-center gap-y-8 rounded-block border border-line bg-paper px-6 py-10 sm:px-10 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]',
        )}
      >
        {FACTS.map((fact, index) => (
          <React.Fragment key={fact.label}>
            <div className="flex flex-col-reverse items-center gap-1 text-center">
              <dt className="text-sm text-ink-soft">{fact.label}</dt>
              <dd className="text-4xl leading-none font-semibold tracking-tight text-ink sm:text-5xl">
                {fact.value}
              </dd>
            </div>

            {/*
              O divisor só existe entre dois números, e só onde a linha é uma
              só: em duas colunas ele cairia no meio da grade, separando itens
              que estão um embaixo do outro.
            */}
            {index < FACTS.length - 1 && (
              <Separator
                orientation="vertical"
                className="hidden h-12 bg-line-strong lg:block"
              />
            )}
          </React.Fragment>
        ))}
      </dl>
    </section>
  )
}
