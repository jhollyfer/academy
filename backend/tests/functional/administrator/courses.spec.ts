import { test } from '@japa/runner'
import {
  authenticateAsOwner,
  body,
  coursePayload,
  createCourse,
  resetDatabase,
} from '#tests/helpers'

test.group('administrator/courses', (group) => {
  group.each.setup(() => resetDatabase())

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.get('/administrator/courses')

    response.assertStatus(401)
  })

  test('cria um curso e devolve 201 com o objeto nu', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const response = await client
      .post('/administrator/courses')
      .cookies(session)
      .json(coursePayload())

    response.assertStatus(201)

    const course = body(response)
    assert.equal(course.name, 'Robotics Fundamentals')
    // O slug sai do nome quando não é enviado.
    assert.equal(course.slug, 'robotics-fundamentals')
    // `status` e `position` vêm de DEFAULT no banco: sem o `refresh` do
    // use-case sairiam indefinidos.
    assert.equal(course.status, 'ACTIVE')
    assert.equal(course.position, 0)
  })

  test('o slug enviado vence o derivado do nome', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const course = await createCourse(client, session, { slug: 'Robótica!!' })

    // Passa pelo mesmo `normalize`: aceitar o valor cru deixaria a URL quebrada.
    assert.equal(course.slug, 'robotica')
  })

  test('recusa slug duplicado com 409 apontando o campo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    await createCourse(client, session)

    const response = await client
      .post('/administrator/courses')
      .cookies(session)
      .json(coursePayload())

    response.assertStatus(409)

    const error = body(response)
    assert.equal(error.code, 'COURSE_ALREADY_EXISTS')
    // O slug saiu do nome, então o erro marca `name` - quem digitou só o nome
    // veria o erro sob um input vazio se marcasse `slug`.
    assert.property(error.errors, 'name')
  })

  test('recria sobre a linha arquivada em vez de duplicar', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const first = await createCourse(client, session)

    await client.patch(`/administrator/courses/${first.id}/archive`).cookies(session)

    const response = await client
      .post('/administrator/courses')
      .cookies(session)
      .json(coursePayload({ description: 'Ementa nova, mesma vaga de endereço.' }))

    response.assertStatus(201)

    const revived = body(response)
    // Mesmo `id`: a linha foi ressuscitada, e com ela a grade e o FAQ que
    // apontam para ele.
    assert.equal(revived.id, first.id)
    assert.equal(revived.deletedAt, null)
  })

  test('recusa payload inválido com 422', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const response = await client
      .post('/administrator/courses')
      .cookies(session)
      .json(coursePayload({ accent: 'MUSICA' }))

    response.assertStatus(422)
  })

  test('recusa ?sort fora da lista com 422, e não com 500 do banco', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const response = await client
      .get('/administrator/courses')
      .cookies(session)
      .qs({ sort: 'deletedAt' })

    response.assertStatus(422)
  })

  test('lista paginado com envelope e conta as turmas', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    await createCourse(client, session)

    const response = await client.get('/administrator/courses').cookies(session)

    response.assertStatus(200)

    const page = body(response)
    assert.equal(page.meta.total, 1)
    assert.lengthOf(page.data, 1)
    assert.equal(page.data[0].classesCount, 0)
  })

  test('curso arquivado some da listagem e volta com ?trashed=only', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const archived = await client
      .patch(`/administrator/courses/${course.id}/archive`)
      .cookies(session)

    archived.assertStatus(204)

    const alive = await client.get('/administrator/courses').cookies(session)
    assert.equal(body(alive).meta.total, 0)

    const trashed = await client
      .get('/administrator/courses')
      .cookies(session)
      .qs({ trashed: 'only' })

    assert.equal(body(trashed).meta.total, 1)
  })

  test('show não encontra curso arquivado', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    await client.patch(`/administrator/courses/${course.id}/archive`).cookies(session)

    const response = await client.get(`/administrator/courses/${course.id}`).cookies(session)

    response.assertStatus(404)
  })

  test('unarchive traz de volta, e curso vivo é 404 lá', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    // Vivo: o espelho exato do 404 que `archive` dá para arquivado.
    const alive = await client
      .patch(`/administrator/courses/${course.id}/unarchive`)
      .cookies(session)

    alive.assertStatus(404)

    await client.patch(`/administrator/courses/${course.id}/archive`).cookies(session)

    const restored = await client
      .patch(`/administrator/courses/${course.id}/unarchive`)
      .cookies(session)

    restored.assertStatus(204)
  })

  test('atualiza por merge parcial sem tocar no que não veio', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client
      .put(`/administrator/courses/${course.id}`)
      .cookies(session)
      .json({ tagline: 'Do Arduino ao projeto final' })

    response.assertStatus(200)

    const updated = body(response)
    assert.equal(updated.tagline, 'Do Arduino ao projeto final')
    // Não veio no payload: continua o que era.
    assert.equal(updated.name, course.name)
    assert.equal(updated.slug, course.slug)
  })

  test('delete recusa curso que não passou pela lixeira', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client.delete(`/administrator/courses/${course.id}`).cookies(session)

    response.assertStatus(409)
    assert.equal(body(response).code, 'COURSE_NOT_ARCHIVED')
  })

  test('delete apaga o curso já arquivado', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    await client.patch(`/administrator/courses/${course.id}/archive`).cookies(session)

    const response = await client.delete(`/administrator/courses/${course.id}`).cookies(session)

    response.assertStatus(204)
  })

  test('id que não é uuid é 422, e não 404', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const response = await client.get('/administrator/courses/nao-e-uuid').cookies(session)

    response.assertStatus(422)
  })
})
