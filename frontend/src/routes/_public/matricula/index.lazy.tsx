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
import { RadioGroup, RadioGroupItem } from '#/components/ui/radio-group'
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

/**
 * O id da linha que diz por que o botão de enviar não responde.
 *
 * Constante e não literal repetido: ela aparece no `id` do parágrafo e no
 * `aria-describedby` do botão, e os dois errarem juntos é o único jeito de o
 * vínculo continuar valendo.
 */
const CONSENT_HINT_ID = 'consentimento-pendente'

type Step = (typeof STEPS)[number]

/**
 * O id da mensagem de erro de um campo.
 *
 * Derivado do nome e não escrito à mão em dois lugares: o `id` do parágrafo e o
 * `aria-describedby` do input precisam ser a mesma string, e duas strings iguais
 * digitadas separadamente divergem na primeira renomeação - sem quebrar nada
 * visível, porque um `aria-describedby` órfão não aparece na tela. Ele só some
 * para quem depende dele.
 */
function errorId(name: keyof FormValues): string {
  return `${name}-erro`
}

/**
 * Para onde o campo aponta quando está inválido, e `undefined` quando não está.
 *
 * `undefined` e não a string sempre: `aria-describedby` apontando para um
 * elemento que não existe faz o leitor de tela anunciar o campo sem descrição
 * alguma - pior do que não ter o atributo, porque cala também o que existia.
 */
function errorDescribedBy(
  invalid: boolean,
  name: keyof FormValues,
): string | undefined {
  if (!invalid) return undefined

  return errorId(name)
}

/**
 * O par de atributos que descreve um campo inválido, escrito uma vez só.
 *
 * Antes cada campo repetia `aria-invalid` e `aria-describedby` à mão, e as duas
 * escritas que conviviam (`fieldState.invalid` nos controlados,
 * `Boolean(errors.x)` nos mascarados) deixavam controle sem atributo nenhum
 * quando alguém esquecia um dos dois. Um objeto espalhado no JSX torna
 * impossível ligar o estado inválido sem ligar junto a mensagem que o explica.
 */
function invalidProps(
  invalid: boolean,
  name: keyof FormValues,
): {
  'aria-invalid': boolean
  'aria-describedby': string | undefined
} {
  return {
    'aria-invalid': invalid,
    'aria-describedby': errorDescribedBy(invalid, name),
  }
}

/*
 * O formato que os campos mascarados aceitam, para o navegador conhecer a
 * regra além do JavaScript.
 *
 * Tolerantes à pontuação porque a máscara é do `use-mask-input` e o valor que
 * o React Hook Form guarda vem sem ela (`autoUnmask`): o mesmo campo pode ser
 * lido nas duas formas, e um `pattern` que só entendesse uma delas seria uma
 * regra falsa. Quem valida de verdade continua sendo o VineJS - inclusive os
 * dígitos verificadores do CPF, que nenhum `pattern` alcança.
 */
