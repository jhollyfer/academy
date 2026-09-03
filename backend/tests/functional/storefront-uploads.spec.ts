import { test } from '@japa/runner'
import Storage from '#models/storage'
import Enrollment from '#models/enrollment'
import { EnrollmentFileKinds, EnrollmentStatuses, UploadStatuses } from '#core/entity'
import {
  authenticateAsOwner,
  body,
  createClass,
  createCourse,
  enrollmentPayload,
  resetDatabase,
} from '../helpers.ts'
import type { ApiClient } from '@japa/api-client'

/** Um PNG mínimo de verdade, para o bucket receber bytes e não uma string vazia. */
const FILE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

/** Uma matrícula pública recém-enviada, com o protocolo que a credencia. */
async function enroll(client: ApiClient): Promise<string> {
  const session = await authenticateAsOwner(client)
  const course = await createCourse(client, session)
  const turma = await createClass(client, session, course.id)

  const response = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

  response.assertStatus(201)

  return body(response).protocol
}

function openUpload(client: ApiClient, protocol: string) {
  return client.post(`/storefront/enrollments/${protocol}/uploads`).json({
    fileName: 'comprovante.png',
    mimetype: 'image/png',
    size: FILE.length,
  })
}

/**
 * O upload do comprovante por quem não tem conta.
 *
 * É a **única escrita anônima em bucket** do projeto, e a que entrega URL
 * assinada a quem não fez login. O que a protege é o `protocol` - um uuid que só
 * chegou a quem se inscreveu - e o middleware que o resolve.
 *
 * Estava sem teste nenhum: nem o caminho feliz, nem o middleware, nem a recusa.
 * Um `.use(middleware.enrollmentProtocol())` apagado por engano abriria o bucket
 * para a internet inteira sem quebrar uma linha de teste.
 *
 * A recusa de `mimetype` não se repete aqui: são os **mesmos** controllers de
 * `/storages`, montados atrás do middleware, e portanto o mesmo validator que
 * `storages.spec.ts` já exercita. O que muda neste caminho é quem autoriza, e é
 * só isso que estes testes cobrem.
 */
test.group('storefront > upload do comprovante', (group) => {
  group.each.setup(() => resetDatabase())

  test('sobe o comprovante sem sessão, do começo ao fim', async ({ client, assert }) => {
    const protocol = await enroll(client)

    const upload = body(await openUpload(client, protocol))

    assert.equal(upload.storage.status, UploadStatuses.PENDING)
    assert.lengthOf(upload.parts, 1)

    // O binário vai direto para o bucket, como vai do navegador: a API entrega
    // um endereço assinado e sai do caminho.
    const put = await fetch(upload.parts[0].url, {
      method: 'PUT',
      body: new Uint8Array(FILE),
      headers: { 'content-type': 'image/png' },
    })

    assert.equal(put.status, 200)

    const complete = await client
      .post(`/storefront/enrollments/${protocol}/uploads/${upload.storage.id}/complete`)
      .json({})

    complete.assertStatus(200)
    assert.equal(body(complete).status, UploadStatuses.UPLOADED)

    // E o anexo liga o arquivo à matrícula, que é o passo que a tela faz em
    // seguida.
    const attach = await client
      .post(`/storefront/enrollments/${protocol}/attachments`)
      .json({ storageId: upload.storage.id, kind: EnrollmentFileKinds.PAYMENT_RECEIPT })

    attach.assertStatus(200)
    assert.lengthOf(body(attach).files, 1)
  })

  test('protocolo inexistente não abre upload', async ({ client, assert }) => {
    // Sem o middleware, este `POST` abriria um upload e devolveria URL assinada
    // a quem digitou um uuid qualquer.
    const response = await client
      .post('/storefront/enrollments/00000000-0000-4000-8000-000000000000/uploads')
      .json({ fileName: 'comprovante.png', mimetype: 'image/png', size: FILE.length })

    response.assertStatus(404)
    assert.equal(body(response).code, 'ENROLLMENT_NOT_FOUND')
    assert.isEmpty(await Storage.all())
  })

  test('protocolo malformado não abre upload', async ({ client }) => {
    const response = await client
      .post('/storefront/enrollments/nao-e-uuid/uploads')
      .json({ fileName: 'comprovante.png', mimetype: 'image/png', size: FILE.length })

    response.assertStatus(404)
  })

  test('matrícula cancelada não recebe upload', async ({ client, assert }) => {
    const protocol = await enroll(client)

    await Enrollment.query()
      .where('protocol', protocol)
      .update({ status: EnrollmentStatuses.CANCELLED })

    const response = await openUpload(client, protocol)

    // O mesmo 404 do protocolo inexistente, de propósito: para quem está do lado
    // de fora os dois significam "este protocolo não serve", e distinguir
    // confirmaria a um curioso o que existe no banco.
    response.assertStatus(404)
    assert.equal(body(response).code, 'ENROLLMENT_NOT_FOUND')
  })

  test('matrícula arquivada não recebe upload', async ({ client }) => {
    const protocol = await enroll(client)

    await Enrollment.query().where('protocol', protocol).update({ deletedAt: new Date() })

    const response = await openUpload(client, protocol)

    response.assertStatus(404)
  })

  test('retoma o upload pelo `parts`, sem sessão', async ({ client, assert }) => {
    const protocol = await enroll(client)
    const upload = body(await openUpload(client, protocol))

    // É o caminho de quem perdeu a conexão no meio: a tela pergunta o que já
    // subiu antes de mandar o resto.
    const response = await client.get(
      `/storefront/enrollments/${protocol}/uploads/${upload.storage.id}/parts`
    )

    response.assertStatus(200)
    assert.isArray(body(response).parts)
  })

  test('o upload de um protocolo não serve para outro', async ({ client, assert }) => {
    const primeiro = await enroll(client)
    const upload = body(await openUpload(client, primeiro))

    const outro = await client.post('/storefront/enrollments').json(
      enrollmentPayload(body(await client.get(`/storefront/enrollments/${primeiro}`)).class.id, {
        email: 'outra@exemplo.com',
        studentName: 'Maria Souza',
      })
    )

    outro.assertStatus(201)

    // Confirmar pelo protocolo do vizinho é a escalada que o escopo tem de
    // barrar: o uuid do storage circula na tela de quem o abriu.
    const response = await client
      .post(`/storefront/enrollments/${body(outro).protocol}/uploads/${upload.storage.id}/complete`)
      .json({})

    assert.notEqual(response.status(), 200)
  })
})
