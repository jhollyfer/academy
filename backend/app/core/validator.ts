import env from '#start/env'
import vine from '@vinejs/vine'
import type { FieldContext, Infer } from '@vinejs/vine/types'
import {
  ACTIVE_STATUSES,
  CLASS_STATUSES,
  ClassStatuses,
  COURSE_ACCENTS,
  ENROLLMENT_FILE_KINDS,
  ENROLLMENT_STATUSES,
  MANAGEABLE_USER_ROLES,
  SHIFTS,
  SORT_DIRECTIONS,
  TRASHED_MODES,
  USER_ROLES,
  WEEKDAYS,
} from '#core/entity'

/**
 * Fonte única dos schemas VineJS do backend.
 *
 * A alternativa seria um `_shared.validator.ts` por feature, com imports
 * relativos entre eles. Um arquivo só torna a duplicação visível e dá um alvo
 * estável para o import: `#core/validator`.
 *
 * O gerador de OpenAPI resolve estes validators pelo AST dos controllers
 * (`#core/openapi/introspect`), lendo o especificador do import e reimportando o
 * módulo. Renomear um export sem atualizar o controller não quebra o build: o
 * `loadValidator` engole a falha e a operação some do documento. `node ace
 * openapi:generate --check` é o que pega isso.
 */

// ---------------------------------------------------------------------------
// Regras compartilhadas
// ---------------------------------------------------------------------------

/**
 * Regras reaproveitadas por mais de um resource.
 *
 * São funções, não constantes: reaproveitar o mesmo nó de schema em dois
 * validators compartilharia as opções entre eles.
 */

/**
 * Status de curso e de usuário. Canônico em inglês; o rótulo em português fica
 * no frontend.
 */
export function activeStatus() {
  return vine.enum(ACTIVE_STATUSES)
}

/**
 * Um valor em dinheiro, em centavos inteiros.
 *
 * Inteiro e não decimal porque ponto flutuante não representa R$ 150,10
 * exatamente. O teto é R$ 1.000.000,00 - não é limite de negócio, é a barreira
 * contra o dedo escorregado que transformaria a mensalidade em um número que
 * ninguém revisa antes de a landing publicar.
 */
export function money() {
  return vine.number().min(0).max(100_000_000)
}

/**
 * Os dígitos verificadores do CPF, pelo módulo 11.
 *
 * Conferir só o tamanho deixaria passar `000.000.000-00` e o `111.111.111-11`
 * que alguém digita para pular o campo - por isso a sequência de um dígito só é
 * rejeitada antes do cálculo: ela satisfaz o módulo 11 por construção.
 */
function hasValidCpfDigits(digits: string): boolean {
  if (!/^[0-9]{11}$/.test(digits)) return false
  if (/^([0-9])\1{10}$/.test(digits)) return false

  for (const size of [9, 10]) {
    let sum = 0

    for (let i = 0; i < size; i += 1) sum += Number(digits[i]) * (size + 1 - i)

    const rest = (sum * 10) % 11

    if ((rest === 10 ? 0 : rest) !== Number(digits[size])) return false
  }

  return true
}

const cpfCheckDigits = vine.createRule((value: unknown, _options, field: FieldContext) => {
  if (typeof value !== 'string') return
  if (hasValidCpfDigits(value)) return

  field.report('CPF inválido', 'checkDigits', field)
})

/**
 * CPF do candidato ou do responsável legal.
 *
 * O `parse()` roda **antes** de qualquer validação, então a máscara some
 * primeiro e o tamanho é sempre conferido sobre os dígitos crus - e o valor
 * gravado é o mesmo venha `123.456.789-00` ou `12345678900`. Sem isso o mesmo
 * CPF existiria no banco de duas formas, e nenhuma busca por documento
 * funcionaria.
 *
 * Entrada não-string passa intacta pelo `parse` e é recusada pelo `string()` -
 * o callback precisa checar o tipo, porque recebe o valor cru.
 */
export function cpf() {
  return vine
    .string()
    .parse((value) => {
      if (typeof value !== 'string') return value

      return value.replace(/\D/g, '')
    })
    .fixedLength(11)
    .use(cpfCheckDigits())
}

/**
 * Telefone com DDD, guardado só em dígitos.
 *
 * Espelha `cpf()`: o `parse()` tira a máscara antes de qualquer validação, então
 * `(97) 98460-0872` e `97984600872` gravam o mesmo valor.
 *
 * Os dois lados normalizam, e nenhum confia no outro: o formulário limpa antes
 * de enviar, e um cliente que chame a API direto com o número mascarado é aceito
 * do mesmo jeito, porque o `parse()` do servidor limpa de novo.
 *
 * O `regex` roda sobre os dígitos crus e é o que impede "nao tenho fone" de
 * passar como telefone. Dez dígitos é fixo, onze é celular, e o DDD não começa
 * em zero.
 */