const CPF_PATTERN = '\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}'
const PHONE_PATTERN = '\\(?\\d{2}\\)? ?\\d{4,5}-?\\d{4}'

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
      /*
       * Desmarcados, e isto não é preferência de UX.
       *
       * Vinham marcados, com o argumento de que poupavam dois cliques a quem já
       * tinha decidido. Só que consentimento pré-marcado não é consentimento: o
       * art. 8º da LGPD pede manifestação **livre e inequívoca** do titular, e
       * uma caixa que o formulário marcou sozinho não manifesta nada - ela
       * registra a vontade de quem escreveu o formulário. O que ficaria gravado
       * em `lgpdConsentAt` seria a hora em que a página carregou.
       *
       * Os dois cliques economizados eram o consentimento inteiro.
       */
      termsAccepted: false,
      lgpdConsent: false,
    },
  })

  const registerWithMask = useHookFormMask(form.register)

  // Desestruturado e não lido inteiro a cada uso: o `formState` do react-hook-
  // form é um Proxy que registra a assinatura no acesso, e ler `errors` uma vez
  // assina uma vez.
  const { errors } = form.formState
  const [step, setStep] = React.useState<Step>('curso')

  /*
   * O título do passo, focado a cada troca.
   *
   * Trocar de passo repinta a tela inteira sem mexer no foco: quem navega por
   * teclado continua no botão "Continuar" que acabou de sumir, e o leitor de
   * tela só ouve o "Passo 2 de 4" do `aria-live` - o número, nunca o que
   * apareceu. Focar o `legend` faz o passo se apresentar.
   */
  const headingRef = React.useRef<HTMLLegendElement>(null)

  /*
   * O campo que o servidor marcou e que só existe depois de o passo alvo
   * montar. `null` quando não há nada pendente.
   *
   * Um `ref` e não estado: limpá-lo não pode disparar uma segunda passagem do
   * efeito abaixo, que encontraria o campo já consumido e mandaria o foco de
   * volta para o título - tirando-o justamente do campo que o servidor pediu
   * para corrigir.
   */
  const pendingFocus = React.useRef<keyof FormValues | null>(null)

  // A primeira renderização não conta: mover o foco na abertura da página
  // rouba o começo do documento de quem usa leitor de tela e pula o link de
  // "pular para o conteúdo".
  const mounted = React.useRef(false)

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    const field = pendingFocus.current

    if (field) {
      pendingFocus.current = null
      form.setFocus(field)
      return
    }

    headingRef.current?.focus()
  }, [step, form])

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

  /*
   * Os dois aceites, observados: o botão de enviar depende deles.
   *
   * `watch` e não `getValues`: `getValues` lê sem inscrever, e marcar a caixa
   * não re-renderizaria - o botão continuaria desabilitado com os dois aceites
   * dados, que é o defeito oposto e pior.
   */
  const [termsAccepted, lgpdConsent] = form.watch([
    'termsAccepted',
    'lgpdConsent',
  ])

  const consented = termsAccepted === true && lgpdConsent === true

  // O botão só aponta para o motivo enquanto o motivo existe: um
  // `aria-describedby` para um `id` que saiu do DOM é uma referência morta, e o
  // leitor de tela anuncia o botão sem descrição nenhuma.
  let consentHintId: string | undefined
  if (!consented) consentHintId = CONSENT_HINT_ID

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

      // O passo que já está na tela não precisa de nada disto: os campos dele
      // estavam montados no envio, e o `shouldFocusError` do `handleSubmit` já
      // levou o foco ao primeiro marcado.
      if (!target || target === step) return

      // O foco não pode ir daqui: o campo marcado estava desmontado no momento
      // do envio, e é isso que faz o `shouldFocusError` não alcançá-lo.
      // Guardamos o alvo e cobramos quando o passo montar.
      const field = STEP_FIELDS[target].find((name) => marked.includes(name))
      if (field) pendingFocus.current = field

      setStep(target)
    },
  })

  async function next() {
    // `shouldFocus` porque reprovar sem mover o foco deixa a pessoa parada no
    // botão "Continuar", com a mensagem de erro numa parte da tela que ela não
    // está lendo - e, no leitor de tela, sem anúncio nenhum de que algo mudou.
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true })

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
        <h1 className="display-title text-heading-lg font-semibold text-foreground sm:text-display-md">
          Nenhuma turma aberta <Highlight variant="fill">agora</Highlight>
        </h1>
        <p className="mx-auto mt-5 max-w-[46ch] text-body-md text-muted-foreground">
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
        <h1 className="display-title text-heading-lg font-semibold sm:text-display-md">
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
                <legend
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-heading-md font-bold outline-none"
                >
                  Qual turma você quer?
                </legend>

                <Controller
                  control={form.control}
                  name="classId"
                  render={({ field, fieldState }) => (
                    <RadioGroup
                      required
                      name={field.name}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                      aria-invalid={fieldState.invalid}
                      className="mt-5 grid gap-3"
                    >
                      {options.map(({ course, entity }) => (
                        <label
                          key={entity.id}
                          data-accent={course.accent}
                          className="rounded-card flex cursor-pointer items-start gap-4 border border-border bg-card p-5 transition-colors has-data-[checked]:border-primary has-data-[checked]:bg-background"
                        >
                          {/*
                            O radio do registry no lugar do nativo: o nativo
                            pintava com `accent-color`, que o navegador resolve
                            sozinho e não olha para o tema - o marcador ficava
                            fora da paleta no escuro.

                            O estado inválido vai nos dois lugares, e por
                            motivos diferentes: no item porque é ele que traz
                            as variantes `aria-invalid:` na classe do registry,
                            e sem ele o erro seria lido mas não pintado; no
                            `RadioGroup` que os embrulha porque é ele que tem
                            `role="radiogroup"`, e é o grupo - não o rádio
                            solto - que o leitor de tela anuncia ao entrar.
                            A descrição do erro fica só no item, para a
                            mensagem não ser lida duas vezes.
                          */}
                          <RadioGroupItem
                            value={entity.id}
                            onBlur={field.onBlur}
                            {...invalidProps(fieldState.invalid, 'classId')}
                            className="mt-1"
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
                        <FieldError id={errorId('classId')}>
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </RadioGroup>
                  )}
                />
              </fieldset>
            </FieldGroup>
          )}

          {step === 'aluno' && (
            <FieldGroup>
              <fieldset className="grid gap-6">
                <legend
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-heading-md font-bold outline-none"
                >
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
                        required
                        maxLength={160}
                        autoComplete="name"
                        {...invalidProps(fieldState.invalid, 'studentName')}
                      />
                      {fieldState.error && (
                        <FieldError id={errorId('studentName')}>
                          {fieldState.error.message}
                        </FieldError>
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
                        required
                        autoComplete="bday"
                        {...invalidProps(
                          fieldState.invalid,
                          'studentBirthDate',
                        )}
                      />
                      {fieldState.error && (
                        <FieldError id={errorId('studentBirthDate')}>
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </Field>
                  )}
                />

                <Field data-invalid={Boolean(errors.studentDocument)}>
                  <FieldLabel htmlFor="studentDocument">
                    CPF (opcional)
                  </FieldLabel>
                  <Input
                    {...registerWithMask('studentDocument', 'cpf', {
                      autoUnmask: true,
                    })}
                    id="studentDocument"
                    inputMode="numeric"
                    pattern={CPF_PATTERN}
                    // Sem token de preenchimento automático: não existe um para
                    // CPF, e `off` impede o navegador de oferecer o campo
                    // errado - foi o que ele fez com "documento" e o número do
                    // cartão salvo.
                    autoComplete="off"
                    placeholder="000.000.000-00"
                    {...invalidProps(
                      Boolean(errors.studentDocument),
                      'studentDocument',
                    )}
                  />
                  {errors.studentDocument && (
                    <FieldError id={errorId('studentDocument')}>
                      {errors.studentDocument.message}
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
                        required
                        autoComplete="email"
                        {...invalidProps(fieldState.invalid, 'email')}
                      />
                      {fieldState.error && (
                        <FieldError id={errorId('email')}>
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </Field>
                  )}
                />

                <Field data-invalid={Boolean(errors.phone)}>
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
                    pattern={PHONE_PATTERN}
                    required
                    autoComplete="tel"
                    placeholder="(97) 98460-0872"
                    {...invalidProps(Boolean(errors.phone), 'phone')}
                  />
                  {errors.phone && (
                    <FieldError id={errorId('phone')}>
                      {errors.phone.message}
                    </FieldError>
                  )}
                </Field>
              </fieldset>
            </FieldGroup>
          )}

          {step === 'responsavel' && (
            <FieldGroup>
              <fieldset className="grid gap-6">
                <legend
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-heading-md font-bold outline-none"
                >
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
                        required
                        maxLength={160}
                        /*
                          `section-responsavel` na frente do token: sem a seção,
                          o navegador trata este campo como o mesmo "nome" do
                          passo anterior e oferece o nome do aluno para o
                          responsável - dois campos que precisam justamente ser
                          pessoas diferentes.
                        */
                        autoComplete="section-responsavel name"
                        {...invalidProps(fieldState.invalid, 'guardianName')}
                      />
                      {fieldState.error && (
                        <FieldError id={errorId('guardianName')}>
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </Field>
                  )}
                />

                <Field data-invalid={Boolean(errors.guardianDocument)}>
                  <FieldLabel htmlFor="guardianDocument">CPF</FieldLabel>
                  <Input
                    {...registerWithMask('guardianDocument', 'cpf', {
                      autoUnmask: true,
                    })}
                    id="guardianDocument"
                    inputMode="numeric"
                    pattern={CPF_PATTERN}
                    required
                    autoComplete="off"
                    placeholder="000.000.000-00"
                    {...invalidProps(
                      Boolean(errors.guardianDocument),
                      'guardianDocument',
                    )}
                  />
                  {errors.guardianDocument && (
                    <FieldError id={errorId('guardianDocument')}>
                      {errors.guardianDocument.message}
                    </FieldError>
                  )}
                </Field>

                <Field data-invalid={Boolean(errors.guardianPhone)}>
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
                    pattern={PHONE_PATTERN}
                    required
                    autoComplete="section-responsavel tel"
                    placeholder="(97) 98460-0872"
                    {...invalidProps(
                      Boolean(errors.guardianPhone),
                      'guardianPhone',
                    )}
                  />
                  {errors.guardianPhone && (
                    <FieldError id={errorId('guardianPhone')}>
                      {errors.guardianPhone.message}
                    </FieldError>
                  )}
                </Field>
              </fieldset>
            </FieldGroup>
          )}

          {step === 'revisao' && (
            <FieldGroup>
              <fieldset className="grid gap-6">
                <legend
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-heading-md font-bold outline-none"
                >
                  Confira e envie
                </legend>

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
                          required
                          checked={field.value === true}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          {...invalidProps(fieldState.invalid, 'termsAccepted')}
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
                        <FieldError id={errorId(field.name)}>
                          {fieldState.error.message}
                        </FieldError>
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
                          required
                          checked={field.value === true}
                          onCheckedChange={(checked) =>
                            field.onChange(checked === true)
                          }
                          {...invalidProps(fieldState.invalid, 'lgpdConsent')}
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
                        <FieldError id={errorId(field.name)}>
                          {fieldState.error.message}
                        </FieldError>
                      )}
                    </Field>
                  )}
                />

                {/*
                  O que falta, dito onde a pessoa está olhando.

                  `aria-live="polite"` porque o texto **some** quando a segunda
                  caixa é marcada: sem isto, quem usa leitor de tela marcaria as
                  duas e não teria como saber que o botão destravou, já que nada
                  move o foco.
                */}
                {!consented && (
                  <p
                    id={CONSENT_HINT_ID}
                    aria-live="polite"
                    className="text-sm text-muted-foreground"
                  >
                    Marque os dois aceites acima para enviar a matrícula.
                  </p>
                )}
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
              /*
               * Desabilitado enquanto faltar um aceite.
               *
               * Com as caixas desmarcadas por padrão, um botão vivo mandaria o
               * formulário para o 422 do `literal(true)` e a pessoa levaria um
               * erro de servidor no lugar de uma instrução. O botão morto é a
               * mesma regra dita antes, e não depois.
               *
               * `aria-describedby` e não só o `disabled`: botão desabilitado é
               * mudo - não recebe foco e não explica por que não responde -, e
               * quem navega por teclado ou leitor de tela ficaria sem saber o
               * que falta. A linha abaixo é o motivo, e ela existe no DOM antes
               * de alguém tentar clicar.
               */
              <Button
                type="submit"
                disabled={mutation.isPending || !consented}
                aria-describedby={consentHintId}
              >
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
