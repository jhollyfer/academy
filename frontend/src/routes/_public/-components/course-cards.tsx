import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarBlank, Clock, Users } from '@phosphor-icons/react'

import { Badge } from '#/components/ui/badge'
import { PillButton } from '#/components/common/pill-button'
import { CardContent, CardTitle } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { Highlight } from '#/components/common/highlight'
import { formatDate, formatMoney } from '#/lib/format'
import { courseIllustration } from '#/lib/course-illustration'
import {
  courseCapacity,
  courseClasses,
  courseSeatsRemaining,
  formatTimeRange,
} from '#/lib/enrollment-state'
import { REVEAL, STAGGER } from './reveal'
import { cn } from '#/lib/utils'
import type { CourseResponse } from '#/integrations/response'

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
      className="mt-3 scroll-mt-20 bg-foreground dark:bg-card px-4 py-20 sm:mt-4 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <h2
          className={cn(
            REVEAL,
            'display-title max-w-[16ch] text-heading-lg font-semibold text-balance text-background dark:text-card-foreground sm:text-display-md lg:text-display-lg',
          )}
        >
          Dois cursos, uma <Highlight variant="slab">turma</Highlight> só
        </h2>

        <p
          className={cn(
            REVEAL,
            'delay-100 mt-6 max-w-[64ch] text-body-md text-background/70 dark:text-muted-foreground sm:text-body-lg',
          )}
        >
          Cada curso é o módulo 1 de uma trilha, e é completo por si. No fim
          você tem um projeto seu, pronto e apresentado.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {courses.map((course, index) => (
            <SectionCard
              key={course.id}
              className={cn(REVEAL, 'h-full')}
              style={{ animationDelay: `${index * STAGGER}ms` }}
            >
              <img
                src={courseIllustration(course.slug)}
                alt=""
                width={400}
                height={300}
                loading="lazy"
                className="h-48 w-full bg-background object-contain p-6 sm:h-56"
              />

              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="h-6 px-3 text-xs">Módulo 1</Badge>

                  {courseClasses(course).length > 0 && (
                    <SeatsBadge course={course} />
                  )}
                </div>

                <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                  {course.name}
                </CardTitle>

                {course.tagline && (
                  <p className="text-body-sm text-muted-foreground">
                    {course.tagline}
                  </p>
                )}

                <dl className="mt-1 grid gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <dt className="sr-only">Carga horária</dt>
                    <dd>
                      {course.workloadHours}h em {course.durationMonths} meses,
                      16 sábados
                    </dd>
                  </div>

                  {course.nextClass && (
                    <div className="flex items-center gap-2">
                      <CalendarBlank className="size-4 text-muted-foreground" />
                      <dt className="sr-only">Início</dt>
                      <dd>Começa em {formatDate(course.nextClass.startsAt)}</dd>
                    </div>
                  )}

                  {/*
                    Uma linha por turma, e não só a próxima: são duas de
                    programação e três de robótica, e o horário é o que separa
                    uma da outra. O card que mostrava só a primeira escondia as
                    outras de quem escolhe pelo horário que cabe na semana.
                  */}
                  {courseClasses(course).map((entity) => (
                    <div key={entity.id} className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <dt className="sr-only">Turma</dt>
                      <dd>
                        {formatTimeRange(
                          entity.startsAtTime,
                          entity.endsAtTime,
                        ) || entity.name}
                        {entity.seatsRemaining !== undefined &&
                          ` · ${entity.seatsRemaining} vagas`}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* `mt-auto` prende o preço e o botão na base, para os dois cards
                    terminarem na mesma linha mesmo com taglines de tamanhos
                    diferentes. */}
                <div className="mt-auto pt-4">
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    {formatMoney(course.monthlyFeeInCents)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      por mês
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Mais {formatMoney(course.enrollmentFeeInCents)} de
                    inscrição, uma vez só.
                  </p>

                  <PillButton
                    tone="slab"
                    scale="md"
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
            </SectionCard>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Quantas vagas sobraram, e a cor que diz se ainda dá tempo.
 *
 * Dois estados e não três. O desenho pedia um âmbar no meio - "acabando" -, e
 * âmbar não existe na camada semântica do shadcn: entrariam um `--warning` e um
 * `--warning-foreground` só para este badge, e este projeto não tem token fora
 * dos nomes que o shadcn define. Com turma de quarenta lugares, "3 de 40" já se
 * lê no próprio número.
 *
 * `destructive` quando zera, e a frase não muda: quem lê "0 de 40" não precisa
 * de outra palavra para entender, e trocar a copy seria mudar conteúdo.
 */
function SeatsBadge({ course }: { course: CourseResponse }): React.JSX.Element {
  const remaining = courseSeatsRemaining(course)

  let variant: React.ComponentProps<typeof Badge>['variant'] = 'outline'
  if (remaining === 0) variant = 'destructive'

  return (
    <Badge variant={variant} className="h-6 px-3 text-xs">
      <Users />
      {remaining} de {courseCapacity(course)} vagas
    </Badge>
  )
}
