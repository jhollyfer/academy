import { test } from '@japa/runner'
import { authenticateAsOwner, body, createClass, createCourse, resetDatabase } from '#tests/helpers'

test.group('storefront/courses', (group) => {
  group.each.setup(() => resetDatabase())

  /**
   * A regressão que quebrava o funil.
   *
   * A listagem não populava `nextClass`, e como `@computed` que devolve
   * `undefined` some do JSON, quem consumia a lista concluía que nenhum curso
   * tinha turma. A página de matrícula dizia "nenhuma turma aberta" enquanto a
   * página do curso, que usa o detalhe, anunciava a mesma turma com data e
   * vagas.
   */
  test('a listagem traz a próxima turma de cada curso', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client.get('/storefront/courses')

    response.assertStatus(200)

    const listed = body(response).data.find((entity: any) => entity.id === course.id)

    assert.isNotNull(listed.nextClass)
    assert.equal(listed.nextClass.id, turma.id)
    assert.equal(listed.nextClass.capacity, 40)
    // Ninguém se matriculou ainda, então a turma inteira está livre. É este
    // número que o card da home mostra.
    assert.equal(listed.nextClass.seatsRemaining, 40)
  })

  /**
   * `null` e não ausente.
   *
   * Ausente é "esta leitura não procurou turma", e foi a ambiguidade que
   * escondeu o defeito acima. Curso sem turma tem de dizer isso em voz alta.
   */
  test('curso sem turma anunciável vem com nextClass nulo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client.get('/storefront/courses')

    response.assertStatus(200)

    const listed = body(response).data.find((entity: any) => entity.id === course.id)

    assert.isNull(listed.nextClass)
  })

  /**
   * Turma encerrada não é turma anunciada.
   *
   * `CLOSED` sai da vitrine porque não adianta anunciar data de turma que não
   * vai abrir. `OPEN` e `FULL` ficam, porque a fila de espera existe para a
   * segunda.
   */
  test('turma CLOSED não é anunciada na listagem', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    await client
      .put(`/administrator/classes/${turma.id}`)
      .cookies(session)
      .json({ status: 'CLOSED' })

    const response = await client.get('/storefront/courses')

    const listed = body(response).data.find((entity: any) => entity.id === course.id)

    assert.isNull(listed.nextClass)
  })
})
