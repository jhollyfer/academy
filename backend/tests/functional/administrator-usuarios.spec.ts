import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import type { FakeMailer } from '@adonisjs/mail'
import type { ApiClient } from '@japa/api-client'
import User from '#models/user'
import AccountInvite from '#models/account_invite'
import { authenticateAsOwner, body, resetDatabase, type Session } from '../helpers.ts'

/**
 * O painel de usuários.
 *
 * Antes dele nenhum endpoint criava conta: o dono nascia pelo seeder e o resto
 * não existia. Por isso os testes aqui cobrem o caminho inteiro, e não só o
 * caso feliz - é a primeira porta de entrada de gente no sistema.
 */

/** Cria um usuário pelo painel e devolve o corpo. */
async function createUser(
  client: ApiClient,
  session: Session,
  payload: Record<string, unknown>
): Promise<Record<string, any>> {
  const response = await client.post('/administrator/users').cookies(session).json(payload)

  response.assertStatus(201)

  return body(response)
}

test.group('painel > usuários > criação', (group) => {
  group.each.setup(() => resetDatabase())

  test('com senha, a conta nasce pronta e entra', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    await createUser(client, session, {
      name: 'Secretária',
      email: 'secretaria@mail.com',
      role: 'ADMINISTRATOR',
      password: 'Secretaria1!',
      passwordConfirmation: 'Secretaria1!',
    })

    // A prova de que nasceu utilizável é o login, e não o 201.
    const signIn = await client
      .post('/authentication/sign-in')
      .json({ email: 'secretaria@mail.com', password: 'Secretaria1!' })

    signIn.assertStatus(204)
  })

  test('sem senha, emite convite e a senha não é adivinhável', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const created = await createUser(client, session, {
      name: 'Mãe do aluno',
      email: 'responsavel@mail.com',
      role: 'RESPONSIBLE',
    })

    const invite = await AccountInvite.query().where('userId', created.id).first()

    assert.isNotNull(invite)
    assert.isNull(invite!.consumedAt)

    const user = await User.findOrFail(created.id)
    assert.isNotNull(user.invitedAt)

    // A coluna é `notNullable`, então algo foi gravado. O que não pode é ser um
    // valor que alguém consiga prever - string vazia seria uma senha real.
    const guess = await client
      .post('/authentication/sign-in')
      .json({ email: 'responsavel@mail.com', password: '' })

    guess.assertStatus(422)
  })

  test('o token do convite não é gravado em texto', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const created = await createUser(client, session, {
      name: 'Aluno',
      email: 'aluno@mail.com',
      role: 'STUDENT',
    })

    const invite = await AccountInvite.findByOrFail('userId', created.id)

    // O hash do scrypt tem prefixo de algoritmo. O que importa é não haver como
    // ler o token a partir da linha.
    assert.notEqual(invite.tokenHash, '')
    assert.isTrue(invite.tokenHash.length > 32)
  })

  test('e-mail repetido é 409', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    await createUser(client, session, {
      name: 'Primeiro',
      email: 'repetido@mail.com',
      role: 'ADMINISTRATOR',
    })

    const response = await client.post('/administrator/users').cookies(session).json({
      name: 'Segundo',
      email: 'repetido@mail.com',
      role: 'ADMINISTRATOR',
    })

    response.assertStatus(409)
  })
})

test.group('painel > usuários > convite por e-mail', (group) => {
  let mails: FakeMailer

  group.each.setup(async () => {
    const teardown = await resetDatabase()
    mails = mail.fake()

    return async () => {
      mail.restore()
      await teardown()
    }
  })

  test('o convite sai para o e-mail da pessoa', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    await createUser(client, session, {
      name: 'Responsável',
      email: 'convidado@mail.com',
      role: 'RESPONSIBLE',
    })

    // `queued()` e não `sent()`: o envio é `sendLater`, então a mensagem entra
    // na fila configurada em `start/mail.ts` e nunca passa por `sent`.
    const queued = mails.messages.queued()

    assert.lengthOf(queued, 1)
    queued[0].assertRecipient('to', 'convidado@mail.com')
    assert.equal(queued[0].nodeMailerMessage.subject, 'Seu acesso ao Maiyu Academy')
    // O link precisa apontar para o site, não para a API: quem clica cai numa
    // tela. É o que `FRONTEND_URL` resolve, e o que um default errado quebraria
    // em silêncio - o e-mail sairia, chegaria, e não funcionaria.
    //
    // O caminho é o do roteador do frontend, que nomeia rota em inglês. Escrito
    // em português, o link caía no catch-all de 404 com todo o resto correto.
    assert.include(String(queued[0].nodeMailerMessage.html), '/authentication/invite/')
  })

  test('criar com senha não dispara convite', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    await createUser(client, session, {
      name: 'Equipe',
      email: 'equipe@mail.com',
      role: 'ADMINISTRATOR',
      password: 'Equipe123!',
      passwordConfirmation: 'Equipe123!',
    })

    assert.lengthOf(mails.messages.queued(), 0)
  })
})

