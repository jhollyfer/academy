import * as React from 'react'
import { createLazyFileRoute, useRouter } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { useHookFormMask } from 'use-mask-input'
import { ArrowLeft, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { storefrontCoursesQueryOptions } from '#/integrations/tanstack-query/queries'
import { useEnrollmentCreate } from '#/integrations/tanstack-query/mutations'
import { StorefrontEnrollmentCreateValidator } from '#/lib/validator'
import type { StorefrontEnrollmentCreatePayload } from '#/lib/validator'
import type { Merge } from '#/lib/interfaces'
import { LEGAL_AGE } from '#/lib/entity'
import { applyMutationError } from '#/lib/form-errors'
import {
  WAITING_LIST_MESSAGE,
  courseClasses,
  formatTimeRange,
} from '#/lib/enrollment-state'
import { whatsappUrl } from '#/lib/site'
import { Highlight } from '#/components/common/highlight'
import { Button } from '#/components/ui/button'
import { PillButton } from '#/components/common/pill-button'
import { Input } from '#/components/ui/input'
import { Checkbox } from '#/components/ui/checkbox'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { formatMoney, formatDate } from '#/lib/format'
import { Route as EnrollmentRoute } from './index'
import type { ClassResponse } from '#/integrations/response'

export const Route = createLazyFileRoute('/_public/matricula/')({
  component: RouteComponent,
})

/**
 * O que o formulário **segura**, que não é o que a API recebe.
 *
 * `studentBirthDate` é `Date` no payload validado - o `vine.date()` converte -,
 * mas um `<input type="date">` entrega e devolve `string`. Tipar o formulário
 * com o payload de saída obrigaria a converter na mão a cada leitura, e a
 * conversão erraria o fuso exatamente como o `formatDate` documenta.
 *
 * O `useForm` aceita os dois: o primeiro genérico é o que os campos carregam, o
 * terceiro é o que sai do resolver e chega ao `onSubmit`.
 */
type FormValues = Merge<
  Omit<
    StorefrontEnrollmentCreatePayload,
    'studentBirthDate' | 'termsAccepted' | 'lgpdConsent'
  >,
  {
    studentBirthDate: string
    /**
     * Os aceites são `boolean` aqui e `literal(true)` no payload.
     *
     * O validator exige `true` porque um aceite `false` não é consentimento - é
     * o formulário enviado sem a caixa marcada. Mas o **campo** pode estar
     * desmarcado enquanto a pessoa lê os termos, e tipá-lo `true` faria o
     * `checked={field.value === true}` do checkbox ser uma comparação que o
     * compilador já sabe verdadeira: a caixa nunca desmarcaria na tela.
     */
    termsAccepted: boolean
    lgpdConsent: boolean
  }
>

/**
 * Os passos do formulário.
 *
 * Quatro e não um só: são treze campos, e treze campos numa tela só num celular
 * é uma rolagem que ninguém termina. A divisão segue o que a pessoa sabe
 * responder de cabeça, na ordem em que ela sabe.
 *
 * O passo do responsável é **condicional**: quem tem 18 anos ou mais nunca o vê,
 * e o total de passos muda junto. Mostrar um passo que vai ser pulado é prometer
 * um trabalho que não existe.
 */
const STEPS = ['curso', 'aluno', 'responsavel', 'revisao'] as const

type Step = (typeof STEPS)[number]

/** Os campos que cada passo valida antes de deixar avançar. */
const STEP_FIELDS = {
  curso: ['classId'],
  aluno: [
    'studentName',
    'studentBirthDate',
    'studentDocument',
    'email',
    'phone',
  ],
  responsavel: ['guardianName', 'guardianDocument', 'guardianPhone'],
  revisao: ['termsAccepted', 'lgpdConsent'],
} as const satisfies Record<Step, ReadonlyArray<keyof FormValues>>

/** Todos os campos que o servidor pode marcar num 422. */
const FIELDS = [
  ...STEP_FIELDS.curso,
  ...STEP_FIELDS.aluno,
  ...STEP_FIELDS.responsavel,
  ...STEP_FIELDS.revisao,
] as const

/**
 * A idade na data de hoje, a partir de `yyyy-mm-dd`.
 *
 * Mesma conta que o servidor faz. Ela existe aqui **só** para decidir se o passo
 * do responsável aparece - quem exige os campos é o backend, e um cliente
 * adulterado continua batendo na mesma regra do outro lado.
 */
function ageFrom(birthDate: string): number | null {
  const [year, month, day] = birthDate.split('-').map(Number)

  if (!year || !month || !day) return null

  const today = new Date()
  let age = today.getFullYear() - year

  const beforeBirthday =
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)

  if (beforeBirthday) age -= 1

  return age
}

