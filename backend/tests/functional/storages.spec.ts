import { test } from '@japa/runner'
import Storage from '#models/storage'
import { UploadStatuses } from '#core/entity'
import { StorageCreateValidator } from '#core/validator'
import { authenticateAsOwner, body, resetDatabase, type Session } from '#tests/helpers'
import type { ApiClient } from '@japa/api-client'

/** Um PNG mínimo de verdade, para o bucket receber bytes e não uma string vazia. */
const FILE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
)

function openUpload(client: ApiClient, session: Session, overrides: Record<string, unknown> = {}) {
  return client
    .post('/storages')
    .cookies(session)
    .json({ fileName: 'comprovante.png', mimetype: 'image/png', size: FILE.length, ...overrides })
}

/**
 * O upload presigned multipart, ponta a ponta contra o MinIO do compose.
 *
 * O binário sai daqui direto para o bucket, do mesmo jeito que sai do navegador:
 * um `PUT` na URL assinada, sem passar pela API. Um teste que só afirmasse o
 * formato da resposta do `POST` provaria o contrato e não o mecanismo - e o
 * mecanismo é onde este caminho quebra.
 */
test.group('storages', (group) => {
  group.each.setup(() => resetDatabase())

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.post('/storages').json({
      fileName: 'comprovante.png',
      mimetype: 'image/png',
      size: FILE.length,
    })

    response.assertStatus(401)
  })

  test('abre o upload e devolve o plano de parte única', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const response = await openUpload(client, session)

    response.assertStatus(201)

    const upload = body(response)

    // Arquivo que cabe numa parte não abre multipart no bucket: `uploadId` nulo
    // é o que diz ao cliente para mandar o arquivo inteiro numa URL só.
    assert.isNull(upload.uploadId)
    assert.equal(upload.totalParts, 1)
    assert.lengthOf(upload.parts, 1)
    assert.isEmpty(upload.uploaded)
    assert.equal(upload.storage.status, UploadStatuses.PENDING)
    assert.match(upload.parts[0].url, /^http:\/\/localhost:9004\//)
  })

  test('sobe o arquivo pela URL assinada e confirma', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const upload = body(await openUpload(client, session))

    const put = await fetch(upload.parts[0].url, {
      method: 'PUT',
      body: new Uint8Array(FILE),
      headers: { 'content-type': 'image/png' },
    })

    assert.equal(put.status, 200)

    const response = await client
      .post(`/storages/${upload.storage.id}/complete`)
      .cookies(session)
      .json({})

    response.assertStatus(200)
    assert.equal(body(response).status, UploadStatuses.UPLOADED)

    const stored = await Storage.findOrFail(upload.storage.id)
    assert.equal(stored.status, UploadStatuses.UPLOADED)
  })

  test('tamanho declarado que não bate com o enviado é 422', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    // Declara o dobro do que vai subir. É a mentira que `complete` existe para
    // pegar - antes dele, o teto de upload seria só uma sugestão.
    const upload = body(await openUpload(client, session, { size: FILE.length * 2 }))

    await fetch(upload.parts[0].url, {
      method: 'PUT',
      body: new Uint8Array(FILE),
      headers: { 'content-type': 'image/png' },
    })

    const response = await client
      .post(`/storages/${upload.storage.id}/complete`)
      .cookies(session)
      .json({})

    response.assertStatus(422)
    assert.equal(body(response).code, 'STORAGE_SIZE_MISMATCH')

    // A linha morre junto: um registro apontando para um objeto apagado seria
    // uma referência que qualquer anexo aceitaria.
    assert.isNull(await Storage.find(upload.storage.id))
  })

  /**
   * Contra o **validator**, e não pela rota como o resto: o registro de rotas
   * tipa `mimetype` como a união dos seis aceitos, e o cliente do Japa recusa
   * qualquer outro em tempo de compilação - o corpo inválido não é construível
   * ali. Quem recusa o arquivo proibido é o validator, e é ele que importa
   * provar: a recusa acontece antes de qualquer assinatura, então o arquivo
   * nunca ganha endereço e nunca chega ao bucket.
   */
  test('mimetype fora da lista é recusado antes de assinar', async ({ assert }) => {
    await assert.rejects(() =>
      StorageCreateValidator.validate({
        fileName: 'planilha.xlsx',
        mimetype: 'application/zip',
        size: 10,
      })
    )

    assert.isEmpty(await Storage.all())
  })

  test('parts de arquivo já confirmado devolve as duas listas vazias', async ({
    client,
    assert,
  }) => {
    const session = await authenticateAsOwner(client)
    const upload = body(await openUpload(client, session))

    await fetch(upload.parts[0].url, {
      method: 'PUT',
      body: new Uint8Array(FILE),
      headers: { 'content-type': 'image/png' },
    })

    await client.post(`/storages/${upload.storage.id}/complete`).cookies(session).json({})

    const response = await client.get(`/storages/${upload.storage.id}/parts`).cookies(session)

    response.assertStatus(200)
    assert.isEmpty(body(response).parts)
    assert.isEmpty(body(response).uploaded)
  })

  test('apaga arquivo órfão e responde 204', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const upload = body(await openUpload(client, session))

    const response = await client.delete(`/storages/${upload.storage.id}`).cookies(session)

    response.assertStatus(204)
    assert.isNull(await Storage.find(upload.storage.id))
  })

  test('id inexistente é 404', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    const response = await client
      .delete('/storages/00000000-0000-4000-8000-000000000000')
      .cookies(session)

    response.assertStatus(404)
  })
})
