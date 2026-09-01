import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CalendarBlank, Clock, MapPin, Users } from '@phosphor-icons/react'

import { Badge } from '#/components/ui/badge'
import { CardContent } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { Separator } from '#/components/ui/separator'
import { Highlight } from '#/components/common/highlight'
import { Leaf } from '#/components/common/marks'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { storefrontCourseQueryOptions } from '#/integrations/tanstack-query/queries'
import { formatDate, formatMoney } from '#/lib/format'
import {
  courseCapacity,
  courseSeatsRemaining,
  courseTimesLabel,
} from '#/lib/enrollment-state'
import { Faq } from '../-components/faq'
import { REVEAL, STAGGER } from '../-components/reveal'
import { WhatsappFloat } from '../-components/whatsapp-float'
import { Route as CourseRoute } from './$slug'
import { cn } from '#/lib/utils'

export const Route = createLazyFileRoute('/_public/cursos/$slug')({
  component: RouteComponent,
})

/**
 * A ilustração do curso, por `slug`. Mesmo mapa do card da home: a arte é
 * decisão de design e não coluna do banco.
 */
const ILLUSTRATIONS: Record<string, string> = {
  robotica: '/ilustracoes/robo-seguidor-de-linha.svg',
  'web-development': '/ilustracoes/notebook-com-codigo.svg',
}

const FALLBACK_ILLUSTRATION = '/ilustracoes/bancada-arduino.svg'

