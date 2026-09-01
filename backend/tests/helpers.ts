import type { ApiClient, ApiResponse } from '@japa/api-client'
import testUtils from '@adonisjs/core/services/test_utils'
import { COOKIE_TOKEN } from '#services/cookie.service'

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
