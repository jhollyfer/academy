import type * as React from 'react'

import { CardContent, CardDescription, CardTitle } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { REVEAL, STAGGER } from './reveal'
import { SectionTitle } from './section-title'
import type { PartnerResponse } from '#/integrations/response'
import { cn } from '#/lib/utils'

/**
 * Quem responde pela escola.
 *
 * É prova de credibilidade, e ela existe porque a escola ainda não formou
 * ninguém: sem aluno formado não há depoimento, nota nem contagem - a mesma
 * razão que `stats-bar.tsx` e `team.tsx` já registram. Instituição conhecida da
 * cidade é o que se pode mostrar no lugar, e ela é verificável por qualquer um
 * que pergunte na rua.
 *
 * **O papel de cada parceiro é o conteúdo, e o logo é o acessório.** Grade de
 * logo sem papel declarado não prova nada - é o erro que quase todo site
 * institucional comete, e com dois parceiros ele seria fatal: duas imagens
 * soltas leem como um espaço que sobrou. "Cede as salas onde as aulas
 * acontecem" é uma afirmação que alguém pode conferir.
 *
 * Por isso a seção não tem número: dois parceiros nomeados e explicados valem
 * mais que "+10 parceiros", e a página não afirma nada que precise defender.
 */
export function Partners({
  partners,
}: {
  partners: Array<PartnerResponse>
}): React.JSX.Element {
  return (
    <section
      data-slot="home-partners"
      className="relative overflow-hidden bg-background"
    >
      {/*
        Sangria total, como as demais seções: sem raio, sem borda e sem respiro
        lateral no invólucro. O recuo que sobra é o do conteúdo, no
        `mx-auto max-w-7xl` de dentro.
      */}
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-7xl">
          <SectionTitle
            className={REVEAL}
            eyebrow="Parceiros" lead="Quem sustenta"
            accent="esta escola"
          />

          <p
            className={cn(
              REVEAL,
              'delay-100 mt-6 max-w-[64ch] text-body-md text-muted-foreground sm:text-body-lg',
            )}
          >
            A escola não funciona sozinha. Estas são as instituições que cedem
            espaço e recebem quem vem se inscrever, e o que cada uma faz está
            escrito.
          </p>

          {/*
            Duas colunas e não quatro: são duas instituições, e uma grade
            desenhada para quatro deixaria metade da linha vazia - que é como um
            site pequeno se denuncia. A grade cresce quando houver mais.
          */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {partners.map((partner, index) => (
              <SectionCard
                key={partner.id}
                className={cn(REVEAL, 'h-full')}
                style={{ animationDelay: `${index * STAGGER}ms` }}
              >
                <CardContent className="flex flex-col gap-4">
                  {/*
                    O logo é opcional, e a célula não muda de altura por causa
                    disso: sem imagem, o nome da instituição já é a identidade -
                    e num site institucional o nome escrito por extenso costuma
                    ser mais legível que uma logomarca de escola pública
                    digitalizada em baixa resolução.
                  */}
                  {partner.logo?.url && (
                    <img
                      src={partner.logo.url}
                      alt=""
                      width={200}
                      height={80}
                      loading="lazy"
                      className="h-12 w-auto max-w-[200px] self-start object-contain"
                    />
                  )}

                  <div>
                    <CardTitle className="text-heading-sm text-foreground">
                      {partner.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-body-sm text-muted-foreground">
                      {partner.role}
                    </CardDescription>
                  </div>

                  {partner.url && (
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-body-sm text-neon-ink underline underline-offset-4 dark:text-neon"
                    >
                      Site da instituição
                    </a>
                  )}
                </CardContent>
              </SectionCard>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
