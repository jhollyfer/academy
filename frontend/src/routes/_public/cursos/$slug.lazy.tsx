import type * as React from 'react'
import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarBlank, Clock, MapPin, Users } from '@phosphor-icons/react'
import { storefrontCourseQueryOptions } from '#/integrations/tanstack-query/queries'
import { Button } from '#/components/ui/button'
import { CircuitBackground } from '#/components/common/neon'
import { formatDate, formatMoney } from '#/lib/format'
import { Faq } from '../-components/faq'
import { Reveal } from '../-components/reveal'
import { WhatsappFloat } from '../-components/whatsapp-float'
import { Route as CourseRoute } from './$slug'

export const Route = createLazyFileRoute('/_public/cursos/$slug')({
  component: RouteComponent,
})

function RouteComponent(): React.JSX.Element {
  const { slug } = CourseRoute.useParams()
  const { data: course } = useSuspenseQuery(storefrontCourseQueryOptions(slug))

  return (
    <div data-accent={course.accent}>
      <section className="relative overflow-hidden border-b border-white/5">
        <CircuitBackground />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-16 lg:pt-24">
          <h1 className="max-w-[18ch] font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-balance italic sm:text-5xl lg:text-6xl">
            {course.name}
          </h1>

          {course.tagline && (
            <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
              {course.tagline}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button render={<Link to="/matricula" search={{ curso: course.slug }} />} size="lg">
              Garanta sua vaga
              <ArrowRight />
            </Button>
          </div>

          {/*
            Os fatos da turma como uma faixa, e não como quatro cards: são quatro
            valores curtos, e envolvê-los em caixas pediria elevação que não
            comunica hierarquia nenhuma.
          */}
          <dl className="mt-12 grid gap-6 border-t border-white/5 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <Fact icon={<Clock />} label="Carga horária">
              {course.workloadHours}h em {course.durationMonths} meses
            </Fact>
            {course.nextClass && (
              <>
                <Fact icon={<CalendarBlank />} label="Começa em">
                  {formatDate(course.nextClass.startsAt)}
                </Fact>
                <Fact icon={<Users />} label="Vagas restantes">
                  {course.nextClass.seatsRemaining} de {course.nextClass.capacity}
                </Fact>
                <Fact icon={<MapPin />} label="Onde">
                  {course.nextClass.location}
                </Fact>
              </>
            )}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight italic sm:text-4xl">
              Sobre o <span className="text-[var(--local-accent,var(--accent))]">curso</span>
            </h2>
            <p className="mt-6 max-w-[52ch] leading-relaxed text-muted-foreground">
              {course.description}
            </p>

            {course.projectOutcome && (
              <div className="mt-8">
                <p className="font-display text-xl font-bold italic">O que você vai construir</p>
                <p className="mt-3 max-w-[52ch] leading-relaxed text-muted-foreground">
                  {course.projectOutcome}
                </p>
              </div>
            )}

            {course.requirements && (
              <div className="mt-8">
                <p className="font-display text-xl font-bold italic">O que você precisa</p>
                <p className="mt-3 max-w-[52ch] leading-relaxed text-muted-foreground">
                  {course.requirements}
                  {course.minimumAge !== null && ` A partir de ${course.minimumAge} anos.`}
                </p>
              </div>
            )}
          </div>

          {/*
            A grade dos sábados, numerada. É o gesto da referência: número grande
            no acento à direita de um título à esquerda, e o número faz o papel
            que um marcador de lista faria pior - aqui a ordem é o conteúdo.
          */}
          {course.modules && course.modules.length > 0 && (
            <ol className="grid gap-8">
              {course.modules.map((entry, index) => (
                <Reveal key={entry.id} delay={index * 0.04}>
                  <li className="grid grid-cols-[auto_1fr] gap-5">
                    <span
                      aria-hidden
                      className="font-display text-2xl leading-none font-extrabold text-[var(--local-accent,var(--accent))] italic tabular-nums"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold tracking-tight italic">
                        {entry.title}
                      </p>
                      {entry.description && (
                        <p className="mt-1.5 leading-relaxed text-muted-foreground">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="border-y border-white/5 bg-surface/30">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
          <h2 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight italic sm:text-4xl">
            Quanto <span className="text-[var(--local-accent,var(--accent))]">custa</span>
          </h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:max-w-3xl">
            <div>
              <p className="font-display text-5xl leading-none font-extrabold text-[var(--local-accent,var(--accent))] italic lg:text-6xl">
                {formatMoney(course.enrollmentFeeInCents)}
              </p>
              <p className="mt-3 text-muted-foreground">de inscrição, uma vez só.</p>
            </div>
            <div>
              <p className="font-display text-5xl leading-none font-extrabold text-[var(--local-accent,var(--accent))] italic lg:text-6xl">
                {formatMoney(course.monthlyFeeInCents)}
              </p>
              <p className="mt-3 text-muted-foreground">
                por mês, durante os {course.durationMonths} meses.
              </p>
            </div>
          </div>

          <Button
            render={<Link to="/matricula" search={{ curso: course.slug }} />}
            size="lg"
            className="mt-10"
          >
            Garanta sua vaga
            <ArrowRight />
          </Button>
        </div>
      </section>

      {course.faqs && course.faqs.length > 0 && (
        <Faq faqs={course.faqs} title="Dúvidas sobre" highlight="este curso" />
      )}

      <WhatsappFloat
        message={`Olá! Quero saber mais sobre o curso de ${course.name} na Maiyu Academy.`}
      />
    </div>
  )
}

function Fact({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="inline-flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4 [&_svg]:text-[var(--local-accent,var(--accent))]">
        {icon}
        {label}
      </dt>
      <dd className="font-display text-lg font-bold tracking-tight italic">{children}</dd>
    </div>
  )
}
