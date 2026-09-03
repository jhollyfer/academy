import { test } from '@japa/runner'
import { UserFactory } from '#database/factories/user_factory'
import { authenticateAsOwner, body, OWNER, resetDatabase } from '../helpers.ts'

test.group('conta > leitura', (group) => {
  group.each.setup(() => resetDatabase())

  test('devolve a conta da sessão, sem a senha', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const response = await client.get('/account/profile').cookies(session)

    response.assertStatus(200)

    const profile = body(response)

    assert.equal(profile.email, OWNER.email)
    assert.equal(profile.role, 'OWNER')
    assert.notProperty(profile, 'password')
  })

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.get('/account/profile')

    response.assertStatus(401)
  })
})

/**
 * A edição da própria conta.
 *
 * É o único caminho para trocar a própria senha: o update de usuários recusa
 * `password` de propósito, para a secretaria não assumir a conta de uma família
 * sem deixar rastro. `user_policy.ts` já apontava para cá antes de esta rota
 * existir.
 */
test.group('conta > edição', (group) => {
  group.each.setup(() => resetDatabase())

  test('edita o próprio nome', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const response = await client
      .put('/account')
      .cookies(session)
      .json({ name: 'Secretaria Maiyu' })

    response.assertStatus(200)
    assert.equal(body(response).name, 'Secretaria Maiyu')
  })

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.put('/account').json({ name: 'Qualquer' })

    response.assertStatus(401)
  })

  test('trocar a senha sem a atual é 422', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    // O `requiredIfExists` do validator: a obrigatoriedade condicional é forma
    // do payload, e vira 422 apontando o campo.
    const response = await client.put('/account').cookies(session).json({ password: 'NovaSenha1!' })

    response.assertStatus(422)
    assert.equal(body(response).code, 'VALIDATION_ERROR')
  })

  test('senha atual errada não troca a senha', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    // O cookie prova posse do navegador; a senha prova identidade. Sem esta
    // recusa, uma sessão sequestrada trocaria a senha da conta.
    const erradaDeProposito = {
      password: 'NovaSenha1!',
      passwordConfirmation: 'NovaSenha1!',
      currentPassword: 'ErradaDeProposito1!',
    }

    const response = await client.put('/account').cookies(session).json(erradaDeProposito)

    response.assertStatus(422)
    assert.equal(body(response).code, 'CURRENT_PASSWORD_INVALID')

    // E a senha antiga continua valendo.
    const entrada = await client.post('/authentication/sign-in').json(OWNER)

    entrada.assertStatus(204)
  })

  test('a nova senha não pode ser a atual', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const mesma = {
      password: OWNER.password,
      passwordConfirmation: OWNER.password,
      currentPassword: OWNER.password,
    }

    const response = await client.put('/account').cookies(session).json(mesma)

    response.assertStatus(422)
    assert.equal(body(response).code, 'PASSWORD_SAME_AS_CURRENT')
  })

  test('troca a senha e derruba as sessões', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    // Fora do literal porque `passwordConfirmation` não existe no payload
    // inferido: o `.confirmed()` do VineJS lê o campo do input cru, então ele é
    // obrigatório na requisição e ausente no tipo.
    const troca = {
      password: 'NovaSenha1!',
      passwordConfirmation: 'NovaSenha1!',
      currentPassword: OWNER.password,
    }

    const response = await client.put('/account').cookies(session).json(troca)

    response.assertStatus(200)

    // Um token anterior à troca sobreviveria à mudança que existe justamente
    // para revogá-lo.
    const antiga = await client.get('/account/profile').cookies(session)

    antiga.assertStatus(401)

    const nova = await client
      .post('/authentication/sign-in')
      .json({ email: OWNER.email, password: 'NovaSenha1!' })

    nova.assertStatus(204)

    // E a antiga não entra mais.
    const velha = await client.post('/authentication/sign-in').json(OWNER)

    velha.assertStatus(401)
    assert.equal(body(velha).code, 'INVALID_CREDENTIALS')
  })

  test('e-mail já usado por outra conta é 409', async ({ client, assert }) => {
    const outro = await UserFactory.create()
    const session = await authenticateAsOwner(client)

    const response = await client.put('/account').cookies(session).json({ email: outro.email })

    response.assertStatus(409)
    assert.equal(body(response).code, 'USER_ALREADY_EXISTS')
  })

  test('papel e situação não são editáveis por aqui', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    // Não estão no schema, então o VineJS os descarta em silêncio: o que não
    // pode acontecer é a linha mudar. Quem muda papel é o painel de usuários.
    // Fora do literal pelo mesmo motivo do bloco acima: os dois campos não
    // existem no payload, e é isso que o teste quer exercitar.
    const escalada = {
      name: 'Nome novo',
      role: 'STUDENT',
      status: 'INACTIVE',
    }

    const response = await client.put('/account').cookies(session).json(escalada)

    response.assertStatus(200)
    assert.equal(body(response).name, 'Nome novo')
    assert.equal(body(response).role, 'OWNER')
    assert.equal(body(response).status, 'ACTIVE')
  })

  test('avatar inexistente é recusado, e não vira 500', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    // Sem a checagem, a violação da chave estrangeira estouraria como erro de
    // servidor em vez de resposta de validação.
    const response = await client
      .put('/account')
      .cookies(session)
      .json({ avatarId: '00000000-0000-4000-8000-000000000000' })

    response.assertStatus(422)
  })
})
