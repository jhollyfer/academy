import type * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Buildings,
  CalendarBlank,
  Clock,
  MapPin,
  Path,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

import { PillButton } from '#/components/common/pill-button'
import { Separator } from '#/components/ui/separator'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { enrollmentStateFrom, scheduleSummary } from '#/lib/enrollment-state'
import { formatDate } from '#/lib/format'
import { CAMPUS, ENROLLMENT_DESK, whatsappUrl } from '#/lib/site'
import { REVEAL } from './reveal'
import { SectionTitle } from './section-title'
import { cn } from '#/lib/utils'

const DIRECTIONS_MESSAGE =
  'Olá! Quero saber onde ficam as aulas da Maiyu Academy e como chegar.'

/**
 * Onde e quando, num bloco só.
 *
 * São dois prédios, e o bloco diz os dois em linhas separadas: as aulas no
 * CETI, a inscrição presencial no balcão da FAMETRO. Separá-los é o ponto - a
 * página dizia "no mesmo endereço das aulas", e quem leu aquilo iria ao prédio
 * errado.
 *
 * O logradouro continua de fora, e por isso o "como chegar" continua mandando
 * falar com a secretaria: um mapa cravado no número errado leva alguém à
 * calçada errada, que é pior do que não mostrar mapa nenhum.
 */
export function WhereAndWhen(): React.JSX.Element {
  const { data } = useQuery(storefrontCoursesQueryOptions())
  const state = enrollmentStateFrom(data?.data)

  const summary = scheduleSummary(data?.data)

  let start = 'A definir com a próxima turma.'
  if (state.kind !== 'NONE') start = formatDate(state.startsAt)

  // "Sábados, das 08h às 20h." O intervalo é o das turmas anunciadas: com uma
  // turma de manhã ele diz manhã, com cinco espalhadas ele diz o dia inteiro.
  let lessons = 'Sábados.'
  if (summary.timesLabel) lessons = `Sábados, das ${summary.timesLabel}.`
  else if (summary.shiftsLabel) lessons = `Sábados de ${summary.shiftsLabel}.`

  const rows: ReadonlyArray<{ icon: Icon; term: string; value: string }> = [
    { icon: Clock, term: 'Aulas', value: lessons },
    {
      icon: MapPin,
      term: 'Onde',
      value: `${CAMPUS.name}, em ${CAMPUS.city}, ${CAMPUS.state}.`,
    },
    {
      icon: Buildings,
      term: 'Inscrição',
      value: `Aqui pelo site, ou no balcão da ${ENROLLMENT_DESK.name}.`,
    },
    { icon: CalendarBlank, term: 'Início', value: start },
    { icon: Path, term: 'Duração', value: '16 sábados, 4 meses, 32 horas.' },
  ]

  return (
    <section data-slot="home-where-and-when" className="bg-card">
      {/*
        Sangria total, como as faixas escuras: sem raio, sem borda e sem
        respiro lateral no invólucro. O recuo que sobra é o do conteúdo,
        no `mx-auto max-w-7xl` de dentro.
      */}
      <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-20">
          <SectionTitle className={REVEAL} lead="Onde e" accent="quando" />

          <div className={cn(REVEAL, 'delay-100')}>
            <dl className="grid gap-5">
              {rows.map((row, index) => (
                <div key={row.term}>
                  {index > 0 && <Separator className="mb-5 bg-border" />}

                  <div className="flex items-start gap-4">
                    <row.icon
                      weight="regular"
                      aria-hidden
                      className="mt-0.5 size-6 shrink-0 text-foreground"
                    />
                    <div>
                      <dt className="text-sm font-medium text-foreground">
                        {row.term}
                      </dt>
                      <dd className="mt-0.5 text-body-md text-muted-foreground">
                        {row.value}
                      </dd>
                    </div>
                  </div>
                </div>
              ))}
            </dl>

            <div className="mt-9 rounded-card bg-background px-6 py-6">
              <p className="text-body-md text-muted-foreground">
                Os dois prédios são referência na cidade. Se precisar de um
                ponto de chegada, a secretaria envia a localização pelo
                WhatsApp.
              </p>

              <PillButton
                tone="outline"
                scale="md"
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
