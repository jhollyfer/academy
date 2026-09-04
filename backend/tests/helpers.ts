import type { ApiClient, ApiResponse } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import { COOKIE_TOKEN } from '#services/cookie.service'
import { FACTORY_PASSWORD, UserFactory } from '#database/factories/user_factory'

/**
 * Lê o JSON da resposta sem brigar com o tipo. O registry do client casa a rota
 * pelo caminho e não pelo método, então `response.body()` vem como a união de
 * todas as respostas daquele caminho - inclusive as de erro. Nos testes o que
 * importa é o conteúdo.
 */
export function body(response: ApiResponse): Record<string, any> {
  return response.body()
}

/**
 * O dono. Nasce só pelo seeder, então todo teste que precisa de sessão de painel
 * começa por ele.
 */
export const OWNER = {
  email: 'administrator@mail.com',
  password: 'Administrator1!',
}

export type Session = {
  [COOKIE_TOKEN.ACCESS]: string
  [COOKIE_TOKEN.REFRESH]: string
}

/**
 * Autentica por HTTP e devolve os cookies para encadear nas requisições
 * seguintes.
 *
 * Substitui o `loginAs` do plugin de auth, que montaria a sessão chamando o
 * guard por dentro e portanto nunca exercitaria o caminho real: validator do
 * sign-in, emissão do par de tokens, e a leitura do cookie pelo guard. Com isso
 * um teste prova o contrato inteiro, não só o use-case.
 */
export async function authenticate(
  client: ApiClient,
  email: string,
  password: string
): Promise<Session> {
  const response = await client.post('/authentication/sign-in').json({ email, password })

  response.assertStatus(204)

  return {
    [COOKIE_TOKEN.ACCESS]: response.cookie(COOKIE_TOKEN.ACCESS)!.value,
    [COOKIE_TOKEN.REFRESH]: response.cookie(COOKIE_TOKEN.REFRESH)!.value,
  }
}

/** Atalho para a sessão do dono, que é a mais usada nos testes de painel. */
export function authenticateAsOwner(client: ApiClient): Promise<Session> {
  return authenticate(client, OWNER.email, OWNER.password)
}

/**
 * Uma sessão de administrador, que é o outro lado de toda asserção de permissão.
 *
 * Criado na hora pelo factory, e não semeado: o seeder existe para o primeiro
 * dono, que é a única conta que nenhum endpoint cria. Prender o administrador a
 * ele daria a impressão de que ele também precisa de um caminho próprio.
 */
export async function authenticateAsAdministrator(client: ApiClient): Promise<Session> {
  const administrator = await UserFactory.create()

  return authenticate(client, administrator.email, FACTORY_PASSWORD)
}

/**
 * Sessões dos dois papéis do portal.
 *
 * São o outro lado das asserções que o `authenticateAsAdministrator` não cobre:
 * ele prova "operador não apaga", e estes provam "quem é atendido não entra no
 * painel". Sem eles, alargar um `role([...])` para incluir aluno passaria em
 * todos os testes.
 */
export async function authenticateAsResponsible(client: ApiClient): Promise<Session> {
  const responsible = await UserFactory.apply('responsible').create()

  return authenticate(client, responsible.email, FACTORY_PASSWORD)
}

export async function authenticateAsStudent(client: ApiClient): Promise<Session> {
  const student = await UserFactory.apply('student').create()

  return authenticate(client, student.email, FACTORY_PASSWORD)
}

/**
 * Esvazia o banco e recria o dono.
 *
 * O `truncate` apaga o dono junto, e ele é o único usuário que nenhum endpoint
 * cria - sem semear de novo, nenhum teste de painel teria por onde começar. É o
 * único passo de arranjo que não passa por HTTP.
 */
export async function resetDatabase() {
  // `truncate()` NÃO trunca: ela roda as migrations e **devolve** a função que
  // trunca, que o Japa registra como teardown do teste. Descartar esse retorno
  // faz o banco nunca ser limpo, e um teste passa a enxergar o dado do anterior.
  const teardown = await testUtils.db().truncate()

  await testUtils.db().seed()

  return teardown
}

/**
 * O payload mínimo de um curso. Os campos obrigatórios e nada mais - cada teste
 * sobrescreve o que precisa provar.
 */
export function coursePayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Robotics Fundamentals',
    description: 'Arduino, eletrônica básica, sensores, atuadores e um projeto robótico final.',
    accent: 'ROBOTICS',
    workloadHours: 32,
    durationMonths: 4,
    enrollmentFeeInCents: 15000,
    monthlyFeeInCents: 15000,
    ...overrides,
  }
}

