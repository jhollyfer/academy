import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Clock, Users } from '@phosphor-icons/react'
import {
  NeonCard,
  NeonCardDescription,
  NeonCardFooter,
  NeonCardTitle,
  SectionTitle,
} from '#/components/common/neon'
import { formatMoney, formatMonthYear } from '#/lib/format'
import { Reveal } from './reveal'
import type { CourseResponse } from '#/integrations/response'

/**
 * Os dois cursos, lado a lado.
 *
 * Dois cards e não três: são dois cursos. Um terceiro card vazio para "fechar a
 * grade" seria a grade mandando no conteúdo.
 *
 * Nenhum dos dois é preenchido em verde: o card cheio é o gesto de hierarquia da
 * referência, e usá-lo aqui diria que um curso vale mais que o outro. A escola
 * abre os dois na mesma turma, pelo mesmo preço.
 */
export function CourseCards({ courses }: { courses: Array<CourseResponse> }): React.JSX.Element {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
      <SectionTitle eyebrow="Turma de estreia" first="Dois cursos," second="uma turma só" />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {courses.map((course, index) => (
          <Reveal key={course.id} delay={index * 0.08}>
            <NeonCard accent={course.accent} className="h-full gap-5">
              <NeonCardTitle className="text-2xl">{course.name}</NeonCardTitle>

              {course.tagline && <NeonCardDescription>{course.tagline}</NeonCardDescription>}

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-4 text-[var(--local-accent,var(--accent))]" />
                  {course.workloadHours}h em {course.durationMonths} meses
                </span>
                {course.nextClass && (
                  <span className="inline-flex items-center gap-2">
                    <Users className="size-4 text-[var(--local-accent,var(--accent))]" />
                    {course.nextClass.seatsRemaining} vagas restantes
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                <span className="font-display text-2xl font-extrabold text-foreground italic">
                  {formatMoney(course.monthlyFeeInCents)}
                </span>{' '}
                por mês, mais {formatMoney(course.enrollmentFeeInCents)} de inscrição
                {course.nextClass && `. Começa em ${formatMonthYear(course.nextClass.startsAt)}`}.
              </p>

              <NeonCardFooter>
                <Link
                  to="/cursos/$slug"
                  params={{ slug: course.slug }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[var(--local-accent,var(--accent))] hover:underline"
                >
                  Ver o curso
                  <ArrowRight className="size-4" />
                </Link>
              </NeonCardFooter>
            </NeonCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
