import type * as React from 'react'
import { Link, createLazyFileRoute, getRouteApi } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  CalendarBlank,
  Clock,
  MapPin,
  Users,
  WhatsappLogo,
} from '@phosphor-icons/react'

import { Badge } from '#/components/ui/badge'
import { CardContent } from '#/components/ui/card'
import { SectionCard } from '#/components/common/section-card'
import { PillButton } from '#/components/common/pill-button'
import { Separator } from '#/components/ui/separator'
import { CircuitTrails, Leaf } from '#/components/common/marks'
import { SectionTitle } from '../-components/section-title'
import { EnrollmentCta } from '#/components/common/enrollment-cta'
import { storefrontCourseQueryOptions } from '#/integrations/tanstack-query/queries'
import { formatDate, formatMoney, pluralize } from '#/lib/format'
import { whatsappUrl } from '#/lib/site'
import {
  courseCapacity,
  courseSeatsRemaining,
  courseTimesLabel,
} from '#/lib/enrollment-state'
import { Faq } from '../-components/faq'
import { Team } from '../-components/team'
import { REVEAL, STAGGER } from '../-components/reveal'
import { WhatsappFloat } from '../-components/whatsapp-float'
import { cn } from '#/lib/utils'

const route = getRouteApi('/_public/courses/$slug')

