import { test } from '@japa/runner'
import {
  authenticateAsOwner,
  body,
  createClass,
  createCourse,
  enrollmentPayload,
  resetDatabase,
} from '#tests/helpers'

test.group('storefront/enrollments', (group) => {
  group.each.setup(() => resetDatabase())

  test('envia matrícula sem sessão e recebe o protocolo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    response.assertStatus(201)

    const enrollment = body(response)
    assert.equal(enrollment.status, 'PENDING')
    // A única credencial que o candidato leva embora. Vem de DEFAULT no banco:
    // sem o `refresh` do use-case sairia indefinida.
    assert.isString(enrollment.protocol)
    assert.notEqual(enrollment.protocol, enrollment.id)
    // Instante e não booleano: a LGPD pede saber quando o titular consentiu.
    assert.isNotNull(enrollment.lgpdConsentAt)
  })

  test('menor de idade sem responsável é 422 com um erro por campo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentBirthDate: '2015-05-10' }))

    response.assertStatus(422)

    const errors = body(response).errors
    // Três campos marcados, e não uma mensagem no root: o formulário precisa
    // pintar os três inputs que faltam.
    assert.property(errors, 'guardianName')
    assert.property(errors, 'guardianDocument')
    assert.property(errors, 'guardianPhone')
  })

  test('menor de idade com responsável é aceito', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client.post('/storefront/enrollments').json(
      enrollmentPayload(turma.id, {
        studentBirthDate: '2015-05-10',
        guardianName: 'Maria Souza',
        guardianDocument: '39053344705',
        guardianPhone: '97984600872',
      })
    )

    response.assertStatus(201)
  })

  test('turma lotada entra como WAITLIST em vez de recusar', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { capacity: 1 })

    const first = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    first.assertStatus(201)
    assert.equal(body(first).status, 'PENDING')

    const second = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { email: 'segundo@exemplo.com' }))

    // A vaga não estoura e o candidato não é mandado embora.
    second.assertStatus(201)
    assert.equal(body(second).status, 'WAITLIST')

    // E a turma virou FULL sozinha - `FULL` é derivado, não digitado.
    const view = await client.get(`/administrator/classes/${turma.id}`).cookies(session)
    assert.equal(body(view).status, 'FULL')
    assert.equal(body(view).seatsRemaining, 0)
  })

  test('cancelar devolve a vaga e a turma volta a OPEN', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { capacity: 1 })

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const enrollment = body(created)

    const cancelled = await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: 'CANCELLED' })

    cancelled.assertStatus(200)

    const view = await client.get(`/administrator/classes/${turma.id}`).cookies(session)
    assert.equal(body(view).status, 'OPEN')
    assert.equal(body(view).seatsRemaining, 1)
  })

  test('turma fechada não aceita matrícula', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { status: 'CLOSED' })

    const response = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    response.assertStatus(422)
    assert.equal(body(response).code, 'CLASS_UNAVAILABLE')
  })

  test('curso fora do ar não aceita matrícula na turma dele', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    await client
      .put(`/administrator/courses/${course.id}`)
      .cookies(session)
      .json({ status: 'INACTIVE' })

    const response = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    response.assertStatus(422)
    assert.equal(body(response).code, 'CLASS_UNAVAILABLE')
  })

  test('acompanha pelo protocolo e não vê a anotação da secretaria', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const enrollment = body(created)

    await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ notes: 'Ligar para confirmar o Pix' })

    const response = await client.get(`/storefront/enrollments/${enrollment.protocol}`)

    response.assertStatus(200)
    assert.equal(body(response).protocol, enrollment.protocol)
    // A anotação é sobre o candidato, não para ele.
    assert.isNull(body(response).notes)
    // Mas a secretaria continua vendo.
    const admin = await client.get(`/administrator/enrollments/${enrollment.id}`).cookies(session)
    assert.equal(body(admin).notes, 'Ligar para confirmar o Pix')
  })

  test('protocolo inexistente é 404', async ({ client }) => {
    const response = await client.get(
      '/storefront/enrollments/00000000-0000-4000-8000-000000000000'
    )

    response.assertStatus(404)
  })

  test('confirmar sem comprovante é recusado', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const enrollment = body(created)

    const response = await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: 'CONFIRMED' })

    // Não há gateway: o arquivo é a única prova que existe.
    response.assertStatus(409)
    assert.equal(body(response).code, 'ENROLLMENT_RECEIPT_MISSING')
  })

  test('transição inválida é 409', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const enrollment = body(created)

    await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: 'CANCELLED' })

    const response = await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: 'PENDING' })

    // `CANCELLED` é terminal.
    response.assertStatus(409)
    assert.equal(body(response).code, 'ENROLLMENT_INVALID_TRANSITION')
  })
})

test.group('storefront/courses', (group) => {
  group.each.setup(() => resetDatabase())

  test('lista só curso ativo e não removido, sem sessão', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    await createCourse(client, session)
    const hidden = await createCourse(client, session, {
      name: 'Web Development Fundamentals',
      accent: 'WEB',
    })

    await client
      .put(`/administrator/courses/${hidden.id}`)
      .cookies(session)
      .json({ status: 'INACTIVE' })

    const response = await client.get('/storefront/courses')

    response.assertStatus(200)
    assert.equal(body(response).meta.total, 1)
  })

  test('detalha pelo slug com grade, FAQ e a próxima turma', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session, {
      modules: [{ title: 'Sábado 1 · Eletrônica básica' }],
      faqs: [{ question: 'Preciso levar notebook?', answer: 'Não.' }],
    })
    await createClass(client, session, course.id)

    const response = await client.get(`/storefront/courses/${course.slug}`)

    response.assertStatus(200)

    const detail = body(response)
    assert.lengthOf(detail.modules, 1)
    assert.lengthOf(detail.faqs, 1)
    // Uma turma, não um array de uma: qual é "a próxima" é decisão do servidor.
    assert.equal(detail.nextClass.seatsRemaining, 40)
  })

  test('curso sem turma anunciada vem com nextClass nulo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client.get(`/storefront/courses/${course.slug}`)

    // `null` é "não há turma anunciada", que é diferente de o campo sumir.
    assert.isNull(body(response).nextClass)
  })

  test('slug inexistente é 404', async ({ client }) => {
    const response = await client.get('/storefront/courses/curso-que-nao-existe')

    response.assertStatus(404)
  })
})
