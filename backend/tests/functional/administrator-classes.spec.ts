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

  test('recusa turma sem horário com 422', async ({ client, assert }) => {
    // Era aceito: `startsAtTime` e `endsAtTime` eram nulos "enquanto a
    // secretaria não fechou o horário". Turma anunciada assim não diz ao
    // candidato quando aparecer, e duas turmas do mesmo curso no mesmo sábado
    // de manhã ficavam indistinguíveis.
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload(course.id, { startsAtTime: null, endsAtTime: null }))

    response.assertStatus(422)
    assert.property(body(response).errors, 'startsAtTime')
    assert.property(body(response).errors, 'endsAtTime')
  })

  test('recusa término antes ou igual ao início', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const inverted = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload(course.id, { startsAtTime: '11:00', endsAtTime: '08:00' }))

    inverted.assertStatus(422)
    assert.property(body(inverted).errors, 'endsAtTime')

    // Aula de duração zero também não existe.
    const same = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload(course.id, { startsAtTime: '08:00', endsAtTime: '08:00' }))

    same.assertStatus(422)
  })

  test('reenviar a hora com segundos, como o banco devolve, passa', async ({ client }) => {
    // O Postgres devolve `08:00:00` e o formulário manda `08:00`. Comparar as
    // duas sem cortar os segundos reprovaria a edição de uma turma existente
    // que ninguém tocou.
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const entity = await createClass(client, session, course.id)

    const response = await client
      .put(`/administrator/classes/${entity.id}`)
      .cookies(session)
      .json({ startsAtTime: '08:00:00', endsAtTime: '11:00' })

    response.assertStatus(200)
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

/**
 * Arquivar não é apagar, e restaurar tem de trazer de volta inteiro.
 *
 * `courses` cobria isto desde o piloto e `classes` não cobria nada - as duas
 * rotas existem no mesmo grupo de ciclo de vida em `start/routes.ts`, e uma
 * delas nunca foi exercitada.
 */
test.group('administrador > turmas > ciclo de vida', (group) => {
  group.each.setup(() => resetDatabase())

  test('arquiva, some da listagem e volta com ?trashed=only', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const archive = await client
      .patch(`/administrator/classes/${turma.id}/archive`)
      .cookies(session)

    archive.assertStatus(204)

    const listed = await client.get('/administrator/classes').cookies(session)
    assert.isEmpty(body(listed).data)

    const trashed = await client
      .get('/administrator/classes')
      .qs({ trashed: 'only' })
      .cookies(session)

    assert.lengthOf(body(trashed).data, 1)
  })

  test('unarchive traz de volta, e turma viva é 404 lá', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    await client.patch(`/administrator/classes/${turma.id}/archive`).cookies(session)

    const unarchive = await client
      .patch(`/administrator/classes/${turma.id}/unarchive`)
      .cookies(session)

    unarchive.assertStatus(204)

    // Restaurar o que já está vivo não é operação: para quem chama, aquela linha
    // não existe na lixeira.
    const again = await client
      .patch(`/administrator/classes/${turma.id}/unarchive`)
      .cookies(session)

    again.assertStatus(404)
  })
})

/**
 * O `PUT` é merge parcial, e a distinção que importa é entre **ausente** e
 * **`null` explícito**: o primeiro não toca no campo, o segundo o limpa. Sem
 * ela, editar o nome da turma apagaria a data de término que ninguém mencionou.
 */
test.group('administrador > turmas > atualização parcial', (group) => {
  group.each.setup(() => resetDatabase())

  test('campo ausente não toca no que já estava lá', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { endsAt: '2026-06-27' })

    const response = await client
      .put(`/administrator/classes/${turma.id}`)
      .cookies(session)
      .json({ name: 'Turma 2 / 2026' })

    response.assertStatus(200)
    assert.equal(body(response).name, 'Turma 2 / 2026')
    assert.isNotNull(body(response).endsAt)
    // O que não veio no corpo continua igual ao que estava.
    assert.equal(body(response).capacity, 40)
  })

  test('null explícito limpa o campo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { endsAt: '2026-06-27' })

    const response = await client
      .put(`/administrator/classes/${turma.id}`)
      .cookies(session)
      .json({ endsAt: null })

    response.assertStatus(200)
    assert.isNull(body(response).endsAt)
    assert.equal(body(response).name, 'Turma 1 / 2026')
  })
})

test.group('administrador > turmas > horário', (group) => {
  group.each.setup(() => resetDatabase())

  /**
   * O que `weekday` e `shift` não separam.
   *
   * A escola abre duas turmas de programação no mesmo sábado de manhã, e a
   * única coisa diferente entre elas é a hora. Sem estas colunas as duas seriam
   * a mesma turma para quem lê o painel.
   */
  test('guarda a hora de início e de fim da turma', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload(course.id, { startsAtTime: '08:00', endsAtTime: '10:00' }))

    response.assertStatus(201)

    const entity = body(response)
    // O Postgres devolve `time` com segundos; o formulário manda sem. Os dois
    // formatos passam pelo validator, e é o do banco que volta na resposta.
    assert.equal(entity.startsAtTime.slice(0, 5), '08:00')
    assert.equal(entity.endsAtTime.slice(0, 5), '10:00')
  })

  test('recusa hora fora do relógio com 422 apontando o campo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client
      .post('/administrator/classes')
      .cookies(session)
      .json(classPayload(course.id, { startsAtTime: '25:00' }))

    response.assertStatus(422)
    assert.property(body(response).errors, 'startsAtTime')
  })

  test('a edição troca o horário sem tocar no resto', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, {
      startsAtTime: '13:00',
      endsAtTime: '15:00',
    })

    const response = await client
      .put(`/administrator/classes/${turma.id}`)
      .cookies(session)
      .json({ startsAtTime: '18:00', endsAtTime: '20:00' })

    response.assertStatus(200)

    const entity = body(response)
    assert.equal(entity.startsAtTime.slice(0, 5), '18:00')
    assert.equal(entity.endsAtTime.slice(0, 5), '20:00')
    assert.equal(entity.capacity, 40)
  })
})