function RouteComponent(): React.JSX.Element {
  const { slug } = CourseRoute.useParams()
  const { data: course } = useSuspenseQuery(storefrontCourseQueryOptions(slug))

  return (
    <>
      <section className="px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="relative overflow-hidden rounded-block bg-primary px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
          <Leaf className="-top-24 -right-20 size-96 text-primary-foreground/5" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className={cn(REVEAL)}>
              <Badge className="h-6 border-transparent bg-foreground px-3 text-xs text-background">
                Módulo 1
              </Badge>

              <h1 className="mt-5 max-w-[18ch] text-4xl leading-[1.12] font-semibold tracking-tight text-balance text-primary-foreground sm:text-5xl lg:text-6xl">
                {course.name}
              </h1>

              {course.tagline && (
                <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-primary-foreground">
                  {course.tagline}
                </p>
              )}

              <EnrollmentCta
                tone="ink"
                scale="lg"
                className="mt-8"
                courseSlug={course.slug}
              />
            </div>

            <img
              src={ILLUSTRATIONS[course.slug] ?? FALLBACK_ILLUSTRATION}
              alt=""
              width={400}
              height={300}
              loading="eager"
              fetchPriority="high"
              className={cn(
                REVEAL,
                'delay-100 w-full max-w-sm justify-self-center',
              )}
            />
          </div>

          {/*
            Os fatos da turma como faixa, e não como quatro cards: são quatro
            valores curtos, e envolvê-los em caixas pediria elevação que não
            comunica hierarquia nenhuma.
          */}
          <dl className="relative mx-auto mt-12 grid max-w-7xl gap-6 border-t border-primary-foreground/15 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            <Fact icon={<Clock />} label="Carga horária">
              {course.workloadHours}h em {course.durationMonths} meses
            </Fact>

            {course.nextClass && (
              <>
                <Fact icon={<CalendarBlank />} label="Começa em">
                  {formatDate(course.nextClass.startsAt)}
                </Fact>
                {/*
                  Vagas e horários somados sobre todas as turmas do curso: são
                  duas de manhã ou três à tarde, e quem lê a faixa quer saber se
                  cabe alguém no curso, não numa turma específica. A escolha da
                  turma é o primeiro passo da matrícula.
                */}
                <Fact icon={<Users />} label="Vagas restantes">
                  {courseSeatsRemaining(course)} de {courseCapacity(course)}
                </Fact>
                <Fact icon={<Clock />} label="Turmas">
                  {courseTimesLabel(course)}
                </Fact>
                <Fact icon={<MapPin />} label="Onde">
                  {course.nextClass.location}
                </Fact>
              </>
            )}
          </dl>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="rounded-block border border-border bg-background px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div className={cn(REVEAL)}>
              <h2 className="text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
                Sobre o <Highlight variant="outline">curso</Highlight>
              </h2>

              <p className="mt-6 max-w-[52ch] leading-relaxed text-muted-foreground">
                {course.description}
              </p>

              {course.projectOutcome && (
                <div className="mt-8">
                  <p className="text-lg font-semibold text-foreground">
                    O que você vai construir
                  </p>
                  <p className="mt-2 max-w-[52ch] leading-relaxed text-muted-foreground">
                    {course.projectOutcome}
                  </p>
                </div>
              )}

              {course.requirements && (
                <div className="mt-8">
                  <p className="text-lg font-semibold text-foreground">
                    O que você precisa
                  </p>
                  <p className="mt-2 max-w-[52ch] leading-relaxed text-muted-foreground">
                    {course.requirements}
                    {course.minimumAge !== null &&
                      ` A partir de ${course.minimumAge} anos.`}
                  </p>
                </div>
              )}
            </div>

            {/*
              A grade dos sábados, numerada. O número faz o papel que um marcador
              de lista faria pior: aqui a ordem é o conteúdo.
            */}
            {course.modules && course.modules.length > 0 && (
              <ol className="grid gap-7">
                {course.modules.map((entry, index) => (
                  <li
                    key={entry.id}
                    className={cn(REVEAL, 'grid grid-cols-[auto_1fr] gap-5')}
                    style={{ animationDelay: `${index * (STAGGER / 2)}ms` }}
                  >
                    <span
                      aria-hidden
                      className="text-2xl leading-none font-semibold text-foreground tabular-nums"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-foreground">
                        {entry.title}
                      </p>
                      {entry.description && (
                        <p className="mt-1.5 leading-relaxed text-muted-foreground">
                          {entry.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </section>

      <section className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="rounded-block border border-border bg-card px-6 py-16 sm:px-10 lg:px-14 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2
              className={cn(
                REVEAL,
                'text-3xl leading-[1.15] font-semibold tracking-tight text-balance text-foreground sm:text-4xl',
              )}
            >
              Quanto <Highlight variant="fill">custa</Highlight>
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
              <SectionCard className={cn(REVEAL)}>
                <CardContent>
                  <p className="text-4xl leading-none font-semibold tracking-tight text-foreground lg:text-5xl">
                    {formatMoney(course.enrollmentFeeInCents)}
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    de inscrição, uma vez só.
                  </p>
                </CardContent>
              </SectionCard>

              <SectionCard className={cn(REVEAL, 'delay-100')}>
                <CardContent>
                  <p className="text-4xl leading-none font-semibold tracking-tight text-foreground lg:text-5xl">
                    {formatMoney(course.monthlyFeeInCents)}
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    por mês, durante os {course.durationMonths} meses.
                  </p>
                </CardContent>
              </SectionCard>
            </div>

            <Separator className="my-10 bg-border" />

            <p className="max-w-[60ch] leading-relaxed text-muted-foreground">
              O pagamento é por Pix. Você envia o comprovante junto com a
              matrícula e a secretaria confirma.
            </p>

            <EnrollmentCta
              tone="ink"
              scale="lg"
              className="mt-8"
              courseSlug={course.slug}
            />
          </div>
        </div>
      </section>

      {course.faqs && course.faqs.length > 0 && (
        <Faq faqs={course.faqs} title="Dúvidas sobre" highlight="curso" />
      )}

      <WhatsappFloat
        message={`Olá! Quero saber mais sobre o curso de ${course.name} na Maiyu Academy.`}
      />
    </>
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
      <dt className="inline-flex items-center gap-2 text-sm text-primary-foreground [&_svg]:size-4">
        {icon}
        {label}
      </dt>
      <dd className="text-lg font-semibold tracking-tight text-primary-foreground">
        {children}
      </dd>
    </div>
  )
}
