import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import type { FakeMailer } from '@adonisjs/mail'
import {
  authenticateAsOwner,
  createClass,
  createCourse,
  enrollmentPayload,
  resetDatabase,
} from '../../helpers.ts'

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
