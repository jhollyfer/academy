import { test } from '@japa/runner'
import {
  authenticateAsAdministrator,
  authenticateAsOwner,
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
