import { test } from '@japa/runner'
import { authenticateAsOwner, body, createPartner, resetDatabase } from '../helpers.ts'

test.group('vitrine > parceiros', (group) => {
  group.each.setup(() => resetDatabase())

  test('lista os parceiros sem sessão', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)
    await createPartner(client, owner)

    const response = await client.get('/storefront/partners')

    response.assertStatus(200)

    const partners = body(response).data
    assert.lengthOf(partners, 1)
    assert.property(body(response), 'meta')
    // `role` é o campo que faz a seção valer alguma coisa: sem ele a faixa é
    // uma grade de logos sem papel declarado, que não prova nada.
    assert.equal(partners[0].role, 'Cede as salas onde as aulas acontecem, aos sábados.')
  })

  /**
   * Trava o vazamento do rascunho: a vitrine não tem lixeira nem enxerga o que
   * saiu do ar. Um parceiro suspenso continuaria anunciado como ativo, e a
   * página estaria afirmando uma parceria que não existe mais.
   */
  test('esconde o que está inativo ou arquivado', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)

    const archived = await createPartner(client, owner, { name: 'Parceiro Arquivado' })
    await client.patch(`/administrator/partners/${archived.id}/archive`).cookies(owner)

    await createPartner(client, owner, { name: 'Parceiro Inativo', status: 'INACTIVE' })
    await createPartner(client, owner, { name: 'Parceiro no Ar' })

    const response = await client.get('/storefront/partners')

    response.assertStatus(200)

    const partners = body(response).data
    assert.lengthOf(partners, 1)
    assert.equal(partners[0].name, 'Parceiro no Ar')
  })

  /**
   * A ordem da faixa é decisão da escola, e não a ordem de cadastro: quem
   * aparece primeiro na home sai de `position`.
   */
  test('respeita a ordem definida pela escola', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)

    await createPartner(client, owner, { name: 'Segundo', position: 2 })
    await createPartner(client, owner, { name: 'Primeiro', position: 1 })

    const response = await client.get('/storefront/partners')

    const partners = body(response).data
    assert.deepEqual(
      partners.map((partner: { name: string }) => partner.name),
      ['Primeiro', 'Segundo']
    )
  })

  test('devolve lista vazia quando não há parceiro', async ({ client, assert }) => {
    const response = await client.get('/storefront/partners')

    response.assertStatus(200)
    // Vazio e não 404: a home some com a seção inteira nesse caso, e um erro
    // aqui derrubaria a página em vez de omitir uma faixa.
    assert.lengthOf(body(response).data, 0)
  })
})