export function phone() {
  return vine
    .string()
    .parse((value) => {
      if (typeof value !== 'string') return value

      const digits = value.replace(/\D/g, '')

      // Devolve o valor cru quando não sobrou dígito nenhum, para o `regex`
      // recusá-lo. Sem isto, "nao tenho fone" vira `''`, que um campo
      // `optional()` aceitaria calado - o texto digitado sumiria em vez de virar
      // erro. Campo de fato vazio continua caindo no `null`, que é o que "não
      // informado" significa.
      if (!digits && value.trim()) return value

      return digits
    })
    .regex(/^[1-9]{2}[0-9]{8,9}$/)
    .maxLength(11)
}

/**
 * O que pode aparecer num nome de pessoa: letra (com acento), espaço,
 * apóstrofo, hífen e ponto.
 *
 * O que a regra existe para barrar é o dígito - "Maria 12345" passou pelo
 * formulário de matrícula e chegou ao painel, e nome com número quebra busca,
 * relatório e a emissão de certificado mais adiante.
 */
const PERSON_NAME = /^[\p{L}][\p{L}\p{M} '’.-]*$/u

const personNameChars = vine.createRule((value: unknown, _options, field: FieldContext) => {
  if (typeof value !== 'string') return
  if (PERSON_NAME.test(value)) return

  field.report('Informe um nome sem números', 'personName', field)
})

/**
 * Nome de pessoa - do candidato ou do responsável legal.
 *
 * **Não exige duas palavras**, e isso é decisão e não esquecimento. A escola
 * atende o Alto Solimões, onde nome indígena de palavra única é comum; cobrar
 * sobrenome barraria aluno real para resolver um problema que ninguém tem. O
 * defeito relatado era número no meio do nome, e é só isso que a regra barra.
 *
 * A regra é nomeada (`personName`) em vez de um `.regex()` cru porque o
 * `SimpleMessagesProvider` procura `campo.regra` e depois `regra`: com `regex`
 * seriam duas chaves - `studentName.regex` e `guardianName.regex` - e um campo
 * novo nasceria sem mensagem. Com o nome próprio há uma chave só.
 */
export function personName() {
  return vine.string().trim().minLength(2).maxLength(160).use(personNameChars())
}

/**
 * Os três campos que toda listagem aceita. Espalhados (`...paginationFields()`)
 * pelos validators que ainda somam um filtro próprio, para que o teto de
 * `perPage` viva num lugar só.
 */
export function paginationFields() {
  return {
    page: vine.number().min(1).optional(),
    perPage: vine.number().min(1).max(100).optional(),
    search: vine.string().maxLength(100).optional(),
  }
}

/**
 * O recorte de lixeira, para as listagens que têm o que restaurar.
 *
 * Fora de `paginationFields()` de propósito: se estivesse lá, apareceria também
 * nas leituras públicas do site, que nunca enxergam registro removido. O
 * parâmetro seria aceito, ignorado em silêncio, e o documento OpenAPI passaria a
 * prometer um filtro que não existe.
 */
export function trashedField() {
  return { trashed: vine.enum(TRASHED_MODES).optional() }
}

/**
 * A ordem de uma listagem, em dois campos: `sort` (a coluna) e `direction`.
 *
 * **Um par, e não um `order-<coluna>` por coluna.** Dois parâmetros de ordem ao
 * mesmo tempo não expressam precedência - `?order-name=asc&order-created-at=desc`
 * não diz qual vence -, e a consulta ordena por uma coluna só.
 *
 * **A coluna vem de uma lista fechada, declarada por recurso.** O valor entra
 * direto no `orderBy`, que o compõe no SQL: aceitar texto livre da URL seria
 * entregar a cláusula ao cliente. Coluna fora da lista é 422 apontando o campo,
 * e não um 500 do banco reclamando de coluna inexistente.
 */
export function sortFields<const TColumns extends readonly [string, ...string[]]>(
  columns: TColumns
) {
  return {
    sort: vine.enum(columns).optional(),
    direction: vine.enum(SORT_DIRECTIONS).optional(),
  }
}

/**
 * As colunas ordenáveis por recurso.
 *
 * Só entram colunas que a tela mostra. Ordenar por `slug` ou por `deletedAt`
 * seria prometer no OpenAPI uma ordem que nenhum cabeçalho oferece.
 */
export const COURSE_SORT_COLUMNS = ['name', 'position', 'createdAt'] as const
export const CLASS_SORT_COLUMNS = ['name', 'startsAt', 'capacity', 'status', 'createdAt'] as const
export const ENROLLMENT_SORT_COLUMNS = ['studentName', 'status', 'createdAt'] as const
export const PARTNER_SORT_COLUMNS = ['name', 'position', 'createdAt'] as const
/**
 * `position` é a ordem na grade e no FAQ - o que a tela mostra. Não há por que
 * ordenar por título: a sequência dos sábados é o conteúdo.
 */
export const ORDERED_CHILD_SORT_COLUMNS = ['position', 'createdAt'] as const

/**
 * E-mail, com o teto da coluna.
 */
export function email() {
  return vine.string().email().maxLength(254)
}

/**
 * Senha de painel. Minúscula, maiúscula, dígito e símbolo, confirmada num
 * segundo campo.
 */
export function password() {
  return vine
    .string()
    .minLength(8)
    .maxLength(32)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^a-zA-Z0-9]/)
    .confirmed({ as: 'passwordConfirmation' })
}