test.group('painel > usuários > vínculo de guarda', (group) => {
  group.each.setup(() => resetDatabase())

  test('liga um aluno a um responsável, e é idempotente', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const responsible = await createUser(client, session, {
      name: 'Pai',
      email: 'pai@mail.com',
      role: 'RESPONSIBLE',
    })
    const student = await createUser(client, session, {
      name: 'Filha',
      email: 'filha@mail.com',
      role: 'STUDENT',
    })

    const first = await client
      .post(`/administrator/users/${responsible.id}/dependents`)
      .cookies(session)
      .json({ studentId: student.id })

    first.assertStatus(200)
    assert.lengthOf(body(first).dependents, 1)

    // O par é UNIQUE no banco: sem a checagem prévia isto seria um 500 de índice
    // duplicado, e não um 200.
    const again = await client
      .post(`/administrator/users/${responsible.id}/dependents`)
      .cookies(session)
      .json({ studentId: student.id })

    again.assertStatus(200)
    assert.lengthOf(body(again).dependents, 1)
  })

  test('recusa quando os papéis não batem', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const administrator = await createUser(client, session, {
      name: 'Operador',
      email: 'operador@mail.com',
      role: 'ADMINISTRATOR',
    })
    const student = await createUser(client, session, {
      name: 'Aluno',
      email: 'aluno2@mail.com',
      role: 'STUDENT',
    })

    // Vincular é conceder leitura sobre os dados de outra pessoa. Um operador
    // não é responsável por ninguém, e aceitar isto daria acesso pela porta
    // errada.
    const response = await client
      .post(`/administrator/users/${administrator.id}/dependents`)
      .cookies(session)
      .json({ studentId: student.id })

    response.assertStatus(422)
  })

  test('desvincular é idempotente', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const responsible = await createUser(client, session, {
      name: 'Mãe',
      email: 'mae@mail.com',
      role: 'RESPONSIBLE',
    })
    const student = await createUser(client, session, {
      name: 'Filho',
      email: 'filho@mail.com',
      role: 'STUDENT',
    })

    const response = await client
      .delete(`/administrator/users/${responsible.id}/dependents/${student.id}`)
      .cookies(session)

    response.assertStatus(200)
    assert.lengthOf(body(response).dependents, 0)
  })
})

test.group('painel > usuários > lixeira', (group) => {
  group.each.setup(() => resetDatabase())

  test('arquivar derruba o acesso na requisição seguinte', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const created = await createUser(client, session, {
      name: 'Temporário',
      email: 'temporario@mail.com',
      role: 'ADMINISTRATOR',
      password: 'Temporario1!',
      passwordConfirmation: 'Temporario1!',
    })

    const victim = await client
      .post('/authentication/sign-in')
      .json({ email: 'temporario@mail.com', password: 'Temporario1!' })

    const cookies = {
      'access-token': victim.cookie('access-token')!.value,
      'refresh-token': victim.cookie('refresh-token')!.value,
    }

    // A sessão está válida agora.
    const before = await client.get('/account/profile').cookies(cookies)
    before.assertStatus(200)

    await client.patch(`/administrator/users/${created.id}/archive`).cookies(session)

    // E deixa de valer sem esperar o token expirar. Antes do filtro no guard,
    // este 401 era um 200 pelo resto do dia.
    const after = await client.get('/account/profile').cookies(cookies)
    after.assertStatus(401)
  })

  test('apagar exige arquivar antes', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const created = await createUser(client, session, {
      name: 'Vivo',
      email: 'vivo@mail.com',
      role: 'ADMINISTRATOR',
    })

    const response = await client.delete(`/administrator/users/${created.id}`).cookies(session)

    response.assertStatus(409)
  })
})
