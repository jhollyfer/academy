import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarBlank, Clock, MapPin, Path } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { Highlight } from '#/components/common/highlight'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { enrollmentStateFrom } from '#/lib/enrollment-state'
import { formatDate } from '#/lib/format'
import { ADDRESS, whatsappUrl } from '#/lib/site'
import { REVEAL } from './reveal'
import { cn } from '#/lib/utils'

const DIRECTIONS_MESSAGE =
  'Olá! Quero saber onde ficam as aulas da Maiyu Academy e como chegar.'

/**
 * Onde e quando, num bloco só.
 *
 * A escola ainda não fechou o logradouro nem o horário exato, e a página diz
 * isso em vez de arredondar. Anunciar rua errada é pior que não anunciar
 * nenhuma, porque alguém vai até lá - e é por isso que o "como chegar" manda
 * falar com a secretaria em vez de mostrar um mapa que apontaria para o lugar
 * errado.
 *
 * TODO: preencher o logradouro em `ADDRESS.street` e trocar o horário por
 * "das 8h às 10h" quando a secretaria fechar os dois.
 */
export function WhereAndWhen(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())
  const state = enrollmentStateFrom(data?.data)

  let start = 'A definir com a próxima turma.'
  if (state.kind !== 'NONE') start = formatDate(state.startsAt)

  const rows: ReadonlyArray<{ icon: Icon; term: string; value: string }> = [
    { icon: Clock, term: 'Aulas', value: 'Sábados de manhã.' },
    {
      icon: MapPin,
      term: 'Endereço',
      value: `Secretaria, em ${ADDRESS.city}, ${ADDRESS.state}.`,
    },
    { icon: CalendarBlank, term: 'Início', value: start },
    { icon: Path, term: 'Duração', value: '16 sábados, 4 meses, 32 horas.' },
  ]

  return (
    <section
      data-slot="home-where-and-when"
      className="px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="rounded-block border border-line bg-paper px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <h2
            className={cn(
              REVEAL,
              'text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl',
            )}
          >
            Onde e <Highlight variant="fill">quando</Highlight>
          </h2>

          <div className={cn(REVEAL, 'delay-100')}>
            <dl className="grid gap-5">
              {rows.map((row, index) => (
                <div key={row.term}>
                  {index > 0 && <Separator className="mb-5 bg-line" />}

                  <div className="flex items-start gap-4">
                    <row.icon
                      weight="duotone"
                      aria-hidden
                      className="mt-0.5 size-6 shrink-0 text-neon-ink"
                    />
                    <div>
                      <dt className="text-sm font-medium text-ink">
                        {row.term}
                      </dt>
                      <dd className="mt-0.5 text-base leading-relaxed text-ink-soft">
                        {row.value}
                      </dd>
                    </div>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-9 rounded-card bg-cream px-6 py-6">
              <p className="text-base leading-relaxed text-ink-soft">
                O endereço completo ainda está sendo confirmado. Fale com a
                secretaria pelo WhatsApp e ela envia a localização.
              </p>

              <Button
                variant="pill-outline"
                size="pill"
                className="mt-5"
                render={
                  <a
                    href={whatsappUrl(DIRECTIONS_MESSAGE)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Pedir a localização
                  </a>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