export const Route = createLazyFileRoute('/_public/courses/$slug')({
  component: RouteComponent,
  notFoundComponent: CourseNotFound,
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

/**
 * O curso que não existe.
 *
 * Separado do 404 genérico do site porque a pergunta é outra: quem chega aqui
 * quase sempre veio de um link antigo para um curso que saiu do ar, e o que ele
 * precisa saber é que **há** outros cursos - não que errou o endereço. Mandá-lo
 * à home o faria procurar de novo o que esta página já pode oferecer.
 */
function CourseNotFound(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-3xl leading-[1.05] font-semibold tracking-tight text-foreground sm:text-4xl">
        Curso não encontrado
      </h1>

      <p className="mx-auto mt-5 max-w-[52ch] leading-relaxed text-muted-foreground">
        Este endereço não corresponde a nenhum curso no ar. Ele pode ter saído
        do site, ou o link pode ter vindo cortado.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <PillButton
          tone="ink"
          scale="lg"
          render={<Link to="/">Ver os cursos abertos</Link>}
        />
      </div>
    </div>
  )
}

function RouteComponent(): React.JSX.Element {
  const { slug } = route.useParams()
  const { data: course } = useSuspenseQuery(storefrontCourseQueryOptions(slug))

  const modules = course.modules ?? []

  /*
   * Quantos sábados o curso ocupa, somados dos módulos.
   *
   * Somar e não contar linhas: um módulo pode ocupar dois encontros, e contar
   * módulos diria "8 sábados" para um curso de 16. Quando nenhum módulo declara
   * `sessionCount`, o denominador vira a contagem de módulos - que é o que a
   * grade semeada afirma, um por sábado.
   */
  const declared = modules.reduce(
    (total, entry) => total + (entry.sessionCount ?? 0),
    0,
  )
  const sessions = declared || modules.length

  const deliverables = modules
    .map((entry) => entry.deliverable)
    .filter((entry): entry is string => Boolean(entry))

  return (
    <>
      {/* A mesma faixa da home e da página institucional. */}
      <section className="relative overflow-hidden bg-brand-ink">
        <CircuitTrails className="text-neon/25" />
        <Leaf className="-top-24 -right-20 size-96 text-neon/5" />

        <div className="relative px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div className={cn(REVEAL)}>
              {/*
                Os três dados que decidem se a pessoa continua lendo: para quem
                é, quanto é, e se certifica. Sempre três, e sempre nesta ordem.

                Antes havia um selo escrito "Módulo 1", que não queria dizer
                nada - nem o curso tem módulo 1 como identidade, nem a página
                mostra outros módulos ali.

                A unidade de volume é a mesma nos dois cursos - sábados e horas.
                Misturar "16 sábados" num curso e "62 aulas" no outro tornaria
                os dois incomparáveis, que é o defeito do catálogo da
                referência.
              */}
              <div className="flex flex-wrap items-center gap-2">
                {course.minimumAge !== null && (
                  <Badge className="h-6 border-neon/40 bg-transparent px-3 text-xs text-neon">
                    A partir de {course.minimumAge} anos
                  </Badge>
                )}
                <Badge className="h-6 border-neon/40 bg-transparent px-3 text-xs text-neon">
                  {sessions} sábados · {course.workloadHours}h
                </Badge>
                <Badge className="h-6 border-neon/40 bg-transparent px-3 text-xs text-neon">
                  Com certificado
                </Badge>
              </div>

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

              {/*
                Dois CTAs: um compromete e outro adia. O que adia é âncora para
                a ementa, e não link para outra rota - quem ainda não decidiu
                quer ver o conteúdo, e mandá-lo para outra página seria perder
                quem só queria rolar.
              */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <EnrollmentCta
                  tone="neon"
                  scale="lg"
                  courseSlug={course.slug}
                />
                <PillButton
                  tone="neon-outline"
                  scale="lg"
                  render={<a href="#ementa">Ver a ementa</a>}
                />
              </div>
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

      {/*
        A faixa de contato, imediatamente depois dos fatos e antes de qualquer
        conteúdo longo.

        É onde a referência a coloca, e aqui ela vale mais: em Benjamin
        Constant o WhatsApp é o canal que a família já usa, e a dúvida que trava
        a matrícula ("meu filho tem idade?", "precisa levar computador?") não
        espera a pessoa rolar até o rodapé.
      */}
      <section className="border-y border-neon/15 bg-brand-ink-soft">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-heading-sm text-white">
              Ficou com dúvida sobre o curso ou a matrícula?
            </p>
            <p className="mt-1 text-body-sm text-white/70">
              Fala com a secretaria no WhatsApp. Responde gente daqui.
            </p>
          </div>

          <PillButton
            tone="neon"
            scale="md"
            className="shrink-0"
            render={
              <a
                href={whatsappUrl(
                  `Olá! Quero tirar uma dúvida sobre o curso de ${course.name}.`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappLogo />
                Falar no WhatsApp
              </a>
            }
          />
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
            {modules.length > 0 && (
              <div id="ementa" className="scroll-mt-24">
                <p className={cn(REVEAL, 'eyebrow mb-6 text-muted-foreground')}>
                  A ementa
                  <span className="opacity-50">_</span>
                </p>

                <ol className="grid gap-7">
                  {modules.map((entry, index) => (
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
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <p className="text-heading-sm text-foreground">
                            {entry.title}
                          </p>
                          {/*
                            A contagem ao lado do título, e não abaixo: é o que
                            dá à lista a densidade de programa em vez de índice.
                            Some quando o módulo não a declara - "0 sábados"
                            seria pior que nada.
                          */}
                          {entry.sessionCount !== null && (
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {pluralize(entry.sessionCount, 'sábado', 'sábados')}
                            </span>
                          )}
                        </div>

                        {entry.description && (
                          <p className="mt-1.5 text-body-md text-muted-foreground">
                            {entry.description}
                          </p>
                        )}

                        {/*
                          Os tópicos chegam como texto com quebra de linha - é
                          assim que o painel os guarda, para não obrigar o
                          formulário a gerenciar array dentro de array. A tela
                          os separa de volta e descarta linha em branco, que é o
                          que sobra de quem apertou enter duas vezes.
                        */}
                        {entry.topics && (
                          <ul className="mt-3 grid gap-1.5">
                            {entry.topics
                              .split('\n')
                              .map((topic) => topic.trim())
                              .filter(Boolean)
                              .map((topic) => (
                                <li
                                  key={topic}
                                  className="flex items-start gap-2 text-body-sm text-muted-foreground"
                                >
                                  <span
                                    aria-hidden
                                    className="mt-2 size-1 shrink-0 rounded-[1px] bg-neon-ink dark:bg-neon"
                                  />
                                  {topic}
                                </li>
                              ))}
                          </ul>
                        )}

                        {entry.deliverable && (
                          <p className="mt-3 text-body-sm text-foreground">
                            <span className="text-muted-foreground">
                              Você constrói:{' '}
                            </span>
                            {entry.deliverable}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </section>

      {/*
        O que a pessoa leva pronto - e é aqui que esta página diverge da
        referência de propósito.

        No lugar deste bloco, a Rocketseat põe faixa salarial com fonte citada e
        um banner de vagas do LinkedIn: deixa o mercado argumentar pelo preço.
        Não transfere. Não há dado de salário para Benjamin Constant, e a seção
        de salários já saiu desta vitrine uma vez por soar como promessa de
        emprego que uma escola sem turma formada não pode fazer.

        O que fica no lugar é o que a escola controla e pode mostrar: o robô, o
        site publicado, o certificado. Prova de resultado sem promessa sobre
        terceiros.
      */}
      {(deliverables.length > 0 || course.projectOutcome) && (
        <section className="bg-brand-ink">
          <div className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="accent-glow" />

            <div className="relative mx-auto max-w-7xl">
              <SectionTitle
                tone="ink"
                className={REVEAL}
                eyebrow="Resultado"
                lead="O que você"
                accent="constrói aqui"
              />

              {course.projectOutcome && (
                <p
                  className={cn(
                    REVEAL,
                    'delay-100 mt-6 max-w-[62ch] text-body-md text-white/85 sm:text-body-lg',
                  )}
                >
                  {course.projectOutcome}
                </p>
              )}

              {deliverables.length > 0 && (
                <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {deliverables.map((entry, index) => (
                    <li
                      key={entry}
                      className={cn(
                        REVEAL,
                        'rounded-card border border-neon/15 bg-ink-surface p-5 text-body-md text-white',
                      )}
                      style={{ animationDelay: `${index * STAGGER}ms` }}
                    >
                      {entry}
                    </li>
                  ))}
                </ul>
              )}

              {/*
                O que fica com quem, dito na página e não deixado subentendido.

                A versão anterior afirmava que o aluno levava tudo para casa, e
                era falso: o kit de robótica e os computadores são da escola. É
                o tipo de frase que alguém desmente na primeira conversa - e uma
                página que erra nisso perde a confiança do resto.

                Dizer que o material fica não enfraquece o argumento: é ele que
                permite a turma seguinte existir, e é a razão de ninguém
                precisar comprar equipamento para estudar aqui.
              */}
              <p
                className={cn(
                  REVEAL,
                  'mt-8 max-w-[62ch] text-body-sm text-white/60',
                )}
              >
                O kit e os computadores são da escola e ficam nela, para a turma
                seguinte. É por isso que ninguém precisa comprar equipamento
                para estudar aqui. O que sai com você é o certificado, o código
                que você escreveu e saber fazer de novo.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="bg-card">
        <div className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              className={REVEAL}
              eyebrow="Investimento"
              lead="Quanto"
              accent="custa"
            />

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
              O pagamento é por Pix. Assim que enviar a matrícula, você recebe o
              código de pagamento e anexa o comprovante na mesma página - a
              secretaria confere e confirma.
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

      {/*
        Quem dá aula, na página do curso e não só na home.

        A referência põe o instrutor duas vezes - dentro da ementa e num bloco
        próprio depois -, e o motivo transfere: quem está decidindo quer saber
        quem estará na sala. A credencial que vale aqui nenhum instrutor de
        fora pode reivindicar - estas pessoas estão em Benjamin Constant, no
        sábado.

        O componente é o mesmo da home. Não há vínculo curso-professor no banco,
        e inventar um "responsável pelo curso" na tela afirmaria uma divisão de
        turmas que a escola não declarou.
      */}
      <Team />

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
