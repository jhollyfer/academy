import { test } from '@japa/runner'
import { body, resetDatabase } from '../helpers.ts'

test.group('vitrine > galeria', (group) => {
  group.each.setup(() => resetDatabase())

  /**
   * Trava o estado vazio, que é o estado em que a galeria nasce: o acervo ainda
   * não existe, e a seção some do site em vez de desenhar uma grade em branco.
   * Um 404 aqui derrubaria a home inteira pelo loader.
   */
  test('devolve lista vazia enquanto não há acervo', async ({ client, assert }) => {
    const response = await client.get('/storefront/photos')

    response.assertStatus(200)
    assert.lengthOf(body(response).data, 0)
    assert.property(body(response), 'meta')
  })

  test('não exige sessão', async ({ client }) => {
    const response = await client.get('/storefront/photos')

    response.assertStatus(200)
  })
})
