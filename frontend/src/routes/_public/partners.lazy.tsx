import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { CircuitTrails, Leaf } from '#/components/common/marks'
import { PillButton } from '#/components/common/pill-button'
import { Partners } from './-components/partners'
import { SectionTitle } from './-components/section-title'
import { WhatsappFloat } from './-components/whatsapp-float'
import { REVEAL } from './-components/reveal'
import { storefrontPartnersQueryOptions } from '#/integrations/tanstack-query/queries'
import { ADDRESS, whatsappUrl } from '#/lib/site'
import { cn } from '#/lib/utils'

export const Route = createLazyFileRoute('/_public/partners')({
  component: RouteComponent,
})

const PROPOSAL_MESSAGE =
  'Olá! Represento uma escola ou instituição e quero conversar sobre parceria com a Maiyu Academy.'

/**
 * A segunda porta do site.
 *
 * A home converte matrícula e fala com família. Quem chega aqui decide por
 * outro motivo - é uma escola, uma secretaria ou uma empresa avaliando se
 * apoia -, e a conversa é outra: o que a Maiyu leva, o que precisa do outro
 * lado, e quem já está junto.
 *
 * Em registro mais sóbrio que o resto da vitrine, e de propósito: a página não
 * está vendendo uma vaga, está propondo um convênio.
 *
 * Sem número de impacto, porque não existe nenhum: a escola não formou turma. O
 * que ela tem para mostrar a um parceiro é o que já está montado e quem já
 * respondeu por ela - e isso basta para uma primeira conversa.
 */
function RouteComponent(): React.JSX.Element {
  const partners = useQuery(storefrontPartnersQueryOptions())

  return (
    <>
      {/* A mesma faixa de abertura da home e do "quem somos": preto
          esverdeado, sangria total, trilhas de circuito. */}
      <section className="relative overflow-hidden bg-brand-ink">
        <CircuitTrails className="text-neon/25" />
        <Leaf className="-top-24 -right-20 size-96 text-neon/5" />

        <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="relative mx-auto max-w-7xl">
            <SectionTitle
              as="h1"
              tone="ink"
              className={cn(REVEAL, 'lg:text-display-xl')}
              lead="Para escolas"
              accent="e instituições"
            />

            <div
              className={cn(
                REVEAL,
                'delay-100 mt-8 grid max-w-[62ch] gap-5 text-body-lg text-white/85',
              )}
            >
              <p>
                A Maiyu Academy é uma escola de tecnologia em {ADDRESS.city}, no
                Alto Solimões. Ela existe para que morar aqui deixe de ser o
                motivo pelo qual alguém não entra na área.
              </p>
              <p>
                Isso não se faz sozinho. Instituições da região cedem espaço,
                recebem quem vem se inscrever e abrem porta para a juventude
                daqui. É assim que a escola funciona hoje.
              </p>
            </div>

            <div className={cn(REVEAL, 'delay-200 mt-8')}>
              <PillButton
                tone="neon"
                scale="lg"
                render={
                  <a href={whatsappUrl(PROPOSAL_MESSAGE)}>Propor parceria</a>
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section
        data-slot="partners-offer"
        className="relative overflow-hidden bg-background"
      >
        <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="relative mx-auto max-w-7xl">
            <SectionTitle
              className={REVEAL}
              lead="O que uma parceria"
              accent="pode ser"
            />

            <div
              className={cn(
                REVEAL,
                'delay-100 mt-8 grid max-w-[70ch] gap-5 text-body-md text-muted-foreground sm:text-body-lg',
              )}
            >
              <p>
                <strong className="text-foreground">Espaço.</strong> Sala com
                computador, aos sábados. É o formato que a escola usa hoje, e o
                que mais destrava turma nova.
              </p>
              <p>
                <strong className="text-foreground">Alcance.</strong> Levar a
                inscrição até onde a juventude já está: escola, secretaria,
                comunidade.
              </p>
              <p>
                <strong className="text-foreground">Apoio.</strong> Equipamento,
                material ou custeio de vaga para quem não teria como pagar.
              </p>
              <p>
                Se a sua instituição pode entrar por um desses caminhos, ou por
                outro que a gente ainda não pensou, a conversa começa no
                WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Some inteira se não houver parceiro: a página se sustenta sem ela, e
          uma grade vazia sob um título é pior que a ausência do bloco. */}
      {partners.data && partners.data.data.length > 0 && (
        <Partners partners={partners.data.data} />
      )}

      <WhatsappFloat message={PROPOSAL_MESSAGE} />
    </>
  )
}
