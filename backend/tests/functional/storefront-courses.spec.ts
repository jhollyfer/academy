import { test } from '@japa/runner'
import { authenticateAsOwner, body, createClass, createCourse, resetDatabase } from '../helpers.ts'

test.group('vitrine > cursos > listagem', (group) => {
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

test.group('vitrine > cursos > detalhe', (group) => {
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

test.group('vitrine > cursos > turmas anunciadas', (group) => {
  group.each.setup(() => resetDatabase())

  /**
   * A oferta inteira, e não só a próxima.
   *
   * A escola abre cinco turmas - duas de programação pela manhã, três de
   * robótica à tarde e à noite -, e anunciar só a primeira esconderia quatro do
   * candidato. `nextClass` continua existindo porque o título da home e o
   * JSON-LD perguntam outra coisa: uma data, não a lista.
   */
  test('a listagem traz todas as turmas anunciáveis do curso', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const early = await createClass(client, session, course.id, {
      name: 'Programação 08h / 2026',
      startsAtTime: '08:00',
      endsAtTime: '10:00',
    })
    const late = await createClass(client, session, course.id, {
      name: 'Programação 10h / 2026',
      startsAtTime: '10:00',
      endsAtTime: '12:00',
    })

    const response = await client.get('/storefront/courses')

    response.assertStatus(200)

    const listed = body(response).data.find((entity: any) => entity.id === course.id)

    assert.lengthOf(listed.announcedClasses, 2)
    // Ordenadas pela hora: as duas começam no mesmo sábado, e sem o desempate a
    // ordem entre a de 8h e a de 10h seria a que o banco entregasse.
    assert.deepEqual(
      listed.announcedClasses.map((entity: any) => entity.id),
      [early.id, late.id]
    )
    // A primeira da lista é a mesma que `nextClass` anuncia.
    assert.equal(listed.nextClass.id, early.id)
    assert.equal(listed.announcedClasses[0].seatsRemaining, 40)
  })

  test('curso sem turma anunciável vem com a lista vazia, e não ausente', async ({
    client,
    assert,
  }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    const response = await client.get('/storefront/courses')

    response.assertStatus(200)

    const listed = body(response).data.find((entity: any) => entity.id === course.id)

    // Vazio é "procurei e não há"; ausente seria "esta leitura não procurou", e
    // é a ambiguidade que fazia a matrícula concluir que não havia turma.
    assert.deepEqual(listed.announcedClasses, [])
    assert.isNull(listed.nextClass)
  })

  test('o detalhe do curso anuncia as mesmas turmas que a listagem', async ({
    client,
    assert,
  }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    await createClass(client, session, course.id, { name: 'Robótica 13h / 2026' })
    await createClass(client, session, course.id, { name: 'Robótica 18h / 2026' })

    const response = await client.get(`/storefront/courses/${course.slug}`)

    response.assertStatus(200)
    assert.lengthOf(body(response).announcedClasses, 2)
  })

  /**
   * Turma fechada não é oferta.
   *
   * `CLOSED` é decisão da secretaria - turma que já começou, ou que não vai
   * abrir. Anunciá-la mandaria o candidato escolher uma turma que não recebe
   * matrícula.
   */
  test('turma fechada não entra na lista anunciada', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)

    await createClass(client, session, course.id, { name: 'Turma aberta' })
    await createClass(client, session, course.id, {
      name: 'Turma fechada',
      status: 'CLOSED',
    })

    const response = await client.get('/storefront/courses')

    const listed = body(response).data.find((entity: any) => entity.id === course.id)

    assert.lengthOf(listed.announcedClasses, 1)
    assert.equal(listed.announcedClasses[0].name, 'Turma aberta')
  })
})
