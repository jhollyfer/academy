import { test } from '@japa/runner'
import {
  authenticateAsAdministrator,
  authenticateAsOwner,
  authenticateAsResponsible,
  authenticateAsStudent,
  body,
  createClass,
  createCourse,
  enrollmentPayload,
  resetDatabase,
  type Session,
} from '../helpers.ts'
import type { ApiClient } from '@japa/api-client'

/**
 * A matriz de permissão do painel.
 *
 * `start/routes.ts` divide o ciclo de vida por verbo, e não por grupo: o
 * administrador **gerencia a lixeira** - arquiva e restaura -, e só o dono
 * **apaga de vez**. Por isso o `role(['OWNER'])` está em cada `DELETE`.
 *
 * A regra estava escrita em JSDoc e em nenhum teste. Trocar `['OWNER']` por
 * `['OWNER', 'ADMINISTRATOR']` por engano abriria o `DELETE` para o
 * administrador sem quebrar nada - nem a suíte, nem o typecheck, nem o lint. É
 * exatamente o tipo de mudança que ninguém revisa duas vezes.
 */

/** Um curso arquivado, pronto para o `DELETE` que os testes tentam. */
async function archivedCourse(client: ApiClient, session: Session): Promise<string> {
  const course = await createCourse(client, session)

  const response = await client
    .patch(`/administrator/courses/${course.id}/archive`)
    .cookies(session)

  response.assertStatus(204)

  return course.id
}

test.group('papéis > lixeira', (group) => {
  group.each.setup(() => resetDatabase())

  test('administrador arquiva e restaura', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const administrator = await authenticateAsAdministrator(client)
    const course = await createCourse(client, owner)

    const archive = await client
      .patch(`/administrator/courses/${course.id}/archive`)
      .cookies(administrator)

    archive.assertStatus(204)

    const unarchive = await client
      .patch(`/administrator/courses/${course.id}/unarchive`)
      .cookies(administrator)

    unarchive.assertStatus(204)
  })
})

test.group('papéis > apagar de vez', (group) => {
  group.each.setup(() => resetDatabase())

  test('administrador não apaga curso, mesmo arquivado', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const administrator = await authenticateAsAdministrator(client)
    const id = await archivedCourse(client, owner)

    const response = await client.delete(`/administrator/courses/${id}`).cookies(administrator)

    // 403 e não 404: o recurso existe e ele o enxerga - o que falta é o papel.
    // Fora de escopo seria 404; aqui o escopo é o mesmo e a permissão é que não.
    response.assertStatus(403)
  })

  test('dono apaga o mesmo curso', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const id = await archivedCourse(client, owner)

    const response = await client.delete(`/administrator/courses/${id}`).cookies(owner)

    response.assertStatus(204)
  })

  test('administrador não apaga turma', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const administrator = await authenticateAsAdministrator(client)
    const course = await createCourse(client, owner)
    const turma = await createClass(client, owner, course.id)

    await client.patch(`/administrator/classes/${turma.id}/archive`).cookies(owner)

    const response = await client
      .delete(`/administrator/classes/${turma.id}`)
      .cookies(administrator)

    response.assertStatus(403)
  })

  test('administrador não apaga matrícula', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const administrator = await authenticateAsAdministrator(client)
    const course = await createCourse(client, owner)
    const turma = await createClass(client, owner, course.id)

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const id = created.body().id

    await client.patch(`/administrator/enrollments/${id}/archive`).cookies(owner)

    const response = await client.delete(`/administrator/enrollments/${id}`).cookies(administrator)

    response.assertStatus(403)
  })
})

test.group('papéis > sem sessão', (group) => {
  group.each.setup(() => resetDatabase())

  test('sem cookie é 401, e não 403', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const id = await archivedCourse(client, owner)

    const response = await client.delete(`/administrator/courses/${id}`)

    // A ordem `auth` → `role` no grupo é o que garante isto: sem sessão o papel
    // do requisitante ainda é desconhecido, e responder 403 afirmaria algo que o
    // servidor não sabe.
    response.assertStatus(401)
  })
})

/**
 * O segundo eixo da matriz, que nasceu com os quatro papéis.
 *
 * O primeiro eixo — acima — é sobre **verbo**: quem arquiva e quem apaga. Este é
 * sobre **quem é o alvo**, e é a parte que o `RoleMiddleware` não alcança: ele
 * lê o papel de quem chama, nunca o de quem está sendo alterado. A regra mora na
 * `UserPolicy`, e sem estes testes trocar um `!==` por `===` lá dentro passaria
 * em silêncio.
 */
test.group('papéis > portal não entra no painel', (group) => {
  group.each.setup(() => resetDatabase())

  test('responsável recebe 403 na listagem do painel', async ({ client }) => {
    const session = await authenticateAsResponsible(client)

    const response = await client.get('/administrator/users').cookies(session)

    response.assertStatus(403)
  })

  test('aluno recebe 403 na listagem do painel', async ({ client }) => {
    const session = await authenticateAsStudent(client)

    const response = await client.get('/administrator/courses').cookies(session)

    response.assertStatus(403)
  })
})

test.group('papéis > o dono é invisível para o operador', (group) => {
  group.each.setup(() => resetDatabase())

  test('o dono não aparece na listagem do administrador', async ({ client, assert }) => {
    const session = await authenticateAsAdministrator(client)

    const response = await client.get('/administrator/users').cookies(session)

    response.assertStatus(200)

    const roles = body(response).data.map((user: { role: string }) => user.role)

    assert.notInclude(roles, 'OWNER')
  })

  test('o administrador recebe 404 ao abrir o dono pelo id', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const session = await authenticateAsAdministrator(client)

    const profile = await client.get('/account/profile').cookies(owner)
    const ownerId = body(profile).id

    const response = await client.get(`/administrator/users/${ownerId}`).cookies(session)

    // 404 e não 403: confirmar que o id existe já entregaria metade do que
    // esconder o dono pretende evitar.
    response.assertStatus(404)
  })

  test('o administrador recebe 403 ao editar o dono', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const session = await authenticateAsAdministrator(client)

    const profile = await client.get('/account/profile').cookies(owner)
    const ownerId = body(profile).id

    const response = await client
      .put(`/administrator/users/${ownerId}`)
      .cookies(session)
      .json({ name: 'Tomada de conta' })

    response.assertStatus(403)
  })
})

test.group('papéis > ninguém se promove', (group) => {
  group.each.setup(() => resetDatabase())

  test('o payload recusa OWNER', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const response = await client.post('/administrator/users').cookies(session).json({
      name: 'Tentativa',
      email: 'tentativa@mail.com',
      role: 'OWNER',
    })

    // 422 e não 403: o valor não está na lista que o schema aceita, então a
    // recusa é de formato. É a primeira das duas camadas.
    response.assertStatus(422)
  })

  test('o administrador não edita o próprio cadastro pelo painel', async ({ client }) => {
    const session = await authenticateAsAdministrator(client)

    const profile = await client.get('/account/profile').cookies(session)
    const id = body(profile).id

    const response = await client
      .put(`/administrator/users/${id}`)
      .cookies(session)
      .json({ name: 'Eu mesmo' })

    // A segunda camada. Sem ela, a defesa contra auto-promoção dependeria só do
    // validator - e bastaria um papel novo entrar em `MANAGEABLE_USER_ROLES`
    // para reabrir o caminho.
    response.assertStatus(403)
  })
})