// ---------------------------------------------------------------------------
// Validators globais
// ---------------------------------------------------------------------------

export const IdentifierValidator = vine.create({
  id: vine.string().uuid(),
})

export const PaginationValidator = vine.create(vine.object(paginationFields()))

/**
 * O identificador público de um recurso do site. Slug e não uuid: é o que
 * aparece em `/cursos/:slug`, e trocar um pelo outro na URL da landing seria
 * expor a chave interna sem ganho nenhum.
 */
export const SlugValidator = vine.create({
  slug: vine.string().trim().maxLength(140),
})

/**
 * A paginação dos recursos que têm lixeira. É o `PaginationValidator` mais o
 * `trashed`, e existe como schema próprio porque as leituras públicas do site
 * seguem sem ele.
 */
export const TrashablePaginationValidator = vine.create({
  ...paginationFields(),
  ...trashedField(),
})

export type IdentifierPayload = Infer<typeof IdentifierValidator>
export type SlugPayload = Infer<typeof SlugValidator>
export type PaginationPayload = Infer<typeof PaginationValidator>
export type TrashablePaginationPayload = Infer<typeof TrashablePaginationValidator>

// ---------------------------------------------------------------------------
// administrator/courses
// ---------------------------------------------------------------------------

/**
 * Um encontro da grade. Sem `id` nem `position`: o módulo não tem identidade
 * estável do lado do cliente, e a ordem é o índice do array - quem arrasta um
 * sábado na tela não renumera nada, só reordena a lista.
 *
 * O teto de itens não é zelo: `vine.array()` sem limite aceita o que couber no
 * corpo da requisição, e o que chega vai inteiro para o banco.
 */
function courseModuleFields() {
  return vine
    .array(
      vine.object({
        title: vine.string().trim().minLength(2).maxLength(200),
        description: vine.string().trim().maxLength(2000).nullable().optional(),
        // Quantos sábados o módulo ocupa. O curso inteiro tem 16, e o teto
        // acompanha: um módulo que dissesse ocupar 40 encontros descreveria um
        // curso que não existe.
        sessionCount: vine.number().min(1).max(16).nullable().optional(),
        // Os tópicos do encontro, um por linha.
        topics: vine.string().trim().maxLength(1000).nullable().optional(),
        // O que o aluno entrega ao final. É o que a página mostra no lugar da
        // faixa salarial da referência.
        deliverable: vine.string().trim().maxLength(200).nullable().optional(),
      })
    )
    .maxLength(60)
}

/** Uma pergunta frequente do curso, pela mesma regra da grade. */
function courseFaqFields() {
  return vine
    .array(
      vine.object({
        question: vine.string().trim().minLength(4).maxLength(300),
        answer: vine.string().trim().minLength(2).maxLength(4000),
      })
    )
    .maxLength(40)
}

export const AdministratorCourseCreateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(160),
  // Opcional: sem ele, o slug sai do nome. Quando vem preenchido ele vence, e
  // ainda assim passa pelo `SlugService.normalize` no use-case.
  slug: vine.string().trim().maxLength(140).optional(),
  tagline: vine.string().trim().maxLength(200).nullable().optional(),
  description: vine.string().trim().minLength(10).maxLength(4000),
  accent: vine.enum(COURSE_ACCENTS),
  workloadHours: vine.number().min(1).max(10_000),
  durationMonths: vine.number().min(1).max(120),
  // Nulo é "sem restrição de idade", que é diferente de zero - zero afirmaria
  // que qualquer idade serve, e é o que um campo numérico vazio viraria sem o
  // `nullable`.
  minimumAge: vine.number().min(0).max(120).nullable().optional(),
  requirements: vine.string().trim().maxLength(2000).nullable().optional(),
  // "O que você vai construir". Separado da descrição porque é o que vende.
  projectOutcome: vine.string().trim().maxLength(2000).nullable().optional(),
  enrollmentFeeInCents: money(),
  monthlyFeeInCents: money(),
  coverId: vine.string().uuid().nullable().optional(),
  position: vine.number().min(0).max(999).optional(),
  status: activeStatus().optional(),

  // A grade e o FAQ chegam aqui e não em endpoints próprios: são sincronizados
  // na mesma transação do curso (`_shared.syllabus.ts`). Ausentes = não mexer;
  // lista vazia = apagar.
  modules: courseModuleFields().optional(),
  faqs: courseFaqFields().optional(),
})

