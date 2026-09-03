import type * as React from 'react'
import { createLazyFileRoute, getRouteApi } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CalendarBlank, Clock, MapPin, Users } from '@phosphor-icons/react'

import { Badge } from '#/components/ui/badge'
import { CardContent } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { Separator } from '#/components/ui/separator'
import { CircuitTrails, Leaf } from '#/components/common/marks'
import { SectionTitle } from '../-components/section-title'
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
import { cn } from '#/lib/utils'

const route = getRouteApi('/_public/courses/$slug')

export const Route = createLazyFileRoute('/_public/courses/$slug')({
  component: RouteComponent,
})

/**
 * A ilustração do curso, por `slug`. Mesmo mapa do card da home: a arte é
 * decisão de design e não coluna do banco.
 */
const ILLUSTRATIONS: Record<string, string> = {
  robotics: '/ilustracoes/robo-seguidor-de-linha.svg',
  'web-development': '/ilustracoes/notebook-com-codigo.svg',
}

const FALLBACK_ILLUSTRATION = '/ilustracoes/bancada-arduino.svg'

function RouteComponent(): React.JSX.Element {
  const { slug } = route.useParams()
  const { data: course } = useSuspenseQuery(storefrontCourseQueryOptions(slug))

  return (
    <>
      {/* A mesma faixa da home e da página institucional. */}
      <section className="relative overflow-hidden bg-brand-ink">
        <CircuitTrails className="text-neon/25" />
        <Leaf className="-top-24 -right-20 size-96 text-neon/5" />

        <div className="relative px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className={cn(REVEAL)}>
              {/* Contorno neon sobre o bloco, e não o par `foreground` que
                  inverte com o tema: aqui o fundo é fixo nos dois. */}
              <Badge className="h-6 border-neon/40 bg-transparent px-3 text-xs text-neon">
                Módulo 1
              </Badge>

              {/* O nome do curso vem do banco e não se parte em duas linhas
                  fixas, então aqui não cabe o `SectionTitle`. O que se
                  aproveita é a tipografia da marca. */}
              <h1 className="brand-title mt-5 max-w-[18ch] text-display-md text-balance text-white sm:text-display-lg lg:text-display-xl">
                {course.name}
              </h1>

              {course.tagline && (
                <p className="mt-6 max-w-[52ch] text-body-lg text-white/85">
                  {course.tagline}
                </p>
              )}

              <EnrollmentCta
                tone="neon"
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

      {/* Sangria total, como as seções da home: sem raio, sem borda e sem
          respiro lateral no invólucro. */}
      <section className="bg-background">
        <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <div className={cn(REVEAL)}>
              <SectionTitle lead="Sobre" accent="o curso" />

              <p className="mt-6 max-w-[52ch] text-body-md text-muted-foreground">
                {course.description}
              </p>

              {course.projectOutcome && (
                <div className="mt-8">
                  <p className="text-heading-sm text-foreground">
                    O que você vai construir
                  </p>
                  <p className="mt-2 max-w-[52ch] text-body-md text-muted-foreground">
                    {course.projectOutcome}
                  </p>
                </div>
              )}

              {course.requirements && (
                <div className="mt-8">
                  <p className="text-heading-sm text-foreground">
                    O que você precisa
                  </p>
                  <p className="mt-2 max-w-[52ch] text-body-md text-muted-foreground">
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
                      <p className="text-heading-sm text-foreground">
                        {entry.title}
                      </p>
                      {entry.description && (
                        <p className="mt-1.5 text-body-md text-muted-foreground">
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

      <section className="bg-card">
        <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle className={REVEAL} lead="Quanto" accent="custa" />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
              <SectionCard className={cn(REVEAL)}>
                <CardContent>
                  <p className="brand-title text-display-md leading-none text-foreground lg:text-display-lg">
                    {formatMoney(course.enrollmentFeeInCents)}
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    de inscrição, uma vez só.
                  </p>
                </CardContent>
              </SectionCard>

              <SectionCard className={cn(REVEAL, 'delay-100')}>
                <CardContent>
                  <p className="brand-title text-display-md leading-none text-foreground lg:text-display-lg">
                    {formatMoney(course.monthlyFeeInCents)}
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    por mês, durante os {course.durationMonths} meses.
                  </p>
                </CardContent>
              </SectionCard>
            </div>

            <Separator className="my-10 bg-border" />

            <p className="max-w-[60ch] text-body-md text-muted-foreground">
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
      {/*
        Branco literal, e não `--primary-foreground`.
        O token era o certo quando este bloco era verde: ali o par
        `primary`/`primary-foreground` casava. O bloco virou `--brand-ink`, que
        é escuro nos dois temas, e no tema **escuro** o `--primary` é o neon -
        logo o `--primary-foreground` dele é quase preto. Dava 1,19:1, medido:
        o rótulo e o valor sumiam para quem estava no escuro e apareciam para
        quem estava no claro.
      */}
      <dt className="inline-flex items-center gap-2 text-sm text-white/70 [&_svg]:size-4 [&_svg]:text-neon/70">
        {icon}
        {label}
      </dt>
      <dd className="text-heading-sm text-white">{children}</dd>
    </div>
  )
}
