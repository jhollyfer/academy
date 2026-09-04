import { test } from '@japa/runner'
import {
  authenticateAsAdministrator,
  authenticateAsOwner,
  body,
  createPartner,
  partnerPayload,
  resetDatabase,
} from '../helpers.ts'

test.group('administrador > parceiros', (group) => {
  group.each.setup(() => resetDatabase())

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.get('/administrator/partners')

    response.assertStatus(401)
  })

  test('cria um parceiro e devolve 201 com o objeto nu', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const response = await client
      .post('/administrator/partners')
      .cookies(session)
      .json(partnerPayload())

    response.assertStatus(201)

    const partner = body(response)
    assert.equal(partner.name, 'CETI Aristélio Sabino de Oliveira')
    // `status` e `position` vêm de DEFAULT no banco: sem o `refresh` do
    // use-case sairiam indefinidos.
    assert.equal(partner.status, 'ACTIVE')
    assert.equal(partner.position, 0)
  })

  /**
   * Trava a duplicata: sem o `unique` no nome, cadastrar o CETI duas vezes
   * passaria, e a faixa da home mostraria o mesmo prédio em duas células.
   */
  test('recusa nome duplicado com 409 apontando o campo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    await createPartner(client, session)

    const response = await client
      .post('/administrator/partners')
      .cookies(session)
      .json(partnerPayload())

    response.assertStatus(409)

    const error = body(response)
    assert.equal(error.code, 'PARTNER_ALREADY_EXISTS')
    assert.property(error.errors, 'name')
  })

  test('recria sobre a linha arquivada em vez de duplicar', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const first = await createPartner(client, session)

    await client.patch(`/administrator/partners/${first.id}/archive`).cookies(session)

    const response = await client
      .post('/administrator/partners')
      .cookies(session)
      .json(partnerPayload({ role: 'Papel novo, mesma instituição.' }))

    response.assertStatus(201)

    const revived = body(response)
    assert.equal(revived.id, first.id)
    assert.equal(revived.deletedAt, null)
  })

  /**
   * Trava o 409 contra o próprio registro: a tela de edição manda o formulário
   * inteiro, e sem a comparação de nome toda gravação sem trocar o nome seria
   * recusada como duplicata de si mesma.
   */
  test('reenviar o nome que já está gravado não dispara conflito', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const partner = await createPartner(client, session)

    const response = await client
      .put(`/administrator/partners/${partner.id}`)
      .cookies(session)
      .json(partnerPayload({ role: 'Cede as salas e o laboratório de informática.' }))

    response.assertStatus(200)
    assert.equal(body(response).role, 'Cede as salas e o laboratório de informática.')
  })

  test('recusa payload inválido com 422', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    // `url` não é texto livre: link quebrado num card institucional é pior que
    // card sem link.
    const response = await client
      .post('/administrator/partners')
      .cookies(session)
      .json(partnerPayload({ url: 'nao-e-um-link' }))

    response.assertStatus(422)
  })

  test('parceiro arquivado some da listagem e volta com ?trashed', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const partner = await createPartner(client, session)

    await client.patch(`/administrator/partners/${partner.id}/archive`).cookies(session)

    const listed = await client.get('/administrator/partners').cookies(session)
    assert.lengthOf(body(listed).data, 0)

    const trashed = await client.get('/administrator/partners?trashed=only').cookies(session)
    assert.lengthOf(body(trashed).data, 1)
  })

  /**
   * Trava a escala da lixeira: o administrador arquiva e restaura, e só o dono
   * apaga de vez. Um guard no grupo diria que o administrador não pode nem
   * arquivar, que é o oposto do desenho.
   */
  test('o administrador arquiva, mas só o dono apaga', async ({ client }) => {
    const owner = await authenticateAsOwner(client)
    const partner = await createPartner(client, owner)

    const administrator = await authenticateAsAdministrator(client)

    const archived = await client
      .patch(`/administrator/partners/${partner.id}/archive`)
      .cookies(administrator)
    archived.assertStatus(204)

    const refused = await client
      .delete(`/administrator/partners/${partner.id}`)
      .cookies(administrator)
    refused.assertStatus(403)

    const purged = await client.delete(`/administrator/partners/${partner.id}`).cookies(owner)
    purged.assertStatus(204)
  })

  /**
   * Trava o atalho perigoso: apagar sem passar pela lixeira perderia o registro
   * num clique só.
   */
  test('recusa apagar parceiro que não passou pela lixeira', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const partner = await createPartner(client, session)

    const response = await client.delete(`/administrator/partners/${partner.id}`).cookies(session)

    response.assertStatus(409)
    assert.equal(body(response).code, 'PARTNER_NOT_ARCHIVED')
  })
})