/**
 * O mesmo conjunto, todo opcional: o `PUT` é merge parcial - campo ausente não é
 * tocado, `null` explícito limpa.
 *
 * Declarado por extenso e não derivado do de criação, como em toda a
 * referência. O frontend, por sua vez, valida o formulário de edição com o
 * validator de **criação**: a tela de edição preenche todos os campos, e validar
 * com o opcional deixaria alguém limpar um campo obrigatório e só descobrir no
 * 422.
 */
export const AdministratorCourseUpdateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(160).optional(),
  slug: vine.string().trim().maxLength(140).optional(),
  tagline: vine.string().trim().maxLength(200).nullable().optional(),
  description: vine.string().trim().minLength(10).maxLength(4000).optional(),
  accent: vine.enum(COURSE_ACCENTS).optional(),
  workloadHours: vine.number().min(1).max(10_000).optional(),
  durationMonths: vine.number().min(1).max(120).optional(),
  minimumAge: vine.number().min(0).max(120).nullable().optional(),
  requirements: vine.string().trim().maxLength(2000).nullable().optional(),
  projectOutcome: vine.string().trim().maxLength(2000).nullable().optional(),
  enrollmentFeeInCents: money().optional(),
  monthlyFeeInCents: money().optional(),
  coverId: vine.string().uuid().nullable().optional(),
  position: vine.number().min(0).max(999).optional(),
  status: activeStatus().optional(),

  // A grade e o FAQ chegam aqui e não em endpoints próprios: são sincronizados
  // na mesma transação do curso (`_shared.syllabus.ts`). Ausentes = não mexer;
  // lista vazia = apagar.
  modules: courseModuleFields().optional(),
  faqs: courseFaqFields().optional(),
})

export const AdministratorCoursePaginationValidator = vine.create({
  ...paginationFields(),
  ...trashedField(),
  ...sortFields(COURSE_SORT_COLUMNS),
  status: activeStatus().optional(),
  accent: vine.enum(COURSE_ACCENTS).optional(),
})

export type AdministratorCourseCreatePayload = Infer<typeof AdministratorCourseCreateValidator>
export type AdministratorCourseUpdatePayload = Infer<typeof AdministratorCourseUpdateValidator>
export type AdministratorCoursePaginationPayload = Infer<
  typeof AdministratorCoursePaginationValidator
>

// ---------------------------------------------------------------------------
// administrator/partners
// ---------------------------------------------------------------------------

/**
 * Uma instituição parceira. Sem `slug`: parceiro não tem página própria, e a
 * identidade é o `name` - é ele que a criação usa para decidir entre ressuscitar
 * uma linha arquivada e recusar uma duplicata viva.
 *
 * `role` é obrigatório e é o campo que faz a seção valer alguma coisa: uma
 * grade de logos sem papel declarado não prova nada. Com dois parceiros, a
 * explicação de cada um é o que separa parceria de decoração.
 */
export const AdministratorPartnerCreateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(160),
  role: vine.string().trim().minLength(4).maxLength(200),
  // Opcional porque escola pública de cidade pequena muitas vezes não tem site,
  // e um card sem link é melhor que um link morto.
  url: vine.string().trim().url().maxLength(300).nullable().optional(),
  logoId: vine.string().uuid().nullable().optional(),
  position: vine.number().min(0).max(999).optional(),
  status: activeStatus().optional(),
})

/**
 * O mesmo conjunto, todo opcional: o `PUT` é merge parcial - campo ausente não é
 * tocado, `null` explícito limpa.
 *
 * Declarado por extenso e não derivado do de criação, como em toda a referência.
 */
export const AdministratorPartnerUpdateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(160).optional(),
  role: vine.string().trim().minLength(4).maxLength(200).optional(),
  url: vine.string().trim().url().maxLength(300).nullable().optional(),
  logoId: vine.string().uuid().nullable().optional(),
  position: vine.number().min(0).max(999).optional(),
  status: activeStatus().optional(),
})

export const AdministratorPartnerPaginationValidator = vine.create({
  ...paginationFields(),
  ...trashedField(),
  ...sortFields(PARTNER_SORT_COLUMNS),
  status: activeStatus().optional(),
})