/** Cria um curso pelo painel e devolve o recurso criado. */
export async function createCourse(
  client: ApiClient,
  session: Session,
  overrides: Record<string, unknown> = {}
): Promise<Record<string, any>> {
  const response = await client
    .post('/administrator/courses')
    .cookies(session)
    .json(coursePayload(overrides))

  response.assertStatus(201)

  return body(response)
}

/**
 * O payload mínimo de uma turma. `courseId` é obrigatório e vem de quem chama.
 */
export function classPayload(
  courseId: string,
  overrides: Record<string, unknown> = {}
): Record<string, unknown> {
  return {
    courseId,
    name: 'Turma 1 / 2026',
    startsAt: '2026-03-07',
    weekday: 'SATURDAY',
    shift: 'MORNING',
    // Obrigatórios desde que `weekday` + `shift` deixaram de separar duas
    // turmas do mesmo curso no mesmo sábado de manhã.
    startsAtTime: '08:00',
    endsAtTime: '11:00',
    location: 'Benjamin Constant/AM',
    capacity: 40,
    ...overrides,
  }
}

/** Cria uma turma pelo painel e devolve o recurso criado. */
export async function createClass(
  client: ApiClient,
  session: Session,
  courseId: string,
  overrides: Record<string, unknown> = {}
): Promise<Record<string, any>> {
  const response = await client
    .post('/administrator/classes')
    .cookies(session)
    .json(classPayload(courseId, overrides))

  response.assertStatus(201)

  return body(response)
}

/**
 * O que cada teste troca no payload de matrícula.
 *
 * Um tipo próprio em vez de `Record<string, unknown>`: o cliente do Japa infere
 * o corpo esperado do registry de rotas, e um `Record` largo não satisfaz a
 * assinatura - a chamada compilaria em nenhum lugar e o teste passaria só por
 * `node ace test` não checar tipo.
 */
/**
 * Um CPF válido a partir dos nove primeiros dígitos.
 *
 * Existe porque o CPF passou a ser único por turma: dois candidatos na mesma
 * turma precisam de dois números, e inventá-los à mão dá em dígito verificador
 * errado - o teste falharia por `checkDigits` e não pela regra que ele mede.
 *
 * Mesmo módulo 11 de `cpf()` em `app/core/validator.ts`, escrito de novo de
 * propósito: um teste que importa a implementação que ele testa só prova que
 * ela é igual a si mesma.
 */
export function cpfFrom(base: string): string {
  let digits = base

  for (const size of [9, 10]) {
    let sum = 0

    for (let i = 0; i < size; i += 1) sum += Number(digits[i]) * (size + 1 - i)

    // `% 10` no lugar do "onze vira zero": resto 10 é o único caso, e o módulo
    // resolve sem um `if` que o `no-ternary` recusaria escrever inline.
    digits += String(((sum * 10) % 11) % 10)
  }

  return digits
}

type EnrollmentOverrides = {
  studentName?: string
  studentBirthDate?: string
  studentDocument?: string
  email?: string
  phone?: string
  guardianName?: string | null
  guardianDocument?: string | null
  guardianPhone?: string | null
}

/**
 * O payload mínimo de uma matrícula. Maior de idade por padrão - o caso do menor
 * é o que cada teste sobrescreve, porque é o que tem regra.
 */
export function enrollmentPayload(classId: string, overrides: EnrollmentOverrides = {}) {
  return {
    classId,
    studentName: 'João da Silva',
    studentBirthDate: '2000-04-12',
    // Obrigatório e único por turma: quem matricula dois candidatos na mesma
    // turma sobrescreve com outro `cpfFrom`, senão o segundo bate no índice.
    studentDocument: cpfFrom('529982247'),
    email: 'joao@exemplo.com',
    phone: '97984600872',
    ...overrides,
    // Fora do alcance de `overrides` de propósito: o registro de rotas tipa os
    // dois como `literal(true)`, e o cliente do Japa recusa `false` em tempo de
    // compilação. Quem prova que a API os exige é `enrollment-consent.spec.ts`,
    // que chama o validator direto - lá o payload inválido é construível.
    // `as const` para o tipo continuar `true` e não alargar para `boolean`: o
    // registro de rotas os declara `literal(true)`, e `boolean` não satisfaz.
    termsAccepted: true as const,
    lgpdConsent: true as const,
  }
}