/**
 * O que dizer sobre as vagas de uma turma.
 *
 * Turma cheia não some da lista: quem chega depois das quarenta entra na fila de
 * espera, e esconder a opção o mandaria embora.
 */
/**
 * O horário da turma, quando ela tem um. Turma sem horário fechado aparece só
 * com nome e data - anunciar "das 8h" que ninguém decidiu é o defeito que a
 * coluna veio consertar.
 */
function classTime(entity: ClassResponse): string {
  return formatTimeRange(entity.startsAtTime, entity.endsAtTime)
}

function seatsLabel(remaining: number | undefined): string {
  if (remaining === undefined) return ''
  if (remaining === 0) return 'Turma cheia: você entra na fila de espera.'

  return `${remaining} vagas restantes.`
}

function RouteComponent(): React.JSX.Element {
  const router = useRouter()
  const search = EnrollmentRoute.useSearch()
  const { data } = useSuspenseQuery(storefrontCoursesQueryOptions())

  const courses = data.data

  /*
   * Uma opção por **turma**, e não por curso.
   *
   * A escola abre cinco: duas de programação pela manhã e três de robótica à
   * tarde e à noite. Enquanto era uma por curso, escolher o curso escolhia a
   * turma junto; agora são coisas diferentes, e quem decide qual das três de
   * robótica cabe na semana dele é o candidato, não o servidor.
   *
   * Curso sem turma anunciada não entra: pedir treze campos para responder que
   * não há vaga é gastar o tempo de alguém para não entregar nada.
   */
  const options = courses.flatMap(function (course) {
    const classes = courseClasses(course)

    return classes.map((entity) => ({ course, entity }))
  })

  const preselected = options.find(
    (option) => option.course.slug === search.curso,
  )

  const form = useForm<FormValues, unknown, StorefrontEnrollmentCreatePayload>({
    resolver: vineResolver(StorefrontEnrollmentCreateValidator),
    mode: 'onTouched',
    defaultValues: {
      classId: preselected?.entity.id ?? options.at(0)?.entity.id ?? '',
      studentName: '',
      studentBirthDate: '',
      studentDocument: null,
      email: '',
      phone: '',
      guardianName: null,
      guardianDocument: null,
      guardianPhone: null,
      // Marcados por padrão: são obrigatórios, a tela os explica, e começar
      // desmarcado só acrescenta dois cliques ao caminho de quem já decidiu. O
      // texto ao lado da caixa continua sendo o consentimento informado.
      termsAccepted: true,
      lgpdConsent: true,
    },
  })

  const registerWithMask = useHookFormMask(form.register)
  const [step, setStep] = React.useState<Step>('curso')

  const birthDate = form.watch('studentBirthDate')
  const classId = form.watch('classId')

  let age: number | null = null
  if (birthDate) age = ageFrom(birthDate)
  const isMinor = age !== null && age < LEGAL_AGE

  // Os passos que esta pessoa vai ver. Derivado, não guardado: a idade muda
  // enquanto ela digita, e um array em estado ficaria para trás.
  const steps = STEPS.filter((name) => name !== 'responsavel' || isMinor)
  const index = steps.indexOf(step)

  const selected = options.find((option) => option.entity.id === classId)

  const mutation = useEnrollmentCreate({
    onSuccess: async function (enrollment) {
      await router.navigate({
        to: '/matricula/$protocol',
        params: { protocol: enrollment.protocol },
      })
    },
    onError: function (error) {
      applyMutationError({ form, error, fields: FIELDS })

      // O 422 do responsável chega quando a pessoa já está na revisão. Voltar
      // para o passo do campo marcado é o que evita o erro invisível: sem isto
      // a mensagem existiria três telas acima, e a tela só diria "não enviou".
      const marked = Object.keys(error.errors ?? {})
      const target = steps.find((name) =>
        STEP_FIELDS[name].some((field) => marked.includes(field)),
      )

      if (target) setStep(target)
    },
  })

  async function next() {
    const valid = await form.trigger(STEP_FIELDS[step])

    if (!valid) return

    setStep(steps[index + 1])
  }

  function submit(values: StorefrontEnrollmentCreatePayload) {
    mutation.mutate(values)
  }

  /*
   * O vazio de verdade.
   *
   * Ele aparecia sempre, e não porque faltasse turma: a listagem da vitrine não
   * populava `nextClass`, então o filtro acima zerava com o banco cheio. A
   * página anunciava 40 vagas em março e esta tela dizia que não havia turma.
   *
   * Consertado o servidor, esta tela voltou a significar o que diz. E como
   * agora ela é rara, ela não pode terminar em beco: sai daqui com uma conversa
   * aberta no WhatsApp, que é o mesmo destino que o CTA da home assume quando
   * não há turma.
   */
  if (options.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Nenhuma turma aberta <Highlight variant="fill">agora</Highlight>
        </h1>
        <p className="mx-auto mt-5 max-w-[46ch] leading-relaxed text-muted-foreground">
          As matrículas abrem junto com a próxima turma. Deixe seu contato com a
          secretaria e avisamos assim que as inscrições começarem.
        </p>

        <PillButton
          tone="ink"
          scale="lg"
          className="mt-8"
          render={
            <a
              href={whatsappUrl(WAITING_LIST_MESSAGE)}
              target="_blank"
              rel="noreferrer"
            >
              Quero ser avisado
              <ArrowRight />
            </a>
          }
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="relative mx-auto max-w-2xl px-4 py-16 lg:py-20">
        <h1 className="text-3xl leading-[1.05] font-semibold tracking-tight sm:text-4xl">
          Sua <span className="text-foreground">matrícula</span>
        </h1>

        {/*
          O progresso é texto, e não uma barra preenchida: são quatro passos, o
          número diz tudo, e uma barra com trilho de fundo é enfeite de painel.
          `aria-live` porque a mudança de passo não move o foco sozinha.
        */}
        <p aria-live="polite" className="mt-3 text-sm text-muted-foreground">
          Passo {index + 1} de {steps.length}
        </p>

        <form onSubmit={form.handleSubmit(submit)} className="mt-10">
          {step === 'curso' && (
            <FieldGroup>
              <fieldset>
                <legend className="text-xl font-bold">
                  Qual turma você quer?
                </legend>

                <Controller
                  control={form.control}
                  name="classId"
                  render={({ field, fieldState }) => (
                    <div className="mt-5 grid gap-3">
                      {options.map(({ course, entity }) => (
                        <label
                          key={entity.id}
                          data-accent={course.accent}
                          className="rounded-card flex cursor-pointer items-start gap-4 border border-border bg-card p-5 transition-colors has-checked:border-primary has-checked:bg-background"
                        >
                          <input
                            type="radio"
                            name={field.name}
                            value={entity.id}
                            checked={field.value === entity.id}
                            onChange={() => field.onChange(entity.id)}
                            onBlur={field.onBlur}
                            className="mt-1 size-4 accent-foreground"
                          />
                          <span className="grid gap-1">
                            <span className="font-bold tracking-tight">
                              {course.name}
                              {classTime(entity) && (
                                <span className="ml-2 font-normal text-foreground">
                                  {classTime(entity)}
                                </span>
                              )}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {entity.name}, começa em{' '}
                              {formatDate(entity.startsAt)}. {entity.location}.{' '}
                              {seatsLabel(entity.seatsRemaining)}
                            </span>
                          </span>
                        </label>
                      ))}
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </div>
                  )}
                />
              </fieldset>
            </FieldGroup>
          )}

          {step === 'aluno' && (
            <FieldGroup>
              <fieldset className="grid gap-6">
                <legend className="text-xl font-bold">
                  Dados de quem vai estudar
                </legend>

                <Controller
                  control={form.control}
                  name="studentName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="studentName">
                        Nome completo
                      </FieldLabel>
                      <Input
                        {...field}
                        id="studentName"
                        autoComplete="name"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="studentBirthDate"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="studentBirthDate">
                        Data de nascimento
                      </FieldLabel>
                      {/*
                        `type="date"` nativo e não um seletor de calendário: a
                        data é de nascimento, e um calendário obriga a navegar
                        vinte anos para trás. O teclado do celular já abre o
                        seletor certo.
                      */}
                      <Input
                        {...field}
                        id="studentBirthDate"
                        type="date"
                        autoComplete="bday"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel htmlFor="studentDocument">
                    CPF (opcional)
                  </FieldLabel>
                  <Input
                    {...registerWithMask('studentDocument', 'cpf', {
                      autoUnmask: true,
                    })}
                    id="studentDocument"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                  />
                  {form.formState.errors.studentDocument && (
                    <FieldError>
                      {form.formState.errors.studentDocument.message}
                    </FieldError>
                  )}
                </Field>

                <Controller
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="email">E-mail</FieldLabel>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel htmlFor="phone">Telefone com DDD</FieldLabel>
                  <Input
                    {...registerWithMask(
                      'phone',
                      ['(99) 9999-9999', '(99) 99999-9999'],
                      {
                        autoUnmask: true,
                      },
                    )}
                    id="phone"
                    inputMode="tel"
                    placeholder="(97) 98460-0872"
                  />
                  {form.formState.errors.phone && (
                    <FieldError>
                      {form.formState.errors.phone.message}
                    </FieldError>
                  )}
                </Field>
              </fieldset>
            </FieldGroup>
          )}

          {step === 'responsavel' && (
            <FieldGroup>
              <fieldset className="grid gap-6">
                <legend className="text-xl font-bold">
                  Dados do responsável legal
                </legend>
                <p className="text-sm text-muted-foreground">
                  Quem tem menos de {LEGAL_AGE} anos precisa de um responsável
                  na matrícula. É exigência da lei de proteção de dados, não da
                  escola.
                </p>

                <Controller
                  control={form.control}
                  name="guardianName"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="guardianName">
                        Nome completo
                      </FieldLabel>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        id="guardianName"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Field>
                  <FieldLabel htmlFor="guardianDocument">CPF</FieldLabel>
                  <Input
                    {...registerWithMask('guardianDocument', 'cpf', {
                      autoUnmask: true,
                    })}
                    id="guardianDocument"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                  />
                  {form.formState.errors.guardianDocument && (
                    <FieldError>
                      {form.formState.errors.guardianDocument.message}
                    </FieldError>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="guardianPhone">
                    Telefone com DDD
                  </FieldLabel>
                  <Input
                    {...registerWithMask(
                      'guardianPhone',
                      ['(99) 9999-9999', '(99) 99999-9999'],
                      {
                        autoUnmask: true,
                      },
                    )}
                    id="guardianPhone"
                    inputMode="tel"
                    placeholder="(97) 98460-0872"
                  />
                  {form.formState.errors.guardianPhone && (
                    <FieldError>
                      {form.formState.errors.guardianPhone.message}
                    </FieldError>
                  )}
                </Field>
              </fieldset>
            </FieldGroup>
          )}

          {step === 'revisao' && (
            <FieldGroup>
              <fieldset className="grid gap-6">
                <legend className="text-xl font-bold">Confira e envie</legend>

                {selected && (
                  <dl className="rounded-card grid gap-3 border border-border bg-card p-5 text-sm">
                    <Row label="Curso">{selected.course.name}</Row>
                    <Row label="Turma">
                      {selected.entity.name}
                      {classTime(selected.entity) &&
                        `, ${classTime(selected.entity)}`}
                      , a partir de {formatDate(selected.entity.startsAt)}
                    </Row>
                    <Row label="Onde">{selected.entity.location}</Row>
                    <Row label="Aluno">{form.getValues('studentName')}</Row>
                    <Row label="Investimento">
                      {formatMoney(selected.course.enrollmentFeeInCents)} de
                      inscrição, depois{' '}
                      {formatMoney(selected.course.monthlyFeeInCents)} por mês
                    </Row>
                  </dl>
                )}

                <Controller
                  control={form.control}
                  name="termsAccepted"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <label className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          aria-invalid={fieldState.invalid}
                        />
                        <span className="text-muted-foreground">
                          Li e aceito os{' '}
                          <a
                            href="/termos"
                            target="_blank"
                            className="text-foreground hover:underline"
                          >
                            termos de uso
                          </a>
                          .
                        </span>
                      </label>
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="lgpdConsent"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <label className="flex items-start gap-3 text-sm">
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          aria-invalid={fieldState.invalid}
                        />
                        <span className="text-muted-foreground">
                          Autorizo o uso dos meus dados para processar esta
                          matrícula, conforme a{' '}
                          <a
                            href="/privacidade"
                            target="_blank"
                            className="text-foreground hover:underline"
                          >
                            política de privacidade
                          </a>
                          .
                        </span>
                      </label>
                      {fieldState.error && (
                        <FieldError>{fieldState.error.message}</FieldError>
                      )}
                    </Field>
                  )}
                />
              </fieldset>
            </FieldGroup>
          )}

          {form.formState.errors.root && (
            <p role="alert" className="mt-6 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <div className="mt-10 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={index === 0}
              onClick={() => setStep(steps[index - 1])}
            >
              <ArrowLeft />
              Voltar
            </Button>

            {index < steps.length - 1 && (
              <Button type="button" onClick={next}>
                Continuar
                <ArrowRight />
              </Button>
            )}

            {index === steps.length - 1 && (
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && 'Enviando...'}
                {!mutation.isPending && 'Enviar matrícula'}
                <CheckCircle />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