export type AdministratorPartnerCreatePayload = Infer<typeof AdministratorPartnerCreateValidator>
export type AdministratorPartnerUpdatePayload = Infer<typeof AdministratorPartnerUpdateValidator>
export type AdministratorPartnerPaginationPayload = Infer<
  typeof AdministratorPartnerPaginationValidator
>

// ---------------------------------------------------------------------------
// authentication
// ---------------------------------------------------------------------------

export const AuthenticationSignInValidator = vine.create({
  email: email(),
  // Entrar não valida força: a senha só é comparada com o hash guardado. Exigir
  // o formato atual aqui travaria quem cadastrou antes da regra endurecer.
  password: vine.string().maxLength(128),
})

export type AuthenticationSignInPayload = Infer<typeof AuthenticationSignInValidator>

/**
 * A própria conta, editada por quem a usa.
 *
 * É o outro lado do `AdministratorUserUpdateValidator`, que recusa `password` de
 * propósito: redefinir a senha de outra pessoa é emitir convite, e trocar a
 * própria é aqui. Sem este schema a secretaria não tinha por onde mudar o
 * próprio nome nem a própria senha.
 *
 * `role` e `status` não entram: quem muda o próprio papel deixa de ser gerido
 * por quem o concedeu.
 */
export const AccountUpdateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120).optional(),
  email: email().optional(),
  password: password().optional(),
  /**
   * A senha atual, exigida **só** quando `password` vem no payload.
   *
   * É prova de identidade, e não de força: quem sequestra uma sessão tem o
   * cookie, mas não sabe a senha. `PASSWORD_SAME_AS_CURRENT` não serve para
   * isso - ele compara a nova com o hash, e passar por ele é justamente não
   * saber a atual.
   *
   * `requiredIfExists` e não uma checagem no use-case: a obrigatoriedade
   * condicional é forma do payload, e aqui ela vira `422` apontando o campo.
   *
   * Sem as regras de força de `password()`: o valor é conferido contra o hash,
   * não gravado. O teto de 32 é o mesmo da política, porque é o maior valor que
   * a aplicação já pode ter gravado.
   */
  currentPassword: vine.string().maxLength(32).optional().requiredIfExists('password'),
  phone: phone().nullable().optional(),
  // `nullable` é o que permite tirar a foto sem trocá-la. O uuid só garante o
  // formato; que o arquivo exista é checado no use-case, senão a violação da
  // chave estrangeira estouraria como 500 em vez de 422.
  avatarId: vine.string().uuid().nullable().optional(),
})

export type AccountUpdatePayload = Infer<typeof AccountUpdateValidator>

/**
 * O token do convite, como ele chega pelo parâmetro da rota.
 *
 * O comprimento espelha o `string.random(64)` do `invite.service.ts`. Recusar
 * pelo formato antes de ir ao banco não é otimização: é o que impede que o
 * endpoint público vire uma sonda barata de consulta por token arbitrário.
 */
function inviteToken() {
  return vine.string().trim().fixedLength(64)
}

export const AuthenticationInviteShowValidator = vine.create({
  token: inviteToken(),
})

export type AuthenticationInviteShowPayload = Infer<typeof AuthenticationInviteShowValidator>

/**
 * Definir a senha pelo convite.
 *
 * Aqui a força **é** exigida, ao contrário do `sign-in`: esta é a única vez em
 * que a senha é escolhida, e é o momento certo de cobrar o formato. `password()`
 * já pede a confirmação num segundo campo.
 */
export const AuthenticationInviteAcceptValidator = vine.create({
  token: inviteToken(),
  password: password(),
})

export type AuthenticationInviteAcceptPayload = Infer<typeof AuthenticationInviteAcceptValidator>

// ---------------------------------------------------------------------------
// administrator/classes
// ---------------------------------------------------------------------------

/**
 * Uma hora de parede, `HH:MM` ou `HH:MM:SS`.
 *
 * Os segundos entram porque o Postgres devolve `time` com eles - reenviar o que
 * a API acabou de responder tem de passar. O `<input type="time">` manda sem.
 */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/

/**
 * A hora depois da hora de outro campo.
 *
 * Não há regra pronta: `afterField` é de `vine.date()`, e estas são strings de
 * hora de parede, sem dia. O `.slice(0, 5)` nos dois lados é o que faz a
 * comparação valer - o Postgres devolve `08:00:00` e o `<input type="time">`
 * manda `08:00`, e `'08:00:00' <= '10:00'` é falso por tamanho, não por hora.
 * Com os dois em `HH:MM` zero-padded, a ordem alfabética **é** a cronológica.
 *
 * Sai calada quando o irmão não veio: numa atualização parcial o campo pode
 * nem estar no payload, e reprovar ali seria cobrar um dado que ninguém enviou.
 */
