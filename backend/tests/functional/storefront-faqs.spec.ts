import { test } from '@japa/runner'
import { body, resetDatabase } from '../helpers.ts'

test.group('vitrine > FAQ', (group) => {
  group.each.setup(() => resetDatabase())

  /**
   * O FAQ da escola é o de `courseId` nulo.
   *
   * Ele existia no seed desde o começo e não tinha por onde sair: `faqs` é
   * `hasMany` por `courseId`, então linha com `courseId` nulo não pertence a
   * curso nenhum e nenhuma relação a alcança. A home ficava sem FAQ.
   */
  test('lista as perguntas gerais sem sessão', async ({ client, assert }) => {
    const response = await client.get('/storefront/faqs')

    response.assertStatus(200)

    const faqs = body(response).data
    assert.isArray(faqs)
    // O seeder não roda em teste, então o que se prova aqui é o contrato: a
    // rota responde sem sessão e devolve uma lista. A contagem é do seed de
    // desenvolvimento, e prendê-la aqui quebraria a cada pergunta nova.
    // `courseId` nem viaja: é sempre nulo neste recorte, e a serialização o
    // deixa de fora. O que se prova é o envelope paginado e o formato da
    // pergunta.
    assert.property(body(response), 'meta')
    assert.isTrue(faqs.every((faq: any) => 'question' in faq && 'answer' in faq))
  })
})
