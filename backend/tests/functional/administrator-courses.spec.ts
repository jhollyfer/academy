import { test } from '@japa/runner'
import {
  authenticateAsOwner,
  body,
  coursePayload,
  createClass,
  createCourse,
  resetDatabase,
} from '../helpers.ts'

test.group('administrador > cursos', (group) => {
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

  test('a ficha conta as turmas vivas, como a listagem', async ({ client, assert }) => {
    // A ficha lia o mesmo `classesCount` da listagem, mas o `show` não agregava
    // nada: o `@computed` devolvia `undefined`, o campo sumia do JSON e a tela
    // mostrava "Turmas: -" para o curso que a lista ao lado dizia ter turma.
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    await createClass(client, session, course.id)
    const archived = await createClass(client, session, course.id)

    const removed = await client
      .patch(`/administrator/classes/${archived.id}/archive`)
      .cookies(session)

    removed.assertStatus(204)

    const response = await client.get(`/administrator/courses/${course.id}`).cookies(session)

    response.assertStatus(200)

    // Uma, e não duas: turma arquivada não ocupa o curso. É o mesmo filtro da
    // listagem, e discordar dele faria a ficha e a lista falarem números
    // diferentes do mesmo curso.
    assert.equal(body(response).classesCount, 1)
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

test.group('administrador > cursos > grade e FAQ', (group) => {
  group.each.setup(() => resetDatabase())

  test('grava a grade junto do curso, na ordem do array', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const course = await createCourse(client, session, {
      modules: [
        { title: 'Sábado 1 · Eletrônica básica' },
        { title: 'Sábado 2 · Arduino', description: 'Primeiro sketch.' },
      ],
      faqs: [{ question: 'Preciso levar notebook?', answer: 'Não. O laboratório tem.' }],
    })

    assert.lengthOf(course.modules, 2)
    // A ordem é o índice do array: ninguém digita `position`.
    assert.equal(course.modules[0].position, 0)
    assert.equal(course.modules[1].position, 1)
    assert.equal(course.modules[1].description, 'Primeiro sketch.')
    assert.lengthOf(course.faqs, 1)
  })

  /**
   * Trava o detalhe do encontro. Os três campos entraram depois, e o
   * `syncCourseModules` os grava no mesmo apaga-e-recria - um `?? null`
   * esquecido ali faria a página de curso perder encontros, tópicos e entrega
   * sem erro nenhum, só com a ementa voltando a ser título e descrição.
   */
  test('grava encontros, tópicos e entrega de cada módulo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const course = await createCourse(client, session, {
      modules: [
        {
          title: 'Sábado 1 · Eletrônica básica',
          sessionCount: 2,
          topics: 'Tensão e corrente\nMultímetro na mão',
          deliverable: 'Um circuito montado e medido',
        },
        { title: 'Sábado 2 · Arduino' },
      ],
    })

    assert.equal(course.modules[0].sessionCount, 2)
    assert.equal(course.modules[0].deliverable, 'Um circuito montado e medido')
    assert.include(course.modules[0].topics, 'Multímetro')
    // Módulo sem detalhe chega nulo, e não ausente: a página de curso decide
    // esconder a linha, e `undefined` deixaria a decisão para o `??` de cada
    // componente que a lê.
    assert.isNull(course.modules[1].sessionCount)
    assert.isNull(course.modules[1].deliverable)
  })

  test('recusa módulo que ocupa mais sábados que o curso inteiro', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    // O curso tem dezesseis sábados. Um módulo de quarenta descreveria um curso
    // que não existe.
    const response = await client
      .post('/administrator/courses')
      .cookies(session)
      .json(coursePayload({ modules: [{ title: 'Sábado 1', sessionCount: 40 }] }))

    response.assertStatus(422)
  })

  test('reenviar a grade substitui a anterior inteira', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session, {
      modules: [{ title: 'Sábado 1' }, { title: 'Sábado 2' }],
    })

    const response = await client
      .put(`/administrator/courses/${course.id}`)
      .cookies(session)
      .json({ modules: [{ title: 'Sábado 1 · reescrito' }] })

    response.assertStatus(200)

    const updated = body(response)
    // Apaga e recria: o módulo não tem identidade estável do lado do cliente.
    assert.lengthOf(updated.modules, 1)
    assert.equal(updated.modules[0].title, 'Sábado 1 · reescrito')
  })

  test('array ausente não mexe na grade; array vazio apaga', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session, { modules: [{ title: 'Sábado 1' }] })

    const untouched = await client
      .put(`/administrator/courses/${course.id}`)
      .cookies(session)
      .json({ tagline: 'Só mexendo na chamada' })

    // Campo ausente nunca limpa - é a regra de todo PUT daqui.
    assert.lengthOf(body(untouched).modules, 1)

    const cleared = await client
      .put(`/administrator/courses/${course.id}`)
      .cookies(session)
      .json({ modules: [] })

    assert.lengthOf(body(cleared).modules, 0)
  })

  test('apagar o curso leva a grade junto por cascata', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session, { modules: [{ title: 'Sábado 1' }] })

    await client.patch(`/administrator/courses/${course.id}/archive`).cookies(session)
    const response = await client.delete(`/administrator/courses/${course.id}`).cookies(session)

    response.assertStatus(204)

    // Sem a cascata isto seria um erro de chave estrangeira virando 500.
    const orphans = await client.get('/administrator/courses').cookies(session)
    assert.equal(body(orphans).meta.total, 0)
  })
})