const afterTimeField = vine.createRule(
  (value: unknown, otherField: string, field: FieldContext) => {
    if (typeof value !== 'string') return

    const other = field.parent[otherField]

    if (typeof other !== 'string') return
    if (value.slice(0, 5) > other.slice(0, 5)) return

    field.report('O horário de término deve ser depois do de início', 'afterTimeField', field, {
      other: otherField,
    })
  }
)

/**
 * A hora da aula.
 *
 * Obrigatória: `weekday` + `shift` não separam duas turmas do mesmo curso no
 * mesmo sábado de manhã, a hora separa - e turma anunciada sem horário não diz
 * ao candidato quando aparecer.
 *
 * A coluna segue `nullable` no banco, e de propósito: as turmas gravadas antes
 * desta regra continuam legíveis, e a vitrine já sabe lidar com o nulo. O que
 * muda é que salvar de novo passa a cobrar o horário.
 */
function time() {
  return vine.string().trim().regex(TIME_PATTERN)
}

export const AdministratorClassCreateValidator = vine.create({
  courseId: vine.string().uuid(),
  name: vine.string().trim().minLength(2).maxLength(160),
  startsAt: vine.date(),
  // Nula enquanto a escola não fechou a data de encerramento. `afterField`
  // porque uma turma que termina antes de começar é erro de digitação, e o
  // banco aceitaria calado.
  endsAt: vine
    .date({ formats: ['iso8601'] })
    .afterField('startsAt')
    .nullable()
    .optional(),
  weekday: vine.enum(WEEKDAYS),
  shift: vine.enum(SHIFTS),
  startsAtTime: time(),
  endsAtTime: time().use(afterTimeField('startsAtTime')),
  location: vine.string().trim().minLength(2).maxLength(200),
  capacity: vine.number().min(1).max(10_000),
  // `FULL` não entra: é derivado da ocupação, e digitá-lo criaria uma segunda
  // fonte da verdade que divergiria na primeira matrícula.
  status: vine.enum([ClassStatuses.OPEN, ClassStatuses.CLOSED]).optional(),
})

export const AdministratorClassUpdateValidator = vine.create({
  courseId: vine.string().uuid().optional(),
  name: vine.string().trim().minLength(2).maxLength(160).optional(),
  startsAt: vine.date().optional(),
  endsAt: vine
    .date({ formats: ['iso8601'] })
    .nullable()
    .optional(),
  weekday: vine.enum(WEEKDAYS).optional(),
  shift: vine.enum(SHIFTS).optional(),
  // Opcionais aqui e obrigatórios na criação porque este é um PATCH: o que não
  // veio no corpo fica como está. A ordem continua sendo cobrada quando os dois
  // vêm juntos, que é o caso do formulário de edição.
  startsAtTime: time().optional(),
  endsAtTime: time().use(afterTimeField('startsAtTime')).optional(),
  location: vine.string().trim().minLength(2).maxLength(200).optional(),
  capacity: vine.number().min(1).max(10_000).optional(),
  status: vine.enum([ClassStatuses.OPEN, ClassStatuses.CLOSED]).optional(),
})

export const AdministratorClassPaginationValidator = vine.create({
  ...paginationFields(),
  ...trashedField(),
  ...sortFields(CLASS_SORT_COLUMNS),
  courseId: vine.string().uuid().optional(),
  status: vine.enum(CLASS_STATUSES).optional(),
})

export type AdministratorClassCreatePayload = Infer<typeof AdministratorClassCreateValidator>
export type AdministratorClassUpdatePayload = Infer<typeof AdministratorClassUpdateValidator>
export type AdministratorClassPaginationPayload = Infer<
  typeof AdministratorClassPaginationValidator
>

// ---------------------------------------------------------------------------
// administrator/enrollments
// ---------------------------------------------------------------------------

export const AdministratorEnrollmentPaginationValidator = vine.create({
  ...paginationFields(),
  ...trashedField(),
  ...sortFields(ENROLLMENT_SORT_COLUMNS),
  classId: vine.string().uuid().optional(),
  courseId: vine.string().uuid().optional(),
  status: vine.enum(ENROLLMENT_STATUSES).optional(),
})

/**
 * A secretaria move o estado e anota. Nada mais: os dados do candidato são dele,
 * e corrigi-los pelo painel apagaria o que ele declarou sem deixar rastro.
 *
 * A transição legal não é checada aqui e sim no use-case, contra
 * `ENROLLMENT_TRANSITIONS`: o validator não conhece o estado atual.
 */
export const AdministratorEnrollmentUpdateValidator = vine.create({
  status: vine.enum(ENROLLMENT_STATUSES).optional(),
  notes: vine.string().trim().maxLength(2000).nullable().optional(),
})

export type AdministratorEnrollmentPaginationPayload = Infer<
  typeof AdministratorEnrollmentPaginationValidator
