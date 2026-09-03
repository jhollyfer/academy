import type * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarBlank, Clock, Users } from '@phosphor-icons/react'

import { Badge } from '#/components/ui/badge'
import { PillButton } from '#/components/common/pill-button'
import { CardContent, CardTitle } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { formatDate, formatMoney } from '#/lib/format'
import { courseIllustration } from '#/lib/course-illustration'
import {
  courseCapacity,
  courseClasses,
  courseSeatsRemaining,
  formatTimeRange,
} from '#/lib/enrollment-state'
import { REVEAL, STAGGER } from './reveal'
import { SectionTitle } from './section-title'
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
/**
 * Os cards usam a paleta da marca, e não os tokens do tema.
 *
 * A faixa é `--brand-ink` nos dois temas, e o `bg-card` do `SectionCard` só
 * funcionava no claro: no escuro virava cinza quente sobre preto esverdeado,
 * com pouco mais de 1:1 de separação, e o bloco inteiro empapuçava. O
 * `--muted-foreground` do texto vinha do mesmo lugar e tinha o mesmo defeito.
 *
 * O tratamento é o dos cards da seção de mercado: borda fina neon, fundo
 * `--brand-ink-soft`, brilho só na borda, texto branco em duas opacidades.
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
      className="scroll-mt-20 bg-brand-ink px-4 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          tone="ink"
          className={REVEAL}
          lead="Dois cursos,"
          accent="uma turma só"
        />

        <p
          className={cn(
            REVEAL,
            'delay-100 mt-6 max-w-[64ch] text-body-md text-white/70 sm:text-body-lg',
          )}
        >
          Cada curso é o módulo 1 de uma trilha, e é completo por si. No fim
          você tem um projeto seu, pronto e apresentado.
        </p>

        {/*
          O roteiro, e marcado como roteiro. "Entram nas próximas turmas" é
          futuro explícito: sem essa marca a frase leria como catálogo, e alguém
          se inscreveria esperando uma turma de segurança que ainda não existe.
          Os cards acima continuam sendo a única lista do que dá para matricular
          hoje.
        */}
        <p
          className={cn(
            REVEAL,
            'delay-200 mt-3 max-w-[64ch] text-body-sm text-white/60',
          )}
        >
          Começamos por robótica e desenvolvimento web. Análise de dados,
          segurança e inteligência artificial entram nas próximas turmas.
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {courses.map((course, index) => (
            <SectionCard
              key={course.id}
              className={cn(
                REVEAL,
                'h-full border-neon/25 bg-brand-ink-soft text-white shadow-[0_0_24px_-14px_var(--neon)]',
              )}
              style={{ animationDelay: `${index * STAGGER}ms` }}
            >
              <img
                src={courseIllustration(course.slug)}
                alt=""
                width={400}
                height={300}
                loading="lazy"
                className="h-48 w-full bg-brand-ink object-contain p-6 sm:h-56"
              />

              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="h-6 border-neon/40 bg-transparent px-3 text-xs text-neon">
                    Módulo 1
                  </Badge>

                  {courseClasses(course).length > 0 && (
                    <SeatsBadge course={course} />
                  )}
                </div>

                <CardTitle className="text-2xl font-semibold tracking-tight text-white">
                  {course.name}
                </CardTitle>

                {course.tagline && (
                  <p className="text-body-sm text-white/70">{course.tagline}</p>
                )}

                <dl className="mt-1 grid gap-2 text-sm text-white/75">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-neon/70" />
                    <dt className="sr-only">Carga horária</dt>
                    <dd>
                      {course.workloadHours}h em {course.durationMonths} meses,
                      16 sábados
                    </dd>
                  </div>

                  {course.nextClass && (
                    <div className="flex items-center gap-2">
                      <CalendarBlank className="size-4 text-neon/70" />
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
                      <Clock className="size-4 text-neon/70" />
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
                  <p className="text-2xl font-semibold tracking-tight text-white">
                    {formatMoney(course.monthlyFeeInCents)}
                    <span className="ml-1 text-sm font-normal text-white/60">
                      por mês
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    Mais {formatMoney(course.enrollmentFeeInCents)} de
                    inscrição, uma vez só.
                  </p>

                  <PillButton
                    tone="neon-outline"
                    scale="md"
                    className="mt-5 w-full"
                    render={
                      <Link to="/courses/$slug" params={{ slug: course.slug }}>
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

  /*
   * Classe explícita e não `variant` do tema, pelo motivo do card inteiro: o
   * `outline` do registry é `border-border` mais `text-foreground`, e o
   * `--foreground` do tema claro é quase preto. Sobre este card, que é escuro
   * nos dois temas, o selo sumia no claro e aparecia no escuro - o mesmo texto,
   * legível ou não conforme a preferência de quem visita.
   *
   * Zerado vira `warning` e não `destructive`: turma cheia não é erro, é a
   * turma funcionando. O vermelho fica para o que pede correção.
   */
  let classe = 'border-white/25 bg-white/5 text-white/80'
  if (remaining === 0) {
    classe =
      'border-badge-warning-foreground/40 bg-transparent text-badge-warning-foreground'
  }

  return (
    <Badge className={cn('h-6 px-3 text-xs', classe)}>
      <Users />
      {remaining} de {courseCapacity(course)} vagas
    </Badge>
  )
}
