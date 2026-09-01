import { test } from '@japa/runner'
import { COOKIE_TOKEN } from '#services/cookie.service'
import { authenticateAsOwner, body, OWNER, resetDatabase } from '../helpers.ts'

/**
 * A porta do painel, e a própria conta atrás dela.
 *
 * O sign-in é o único endpoint que grava sessão, e o `account/profile` é o mais
 * barato de todos os autenticados - juntos provam o guard inteiro: emissão do
 * par de tokens, leitura do cookie e invalidação no sign-out.
 */
test.group('autenticação > sign-in', (group) => {
  group.each.setup(() => resetDatabase())

  test('abre a sessão com 204 e dois cookies httpOnly', async ({ client, assert }) => {
    const response = await client.post('/authentication/sign-in').json(OWNER)

    response.assertStatus(204)
    assert.isEmpty(response.text())

    const access = response.cookie(COOKIE_TOKEN.ACCESS)
    const refresh = response.cookie(COOKIE_TOKEN.REFRESH)

    assert.isDefined(access)
    assert.isDefined(refresh)

    // O token nunca é lido por JavaScript do navegador: é o que impede que um
    // XSS o carregue embora.
    assert.isTrue(access!.httpOnly)
    assert.isTrue(refresh!.httpOnly)
  })

  test('senha errada e e-mail inexistente respondem o mesmo 401', async ({ client, assert }) => {
    const wrongPassword = await client
      .post('/authentication/sign-in')
      .json({ email: OWNER.email, password: 'Errada1!' })

    const unknownEmail = await client
      .post('/authentication/sign-in')
      .json({ email: 'ninguem@mail.com', password: OWNER.password })

    wrongPassword.assertStatus(401)
    unknownEmail.assertStatus(401)

    // Indistinguível por causa, de propósito: uma mensagem diferente para cada
    // caso diria a um curioso quais e-mails existem.
    assert.deepEqual(body(wrongPassword).code, body(unknownEmail).code)
    assert.deepEqual(body(wrongPassword).message, body(unknownEmail).message)
  })

  test('payload inválido é 422, e não 401', async ({ client }) => {
    const response = await client
      .post('/authentication/sign-in')
      .json({ email: 'nao-e-email', password: '' })

    response.assertStatus(422)
  })

  test('sign-out encerra a sessão e o cookie deixa de valer', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const signOut = await client.post('/authentication/sign-out').cookies(session)

    signOut.assertStatus(204)

    // O mesmo cookie, agora recusado: o token foi apagado do banco, não só do
    // navegador. Sem isto, quem tivesse copiado o valor continuaria dentro.
    const after = await client.get('/account/profile').cookies(session)

    after.assertStatus(401)
  })

  test('sign-out sem sessão é 401', async ({ client }) => {
    const response = await client.post('/authentication/sign-out')

    response.assertStatus(401)
  })
})
