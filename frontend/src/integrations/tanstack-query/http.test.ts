import { afterEach, expect, test, vi } from 'vitest'
import { HTTPError, HTTPErrorCode, HTTPStatus, request } from './http'
import { runInRequestScope } from './http.server'

/**
 * Responde 401 com o `code` do guard em toda rota privada, e 204 no refresh,
 * contando quantas vezes o refresh foi chamado.
 *
 * O 401 do replay é de propósito: o que está sendo medido é quantas renovações
 * saem, não se a segunda tentativa passa.
 */
function respondExpired() {
  const refreshes: Array<string> = []

  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input)

    if (url.includes('/authentication/refresh')) {
      refreshes.push(url)
      return new Response(null, { status: 204 })
    }

    return new Response(
      JSON.stringify({
        message: 'Sessão expirada',
        status: 401,
        code: HTTPErrorCode.UNAUTHORIZED,
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    )
  })

  return refreshes
}

function respond(status: number, body?: unknown) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  )
}

/** Captura a rejeição já tipada - `.catch((e) => e)` devolveria `unknown`. */
async function rejection(promise: Promise<unknown>): Promise<HTTPError> {
  try {
    await promise
  } catch (error) {
    return error as HTTPError
  }

  throw new Error('esperava rejeição, a promessa resolveu')
}

afterEach(() => {
  vi.restoreAllMocks()
})

test('204 resolve sem tentar ler corpo vazio', async () => {
  respond(204)

  await expect(request('/authentication/sign-in')).resolves.toBeUndefined()
})

test('422 vira erro de campo', async () => {
  respond(422, {
    message: 'Dados inválidos',
    status: 422,
    code: HTTPErrorCode.VALIDATION_ERROR,
    errors: { email: 'Email inválido' },
  })

  const error = await rejection(request('/authentication/sign-in'))

  expect(error).toBeInstanceOf(HTTPError)
  expect(error.isFieldError).toBe(true)
  expect(error.isServerError).toBe(false)
  expect(error.errors).toEqual({ email: 'Email inválido' })
})

test('401 não é erro de campo nem de servidor', async () => {
  respond(401, {
    message: 'Credenciais inválidas',
    status: 401,
    code: HTTPErrorCode.INVALID_CREDENTIALS,
  })

  const error = await rejection(request('/authentication/sign-in'))

  expect(error.isFieldError).toBe(false)
  expect(error.isServerError).toBe(false)
  expect(error.message).toBe('Credenciais inválidas')
})

test('401 carrega a mensagem do formulário em errors.root', async () => {
  respond(401, {
    message: 'Credenciais inválidas',
    status: 401,
    code: HTTPErrorCode.INVALID_CREDENTIALS,
    errors: { root: 'Dados de acesso inválidos' },
  })

  const error = await rejection(request('/authentication/sign-in'))

  expect(error.errors?.root).toBe('Dados de acesso inválidos')
  expect(error.isServerError).toBe(false)
})

test('500 é erro de servidor', async () => {
  respond(500, {
    message: 'Erro interno do servidor',
    status: 500,
    code: HTTPErrorCode.SIGN_IN_ERROR,
  })

  const error = await rejection(request('/authentication/sign-in'))

  expect(error.isServerError).toBe(true)
})

test('corpo ilegível mantém o status real da resposta', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response('<html>502 Bad Gateway</html>', { status: 502 }),
  )

  const error = await rejection(request('/authentication/sign-in'))

  expect(error.status).toBe(502)
  expect(error.code).toBe(HTTPErrorCode.UNKNOWN_ERROR)
  expect(error.isServerError).toBe(true)
})

test('falha de rede vira HTTPError com status sintético', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(
    new TypeError('Failed to fetch'),
  )

  const error = await rejection(request('/authentication/sign-in'))

  expect(error).toBeInstanceOf(HTTPError)
  expect(error.status).toBe(HTTPStatus.NETWORK)
  expect(error.isServerError).toBe(true)
})

test('no mesmo escopo, cinco 401 simultâneos renovam uma vez só', async () => {
  const refreshes = respondExpired()

  await runInRequestScope(async () => {
    const pending = Array.from({ length: 5 }, () =>
      rejection(request('/account')),
    )

    await Promise.all(pending)
  })

  // O backend apaga o refresh token antigo ao emitir o novo: cinco renovações
  // gastariam o mesmo token cinco vezes, e quatro derrubariam a sessão.
  expect(refreshes).toHaveLength(1)
})

test('escopos diferentes renovam cada um por conta própria', async () => {
  const refreshes = respondExpired()

  // São dois visitantes, com cookies diferentes. Compartilhar a renovação entre
  // eles daria a um o token do outro.
  await Promise.all([
    runInRequestScope(() => rejection(request('/account'))),
    runInRequestScope(() => rejection(request('/account'))),
  ])

  expect(refreshes).toHaveLength(2)
})

test('o signal do queryFn chega ao fetch', async () => {
  const fetcher = respond(200, { id: '1' })
  const controller = new AbortController()

  await request('/account', { signal: controller.signal })

  // O `signal` vem de graça no `RequestInit`, mas só se `request` não o perder
  // ao montar as próprias opções - que é o que este teste tranca. Sem ele,
  // query que desmonta antes de resolver não cancela nada.
  const [, init] = fetcher.mock.calls[0]
  //
  // O objeto não é o do chamador: `request` o combina com o prazo de `TIMEOUT`
  // por `AbortSignal.any`. O que precisa continuar valendo é o efeito, e é o
  // efeito que se afere - comparar identidade trancaria a implementação, não o
  // comportamento.
  expect(init?.signal?.aborted).toBe(false)

  controller.abort()
  expect(init?.signal?.aborted).toBe(true)
})

test('a requisição tem prazo mesmo sem signal do chamador', async () => {
  const fetcher = respond(200, { id: '1' })

  await request('/account')

  // Sem prazo, um servidor que aceita a conexão e não responde deixa a promessa
  // pendurada até o limite do sistema operacional - e no SSR isso prende a
  // resposta HTML inteira. O `signal` existe mesmo quando ninguém passou um.
  const [, init] = fetcher.mock.calls[0]
  expect(init?.signal).toBeInstanceOf(AbortSignal)
  expect(init?.signal?.aborted).toBe(false)
})

test('o signal sobrevive ao replay depois do refresh', async () => {
  respondExpired()
  const controller = new AbortController()

  await runInRequestScope(() =>
    rejection(request('/account', { signal: controller.signal })),
  )

  // O replay reusa o `init` original. Perder o signal aqui deixaria a segunda
  // tentativa rodando depois de a tela já ter desmontado.
  const replay = vi
    .mocked(globalThis.fetch)
    .mock.calls.filter(([input]) => String(input).includes('/account'))

  expect(replay).toHaveLength(2)
  // Idem o teste acima: cada tentativa recebe o signal do chamador combinado com
  // o próprio prazo, então o que se afere é o efeito. As duas precisam abortar
  // juntas - um replay que sobrevivesse ao desmonte é exatamente o vazamento
  // que este teste existe para pegar.
  for (const [, init] of replay) expect(init?.signal?.aborted).toBe(false)

  controller.abort()

  for (const [, init] of replay) expect(init?.signal?.aborted).toBe(true)
})
