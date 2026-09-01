import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarBlank, Clock, Users } from '@phosphor-icons/react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardTitle } from '#/components/ui/card'
import { Highlight } from '#/components/common/highlight'
import { formatDate, formatMoney } from '#/lib/format'
import { REVEAL, STAGGER } from './reveal'
import { cn } from '#/lib/utils'
import type { CourseResponse } from '#/integrations/response'

/**
 * A ilustração de cada curso, por `slug`.
 *
 * Um mapa e não uma coluna no banco: a arte é decisão de design e vive com o
 * design. Curso novo sem entrada aqui cai no fallback e não fica sem imagem.
 */
const ILLUSTRATIONS: Record<string, string> = {
  robotica: '/ilustracoes/robo-seguidor-de-linha.svg',
  'web-development': '/ilustracoes/notebook-com-codigo.svg',
}

const FALLBACK_ILLUSTRATION = '/ilustracoes/bancada-arduino.svg'

/**
 * Os dois cursos, na única seção escura da página.
 *
 * Full-bleed e não bloco com margem: é a quebra de ritmo do sistema, e ela cai
 * bem no meio da página, onde a leitura precisa de um respiro do creme.
 *
 * Tudo que é número vem do curso e da turma - carga horária, data, vagas, preço.
 * A versão anterior desta seção anunciava vagas a partir de `nextClass`, que a
 * listagem nunca populava, e o card ficava mudo sobre a turma que existia.
 */
export function CourseCards({
  courses,
}: {
  courses: ReadonlyArray<CourseResponse>
}): React.JSX.Element {
  return (
    <section
      data-slot="home-courses"
      id="cursos"
      className="mt-3 scroll-mt-20 bg-ink px-4 py-20 sm:mt-4 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          className={cn(
            REVEAL,
            'max-w-[16ch] text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-cream sm:text-4xl lg:text-5xl',
          )}
        >
          Dois cursos, uma <Highlight variant="fill">turma</Highlight> só
        </h2>

        <p
          className={cn(
            REVEAL,
            'delay-100 mt-6 max-w-[64ch] text-base leading-relaxed text-cream/70 sm:text-lg',
          )}
        >
          Cada curso é o módulo 1 de uma trilha, e é completo por si. No fim
          você tem um projeto seu, pronto e apresentado.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {courses.map((course, index) => (
            <Card
              key={course.id}
              size="lg"
              className={cn(REVEAL, 'h-full')}
              style={{ animationDelay: `${index * STAGGER}ms` }}
            >
              <img
                src={ILLUSTRATIONS[course.slug] ?? FALLBACK_ILLUSTRATION}
                alt=""
                width={400}
                height={300}
                loading="lazy"
                className="h-48 w-full bg-cream object-contain p-6 sm:h-56"
              />

              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="green" size="lg">
                    Módulo 1
                  </Badge>

                  {course.nextClass && (
                    <Badge
                      variant="outline"
                      size="lg"
                      className="border-line-strong text-ink-soft"
                    >
                      <Users />
                      {course.nextClass.seatsRemaining ??
                        course.nextClass.capacity}{' '}
                      de {course.nextClass.capacity} vagas
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-2xl font-semibold tracking-tight text-ink">
                  {course.name}
                </CardTitle>

                {course.tagline && (
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {course.tagline}
                  </p>
                )}

                <dl className="mt-1 grid gap-2 text-sm text-ink-soft">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-neon-ink" />
                    <dt className="sr-only">Carga horária</dt>
                    <dd>
                      {course.workloadHours}h em {course.durationMonths} meses,
                      16 sábados
                    </dd>
                  </div>

                  {course.nextClass && (
                    <div className="flex items-center gap-2">
                      <CalendarBlank className="size-4 text-neon-ink" />
                      <dt className="sr-only">Início</dt>
                      <dd>Começa em {formatDate(course.nextClass.startsAt)}</dd>
                    </div>
                  )}
                </dl>

                {/* `mt-auto` prende o preço e o botão na base, para os dois cards
                    terminarem na mesma linha mesmo com taglines de tamanhos
                    diferentes. */}
                <div className="mt-auto pt-4">
                  <p className="text-2xl font-semibold tracking-tight text-ink">
                    {formatMoney(course.monthlyFeeInCents)}
                    <span className="ml-1 text-sm font-normal text-ink-soft">
                      por mês
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Mais {formatMoney(course.enrollmentFeeInCents)} de
                    inscrição, uma vez só.
                  </p>

                  <Button
                    variant="pill-green"
                    size="pill"
                    className="mt-5 w-full"
                    render={
                      <Link to="/cursos/$slug" params={{ slug: course.slug }}>
                        Ver o curso
                        <ArrowRight />
                      </Link>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
