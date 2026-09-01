import { test } from '@japa/runner'
import { EnrollmentStatuses } from '#core/entity'
import {
  authenticateAsOwner,
  createClass,
  createCourse,
  enrollmentPayload,
  resetDatabase,
} from '#tests/helpers'

/**
 * O CSV que a secretaria abre no Excel.
 *
 * O que se prova aqui não é o conteúdo - isso a listagem já cobre -, e sim o que
 * só o arquivo tem: o BOM, o separador `;` e o escape. Os três são invisíveis na
 * tela e só aparecem quando alguém abre o arquivo e vê as colunas trocadas.
 */
test.group('administrator/enrollments · export', (group) => {
  group.each.setup(() => resetDatabase())

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.get('/administrator/enrollments/export')

    response.assertStatus(401)
  })

  test('devolve CSV com BOM, separador ; e uma linha por matrícula', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    const response = await client.get('/administrator/enrollments/export').cookies(session)

    response.assertStatus(200)
    assert.include(response.header('content-type'), 'text/csv')
    assert.include(response.header('content-disposition'), 'matriculas.csv')

    const csv = response.text()

    // O BOM é o que faz o Excel em português ler UTF-8; sem ele "Matrícula" sai
    // com o acento trocado.
    assert.isTrue(csv.startsWith('﻿'))

    const [header, ...rows] = csv.replace('﻿', '').trim().split('\n')

    assert.equal(header.split(';')[0], 'Protocolo')
    assert.lengthOf(rows, 1)
    assert.include(rows[0], 'João da Silva')
  })

  test('escapa o campo que contém o separador', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentName: 'Silva; Souza' }))

    const response = await client.get('/administrator/enrollments/export').cookies(session)

    // Entre aspas, senão o `;` do nome deslocaria todas as colunas seguintes e o
    // arquivo abriria torto sem nenhum erro visível.
    assert.include(response.text(), '"Silva; Souza"')
  })

  test('aplica o filtro de situação da listagem', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { capacity: 1 })

    await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentName: 'Ana Ribeiro', email: 'ana@exemplo.com' }))

    const response = await client
      .get('/administrator/enrollments/export')
      .qs({ status: EnrollmentStatuses.WAITLIST })
      .cookies(session)

    response.assertStatus(200)

    const rows = response.text().replace('﻿', '').trim().split('\n').slice(1)

    assert.lengthOf(rows, 1)
    assert.include(rows[0], 'Ana Ribeiro')
  })
})
