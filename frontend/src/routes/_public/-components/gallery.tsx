import type * as React from 'react'

import { REVEAL, STAGGER } from './reveal'
import { SectionTitle } from './section-title'
import type { PhotoResponse } from '#/integrations/response'
import { cn } from '#/lib/utils'

/**
 * A escola por dentro.
 *
 * A vitrine é inteiramente ilustrada, e ilustração não prova que o lugar
 * existe. Enquanto não há aluno formado, a foto do espaço é a prova mais direta
 * que a escola tem para quem nunca ouviu falar dela: a sala, a bancada, o kit
 * de eletrônica em cima da mesa.
 *
 * **A legenda é parte da prova, e não decoração.** "A sala do CETI num sábado
 * de manhã" diz onde e quando; "alunos felizes" não diz nada e é o que
 * qualquer banco de imagens entrega. É o mesmo argumento do papel do parceiro.
 *
 * A seção nasce vazia de propósito: o acervo ainda não existe. Quando as fotos
 * chegarem, elas sobem pelo painel e aparecem aqui sem deploy nenhum.
 */
export function Gallery({
  photos,
}: {
  photos: Array<PhotoResponse>
}): React.JSX.Element {
  return (
    <section
      data-slot="home-gallery"
      className="relative overflow-hidden bg-card"
    >
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            className={REVEAL}
            lead="A escola"
            accent="por dentro"
          />

          <p
            className={cn(
              REVEAL,
              'delay-100 mt-6 max-w-[64ch] text-body-md text-muted-foreground sm:text-body-lg',
            )}
          >
            O lugar onde as aulas acontecem, os equipamentos que ficam na mesa e
            o que a turma constrói neles.
          </p>

          {/*
            Grade com vãos de 1px: o fundo aparece entre as células e vira o
            divisor, sem borda para gerenciar e sem linha dupla no cruzamento.
            Com foto, é o que faz um mosaico parecer editado em vez de colado.
          */}
          <div className="hairline-grid mt-12 overflow-hidden rounded-card sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <figure
                key={photo.id}
                className={cn(REVEAL, 'bg-card')}
                style={{ animationDelay: `${index * STAGGER}ms` }}
              >
                {photo.image?.url && (
                  <img
                    src={photo.image.url}
                    // A legenda está logo abaixo, visível para todo mundo.
                    // Repeti-la no `alt` faria o leitor de tela ler duas vezes.
                    alt=""
                    loading="lazy"
                    className="aspect-4/3 w-full bg-muted object-cover"
                  />
                )}
                <figcaption className="px-5 py-4 text-body-sm text-muted-foreground">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
