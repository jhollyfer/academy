import { test } from '@japa/runner'

/**
 * A allowlist de origens.
 *
 * Vale só fora de desenvolvimento - `config/cors.ts` libera tudo em dev - e
 * `NODE_ENV=test` não é desenvolvimento, então a suíte exercita o caminho de
 * produção. As origens vêm de `CORS_ORIGIN` no `.env.test`.
 *
 * A API autentica por cookie, e com `credentials: true` o protocolo recusa `*`:
 * ou a origem está listada, ou não existe sessão entre o site e a API. Sem este
 * teste, uma allowlist quebrada só apareceria em produção, como um login que não
 * funciona sem erro visível no servidor.
 */
test.group('cors > allowlist', () => {
  test('origem na lista recebe a liberação com credencial', async ({ client, assert }) => {
    const response = await client.get('/health').header('origin', 'http://localhost:5173')

    response.assertStatus(200)
    assert.equal(response.header('access-control-allow-origin'), 'http://localhost:5173')
    assert.equal(response.header('access-control-allow-credentials'), 'true')
  })

  test('origem fora da lista não é liberada', async ({ client, assert }) => {
    const response = await client.get('/health').header('origin', 'https://invasor.example')

    // O servidor responde; quem recusa é o navegador, ao não encontrar o
    // cabeçalho. É por isso que a asserção é sobre a ausência dele, e não sobre
    // um status de erro.
    assert.isUndefined(response.header('access-control-allow-origin'))
  })

  test('preflight de origem listada responde os métodos', async ({ client, assert }) => {
    const response = await client
      .options('/storefront/enrollments')
      .header('origin', 'http://localhost:5173')
      .header('access-control-request-method', 'POST')

    assert.equal(response.header('access-control-allow-origin'), 'http://localhost:5173')
    assert.include(response.header('access-control-allow-methods'), 'POST')
  })
})