>
export type AdministratorEnrollmentUpdatePayload = Infer<
  typeof AdministratorEnrollmentUpdateValidator
>

// ---------------------------------------------------------------------------
// storefront/enrollments
// ---------------------------------------------------------------------------

/**
 * A matrícula virtual.
 *
 * O responsável legal é **condicional à idade**, e essa exigência **não** está
 * aqui: ela é do use-case, que a devolve como `422` com um `errors` por campo.
 *
 * Não é preguiça, é limitação medida. A condição depende de outro campo
 * (`studentBirthDate`), então teria de ser uma regra de objeto - e uma regra de
 * objeto do VineJS reporta no caminho do objeto, com o nome do campo indo parar
 * em `meta`. O `form-errors.ts` do frontend leria isso como erro de `root`, e os
 * três inputs que faltam ficariam sem marcação nenhuma. O `errors` do
 * `HTTPException` mapeia campo para mensagem, que é exatamente o que a tela
 * precisa.
 */
export const StorefrontEnrollmentCreateValidator = vine.create(
  vine.object({
    classId: vine.string().uuid(),
    studentName: personName(),
    // `beforeOrEqual('today')` aqui e idade mínima no use-case: nascer no
    // futuro é impossível olhando só para este campo, e idade mínima depende da
    // turma escolhida. A que cabe no validator fica no validator.
    studentBirthDate: vine.date({ formats: ['iso8601'] }).beforeOrEqual('today'),
    // Obrigatório desde que o CPF passou a identificar a matrícula: é ele que
    // impede a mesma pessoa entrar duas vezes na mesma turma, e o índice que
    // cobra isso não funciona sobre nulo.
    studentDocument: cpf(),
    email: email(),
    phone: phone(),

    guardianName: personName().nullable().optional(),
    guardianDocument: cpf().nullable().optional(),
    guardianPhone: phone().nullable().optional(),

    // Aceites. `literal(true)` e não booleano: "false" não é um consentimento
    // que valha gravar, é o formulário enviado sem a caixa marcada.
    termsAccepted: vine.literal(true),
    lgpdConsent: vine.literal(true),
  })
)

export type StorefrontEnrollmentCreatePayload = Infer<typeof StorefrontEnrollmentCreateValidator>

/**
 * O comprovante do Pix, anexado depois de o binário já estar no bucket.
 *
 * Recebe o `id` do `storages`, não o arquivo: o upload é presigned multipart e o
 * binário nunca atravessa esta API.
 */
export const StorefrontEnrollmentAttachmentValidator = vine.create({
  storageId: vine.string().uuid(),
  kind: vine.enum(ENROLLMENT_FILE_KINDS).optional(),
})

export const ProtocolValidator = vine.create({
  protocol: vine.string().uuid(),
})

export type StorefrontEnrollmentAttachmentPayload = Infer<
  typeof StorefrontEnrollmentAttachmentValidator
>
export type ProtocolPayload = Infer<typeof ProtocolValidator>

// ---------------------------------------------------------------------------
// storages
// ---------------------------------------------------------------------------

/**
 * Os tipos aceitos, e a extensão que cada um ganha na chave do objeto.
 *
 * O mapa existe porque o nome que o usuário enviou **não** é fonte confiável de
 * extensão - ele é rótulo , e `foto.png` pode ser um pdf. A extensão da
 * chave sai do `mimetype` declarado, que é o mesmo valor com que a URL é
 * assinada e que o bucket devolve na confirmação.
 *
 * `Record<Mimetype, string>` faz o compilador cobrar uma entrada por tipo:
 * acrescentar um mimetype na lista sem dizer que extensão ele tem quebra a
 * compilação, em vez de virar arquivo sem extensão no bucket.
 */
export const STORAGE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const

export type StorageMimetype = (typeof STORAGE_MIMETYPES)[number]

export const STORAGE_EXTENSIONS: Record<StorageMimetype, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

/**
 * O teto por arquivo, em bytes . Vem do ambiente e não tem default: sem
 * a variável a aplicação nem sobe (`start/env.ts`). A coluna `size` é `bigint`
 * justamente para não impor aqui um teto que o operador não pediu.
 */
export const UPLOAD_MAX_SIZE = env.get('UPLOAD_MAX_SIZE')

/**
 * O que `POST /storages` recebe: metadados, nunca bytes.
 *
 * O binário vai do navegador direto ao bucket, então tipo e tamanho são
 * **declarados** aqui e conferidos contra o objeto real no
 * `POST /storages/:id/complete`. Recusar antes de assinar é o que impede um
 * arquivo proibido de chegar ao bucket ; conferir depois é o que impede
 * que o declarado tenha sido mentira.
 */
