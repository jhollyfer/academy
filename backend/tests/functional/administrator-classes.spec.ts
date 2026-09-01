import { test } from '@japa/runner'
import {
  authenticateAsOwner,
  body,
  classPayload,
  createClass,
  createCourse,
  resetDatabase,
} from '../helpers.ts'

test.group('administrador > turmas', (group) => {
  group.each.setup(() => resetDatabase())

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.get('/administrator/classes')

    response.assertStatus(401)
  })

  test('cria uma turma e devolve 201 com o status vindo do banco', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload(course.id))

    response.assertStatus(201)

    const entity = body(response)
    assert.equal(entity.capacity, 40)
    // Vem de DEFAULT no banco: sem o `refresh` do use-case sairia indefinido.
    assert.equal(entity.status, 'OPEN')
  })

  test('recusa curso inexistente com 422 apontando o campo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const response = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload('00000000-0000-4000-8000-000000000000'))

    // 422 e não 500: sem a checagem, o INSERT estouraria a chave estrangeira.
    response.assertStatus(422)
    assert.property(body(response).errors, 'courseId')
  })

  test('recusa FULL no payload: é derivado, não digitado', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload(course.id, { status: 'FULL' }))

    response.assertStatus(422)
  })

  test('recusa data de fim anterior à de início', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload(course.id, { startsAt: '2026-03-07', endsAt: '2026-01-10' }))

    response.assertStatus(422)
  })

  test('lista com a ocupação calculada e o curso aninhado', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    await createClass(client, session, course.id)

    const response = await client.get('/administrator/classes').cookies(session)

    response.assertStatus(200)

    const page = body(response)
    assert.equal(page.meta.total, 1)
    assert.equal(page.data[0].seatsTaken, 0)
    assert.equal(page.data[0].seatsRemaining, 40)
    assert.equal(page.data[0].course.id, course.id)
  })

  test('filtra por curso', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const robotics = await createCourse(client, session)
    const web = await createCourse(client, session, {
      name: 'Web Development Fundamentals',
      accent: 'WEB',
    })

    await createClass(client, session, robotics.id)
    await createClass(client, session, web.id, { name: 'Turma Web 1' })

    const response = await client
      .get('/administrator/classes')
      .cookies(session)
      .qs({ courseId: web.id })

    assert.equal(body(response).meta.total, 1)
    assert.equal(body(response).data[0].name, 'Turma Web 1')
  })

  test('delete recusa turma que não passou pela lixeira', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const entity = await createClass(client, session, course.id)

    const response = await client.delete(`/administrator/classes/${entity.id}`).cookies(session)

    response.assertStatus(409)
    assert.equal(body(response).code, 'CLASS_NOT_ARCHIVED')
  })

  test('apagar curso com turma é recusado com 409', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    await createClass(client, session, course.id)

    await client.patch(`/administrator/courses/${course.id}/archive`).cookies(session)

    const response = await client.delete(`/administrator/courses/${course.id}`).cookies(session)

    // 409 e não 500: a FK é `RESTRICT` e estouraria no banco.
    response.assertStatus(409)
    assert.equal(body(response).code, 'COURSE_HAS_CLASSES')
  })
})
