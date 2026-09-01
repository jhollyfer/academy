import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import { StorefrontEnrollmentCreateValidator } from '#core/validator'
import {
  authenticateAsOwner,
  body,
  createClass,
  createCourse,
  enrollmentPayload,
  resetDatabase,
} from '../helpers.ts'
import type { FakeMailer } from '@adonisjs/mail'

test.group('vitrine > matrículas', (group) => {
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

/**
 * O aceite do contrato e o consentimento da LGPD.
 *
 * Testado contra o **validator**, e não pela rota como o resto: o registro de
 * rotas tipa os dois campos como `literal(true)`, e o cliente do Japa recusa
 * `false` em tempo de compilação - o corpo inválido não é construível ali. O que
 * importa provar é que o servidor os exige, e é o validator quem os exige.
 */
test.group('vitrine > matrículas > consentimento', () => {
  const base = {
    classId: '00000000-0000-4000-8000-000000000000',
    studentName: 'João da Silva',
    studentBirthDate: '2000-04-12',
    email: 'joao@exemplo.com',
    phone: '97984600872',
    termsAccepted: true,
    lgpdConsent: true,
  }

  test('aceita o payload com os dois aceites marcados', async ({ assert }) => {
    const payload = await StorefrontEnrollmentCreateValidator.validate(base)

    assert.equal(payload.email, 'joao@exemplo.com')
  })

  test('recusa sem o consentimento da LGPD', async ({ assert }) => {
    await assert.rejects(() =>
      StorefrontEnrollmentCreateValidator.validate({ ...base, lgpdConsent: false })
    )
  })

  test('recusa sem o aceite do contrato', async ({ assert }) => {
    await assert.rejects(() =>
      StorefrontEnrollmentCreateValidator.validate({ ...base, termsAccepted: false })
    )
  })

  test('recusa telefone que não é telefone', async ({ assert }) => {
    await assert.rejects(() =>
      StorefrontEnrollmentCreateValidator.validate({ ...base, phone: 'nao tenho fone' })
    )
  })

  test('recusa CPF com dígito verificador errado', async ({ assert }) => {
    await assert.rejects(() =>
      StorefrontEnrollmentCreateValidator.validate({ ...base, studentDocument: '11111111111' })
    )
  })

  test('aceita CPF mascarado e grava só os dígitos', async ({ assert }) => {
    const payload = await StorefrontEnrollmentCreateValidator.validate({
      ...base,
      studentDocument: '390.533.447-05',
    })

    // O `parse()` tira a máscara antes de qualquer regra: sem isso o mesmo CPF
    // existiria no banco de duas formas.
    assert.equal(payload.studentDocument, '39053344705')
  })
})

/**
 * O aviso que a secretaria recebe quando alguém se inscreve.
 *
 * `mail.fake()` troca o transporte antes de qualquer envio, então nada sai da
 * máquina - e o teste continua exercitando o caminho real do use-case, que é o
 * que importa. As mensagens vão para `queued` e não para `sent` porque o serviço
 * usa `sendLater`: enfileirar é o comportamento, e afirmar `sent` provaria o
 * oposto do desenhado.
 */
test.group('vitrine > matrículas > aviso para a secretaria', (group) => {
  let mails: FakeMailer

  group.each.setup(() => resetDatabase())
  group.each.setup(() => {
    mails = mail.fake()

    // Só restaura. `clear()` depois de `restore()` mexe num fake que já saiu de
    // cena e estoura no teardown.
    return () => mail.restore()
  })

  test('matrícula nova enfileira o aviso com o protocolo no corpo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentName: 'Maria de Souza' }))

    response.assertStatus(201)

    const queued = mails.messages.queued()

    assert.lengthOf(queued, 1)
    assert.equal(queued[0].nodeMailerMessage.subject, 'Nova matrícula: Maria de Souza')
    assert.include(String(queued[0].nodeMailerMessage.html), response.body().protocol)
    queued[0].assertRecipient('to', 'secretaria@maiyu.test')
  })

  test('fila de espera muda o assunto do aviso', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { capacity: 1 })

    await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentName: 'Ana Ribeiro', email: 'ana@exemplo.com' }))

    response.assertStatus(201)
    assert.equal(response.body().status, 'WAITLIST')

    const queued = mails.messages.queued()

    assert.lengthOf(queued, 2)
    assert.equal(queued[1].nodeMailerMessage.subject, 'Fila de espera: Ana Ribeiro')
  })
})
