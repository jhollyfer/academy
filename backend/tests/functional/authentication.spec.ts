import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import AccountInvite from '#models/account_invite'
import InviteService from '#services/invite.service'
import { UserFactory } from '#database/factories/user_factory'
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

/**
 * O convite, que é a única porta por onde uma família escolhe a própria senha.
 *
 * `mail.fake()` porque `InviteService.issue()` manda e-mail no caminho real, e
 * o valor do teste está justamente em passar por ele - o token devolvido é o
 * mesmo que iria no link.
 */
test.group('autenticação > convite', (group) => {
  group.each.setup(() => resetDatabase())
  group.each.setup(() => {
    mail.fake()

    return () => mail.restore()
  })

  const NEW_PASSWORD = 'NovaSenha1!'

  async function issueInvite() {
    const user = await UserFactory.apply('responsible').create()
    const token = await new InviteService().issue(user)

    return { user, token: token! }
  }

  test('token válido é conferido com 204 e sem corpo', async ({ client, assert }) => {
    const { token } = await issueInvite()

    const response = await client.get(`/authentication/invite/${token}`)

    response.assertStatus(204)
    // Sem corpo de propósito: o endpoint é público, e devolver a conta aqui
    // entregaria o e-mail do titular a qualquer um com o link.
    assert.isEmpty(response.text())
  })

  test('define a senha, abre a sessão e consome o convite', async ({ client, assert }) => {
    const { user, token } = await issueInvite()

    const response = await client
      .post(`/authentication/invite/${token}`)
      .json({ password: NEW_PASSWORD, passwordConfirmation: NEW_PASSWORD })

    response.assertStatus(204)

    // A sessão sai na mesma resposta: quem acabou de definir a senha não é
    // mandado para a tela de login digitá-la de novo.
    assert.isDefined(response.cookie(COOKIE_TOKEN.ACCESS))
    assert.isDefined(response.cookie(COOKIE_TOKEN.REFRESH))

    // E a senha vale de verdade na porta da frente.
    const signIn = await client
      .post('/authentication/sign-in')
      .json({ email: user.email, password: NEW_PASSWORD })

    signIn.assertStatus(204)

    const invite = await AccountInvite.query().where('userId', user.id).firstOrFail()

    assert.isNotNull(invite.consumedAt)

    // Consumir o convite prova a posse da caixa: o token só existiu lá dentro.
    await user.refresh()
    assert.isNotNull(user.emailVerifiedAt)
  })

  test('o mesmo link não serve duas vezes', async ({ client, assert }) => {
    const { token } = await issueInvite()

    const first = await client
      .post(`/authentication/invite/${token}`)
      .json({ password: NEW_PASSWORD, passwordConfirmation: NEW_PASSWORD })

    first.assertStatus(204)

    const second = await client
      .post(`/authentication/invite/${token}`)
      .json({ password: 'OutraSenha1!', passwordConfirmation: 'OutraSenha1!' })

    second.assertStatus(409)
    // "Já usado" e não "não existe": o JSDoc de `AccountInvite.isUsable` separa
    // os dois para que esta resposta possa mandar entrar, em vez de mandar
    // pedir outro link.
    assert.equal(body(second).code, 'INVITE_ALREADY_USED')
  })

  test('convite expirado é recusado', async ({ client, assert }) => {
    const { user, token } = await issueInvite()

    await AccountInvite.query()
      .where('userId', user.id)
      .update({ expiresAt: DateTime.now().minus({ days: 1 }).toSQL() })

    const response = await client
      .post(`/authentication/invite/${token}`)
      .json({ password: NEW_PASSWORD, passwordConfirmation: NEW_PASSWORD })

    response.assertStatus(409)
    assert.equal(body(response).code, 'INVITE_EXPIRED')
  })

  test('token inexistente é 404', async ({ client, assert }) => {
    const response = await client.get(`/authentication/invite/${'a'.repeat(64)}`)

    response.assertStatus(404)
    assert.equal(body(response).code, 'INVITE_NOT_FOUND')
  })

  test('token de formato errado é 422, e não 404', async ({ client }) => {
    const response = await client.get('/authentication/invite/curto-demais')

    // Recusar pelo formato antes de ir ao banco é o que impede que o endpoint
    // público vire uma sonda barata de consulta por token arbitrário.
    response.assertStatus(422)
  })

  test('senha fraca é recusada, e o convite continua aberto', async ({ client, assert }) => {
    const { user, token } = await issueInvite()

    const response = await client
      .post(`/authentication/invite/${token}`)
      .json({ password: 'fraca', passwordConfirmation: 'fraca' })

    response.assertStatus(422)

    const invite = await AccountInvite.query().where('userId', user.id).firstOrFail()

    // Uma tentativa recusada não pode queimar o link: quem errou a senha
    // precisa poder tentar de novo pelo mesmo e-mail.
    assert.isNull(invite.consumedAt)
  })

  test('confirmação divergente é recusada', async ({ client }) => {
    const { token } = await issueInvite()

    const response = await client
      .post(`/authentication/invite/${token}`)
      .json({ password: NEW_PASSWORD, passwordConfirmation: 'Diferente1!' })

    response.assertStatus(422)
  })

  test('convite de conta desativada não abre sessão', async ({ client, assert }) => {
    const user = await UserFactory.apply('responsible').apply('inactive').create()
    const token = await new InviteService().issue(user)

    const response = await client
      .post(`/authentication/invite/${token}`)
      .json({ password: NEW_PASSWORD, passwordConfirmation: NEW_PASSWORD })

    response.assertStatus(409)
    assert.equal(body(response).code, 'INVITE_ACCOUNT_UNAVAILABLE')
  })
})