export const StorageCreateValidator = vine.create({
  fileName: vine.string().trim().minLength(1).maxLength(255),
  mimetype: vine.enum(STORAGE_MIMETYPES),
  size: vine.number().min(1).max(UPLOAD_MAX_SIZE).withoutDecimals(),
})

export type StorageCreatePayload = Infer<typeof StorageCreateValidator>

/**
 * O que `POST /storages/:id/complete` recebe: o `ETag` de cada parte enviada.
 *
 * Vazio - ou ausente - é upload de parte única, que não tem parte para
 * confirmar. O teto de dez mil é o do próprio S3.
 */
export const StorageCompleteValidator = vine.create({
  parts: vine
    .array(
      vine.object({
        partNumber: vine.number().min(1).max(10_000).withoutDecimals(),
        etag: vine.string().trim().maxLength(64).minLength(1),
      })
    )
    .optional(),
})

export type StorageCompletePayload = Infer<typeof StorageCompleteValidator>

// ---------------------------------------------------------------------------
// administrator/users
// ---------------------------------------------------------------------------

/**
 * `name` e `email` porque é o que a tela mostra e por onde a secretaria procura.
 * `role` entra para agrupar dono, operador, responsável e aluno numa listagem só.
 */
export const USER_SORT_COLUMNS = ['name', 'email', 'role', 'createdAt'] as const

/**
 * O papel que um endpoint aceita atribuir.
 *
 * `MANAGEABLE_USER_ROLES` e não `USER_ROLES`: `OWNER` fora da lista é o que
 * impede alguém de se promover a dono por um POST. Isto é metade da regra - a
 * outra é a `UserPolicy`, que recusa alguém editando o próprio cadastro. O
 * validator sozinho não resolve, porque ele não sabe quem está chamando.
 */
export function manageableRole() {
  return vine.enum(MANAGEABLE_USER_ROLES)
}

export const AdministratorUserPaginationValidator = vine.create({
  ...paginationFields(),
  ...trashedField(),
  ...sortFields(USER_SORT_COLUMNS),
  // Filtrar por papel é o que separa "a equipe" de "as famílias" numa base em
  // que os quatro convivem. Aceita a lista inteira, `OWNER` incluso: filtrar não
  // é atribuir, e quem não pode vê-lo já é barrado pela policy.
  role: vine.enum(USER_ROLES).optional(),
  status: activeStatus().optional(),
})

/**
 * A senha é opcional na criação, e é aí que os dois caminhos se separam: com
 * senha, a conta nasce pronta e a secretaria informa a credencial; sem senha,
 * nasce um convite e quem define é o titular, pelo link do e-mail.
 *
 * O segundo caminho é o único aceitável para responsável e aluno - a secretaria
 * não deve escolher, conhecer nem digitar a senha de uma família.
 */
export const AdministratorUserCreateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120),
  email: email(),
  password: password().optional(),
  phone: phone().nullable().optional(),
  role: manageableRole(),
  status: activeStatus().optional(),
  avatarId: vine.string().uuid().nullable().optional(),
})

/**
 * Atualização não aceita senha: trocar a própria é `/account`, e redefinir a de
 * outro é emitir convite. Um `PUT` que aceitasse `password` deixaria a secretaria
 * assumir a conta de uma família sem deixar rastro.
 */
export const AdministratorUserUpdateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120).optional(),
  email: email().optional(),
  phone: phone().nullable().optional(),
  role: manageableRole().optional(),
  status: activeStatus().optional(),
  avatarId: vine.string().uuid().nullable().optional(),
})

/**
 * O dependente que entra num vínculo. Só o corpo: o responsável é o `:id` da
 * URL, e sai do `IdentifierValidator` como em todo update deste repo - misturar
 * os dois num schema só faz o cliente tipado exigir no corpo um valor que já
 * está no caminho.
 *
 * Os papéis das duas pontas são conferidos no use-case: o schema garante
 * formato, não semântica.
 */
export const AdministratorGuardianshipValidator = vine.create({
  studentId: vine.string().uuid(),
})

/**
 * O par que o `DELETE` carrega, os dois na URL - a requisição não tem corpo.
 */
export const AdministratorGuardianshipParamsValidator = vine.create({
  id: vine.string().uuid(),
  studentId: vine.string().uuid(),
})

export type AdministratorUserPaginationPayload = Infer<typeof AdministratorUserPaginationValidator>
export type AdministratorUserCreatePayload = Infer<typeof AdministratorUserCreateValidator>
export type AdministratorUserUpdatePayload = Infer<typeof AdministratorUserUpdateValidator>
export type AdministratorGuardianshipPayload = Infer<typeof AdministratorGuardianshipValidator>
export type AdministratorGuardianshipParamsPayload = Infer<
  typeof AdministratorGuardianshipParamsValidator
>
