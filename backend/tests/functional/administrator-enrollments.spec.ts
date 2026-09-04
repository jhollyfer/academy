import { test } from '@japa/runner'
import { EnrollmentStatuses } from '#core/entity'
import { AdministratorEnrollmentPaginationValidator } from '#core/validator'
import {
  authenticateAsOwner,
  body,
  createClass,
  createCourse,
  cpfFrom,
  enrollmentPayload,
  resetDatabase,
} from '../helpers.ts'
import type { ApiClient } from '@japa/api-client'
import type { Session } from '../helpers.ts'

/**
 * Uma matrícula pronta, com a turma que a comporta. Quase todo teste daqui
 * começa assim: o painel não cria matrícula, ele opera a que o site enviou.
 */
async function enroll(
  client: ApiClient,
  session: Session,
  overrides: Record<string, unknown> = {},
  classOverrides: Record<string, unknown> = {}
): Promise<Record<string, any>> {
  const course = await createCourse(client, session, overrides)
  const turma = await createClass(client, session, course.id, classOverrides)

  const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

  created.assertStatus(201)

  return { course, turma, enrollment: body(created) }
}

/**
 * O CSV que a secretaria abre no Excel.
 *
 * O que se prova aqui não é o conteúdo - isso a listagem já cobre -, e sim o que
 * só o arquivo tem: o BOM, o separador `;` e o escape. Os três são invisíveis na
 * tela e só aparecem quando alguém abre o arquivo e vê as colunas trocadas.
 */
test.group('administrador > matrículas > exportação', (group) => {
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
    // O `;` entra pelo nome da turma, e não pelo do aluno: nome de pessoa não
    // aceita mais pontuação de separador desde que `personName()` passou a
    // recusar o que não é nome. A coluna "Turma" é texto livre da secretaria, e
    // é por ela que o separador ainda chega ao CSV.
    const turma = await createClass(client, session, course.id, {
      name: 'Sábado; manhã',
    })

    await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    const response = await client.get('/administrator/enrollments/export').cookies(session)

    // Entre aspas, senão o `;` deslocaria todas as colunas seguintes e o arquivo
    // abriria torto sem nenhum erro visível.
    assert.include(response.text(), '"Sábado; manhã"')
  })

  test('aplica o filtro de situação da listagem', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { capacity: 1 })

    await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    await client.post('/storefront/enrollments').json(
      enrollmentPayload(turma.id, {
        studentName: 'Ana Ribeiro',
        email: 'ana@exemplo.com',
        studentDocument: cpfFrom('390533447'),
      })
    )

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

/**
 * A listagem do painel: a tela onde a secretaria opera o funil.
 *
 * É o recurso central do produto e era o menos coberto - `paginate` não tinha um
 * teste. Os filtros não são conveniência: a secretaria trabalha uma turma por
 * vez, e uma listagem que ignorasse `classId` misturaria dois grupos de alunos
 * na mesma tela sem dar nenhum sinal.
 */
test.group('administrador > matrículas > listagem', (group) => {
  group.each.setup(() => resetDatabase())

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.get('/administrator/enrollments')

    response.assertStatus(401)
  })

  test('lista no envelope paginado', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    await enroll(client, session)

    const response = await client.get('/administrator/enrollments').cookies(session)

    response.assertStatus(200)
    assert.property(body(response), 'meta')
    assert.lengthOf(body(response).data, 1)
    assert.equal(body(response).meta.perPage, 20)
  })

  test('filtra por turma', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const first = await enroll(client, session)
    const second = await enroll(client, session, { name: 'Web Development Fundamentals' })

    const response = await client
      .get('/administrator/enrollments')
      .qs({ classId: second.turma.id })
      .cookies(session)

    response.assertStatus(200)
    assert.lengthOf(body(response).data, 1)
    assert.equal(body(response).data[0].id, second.enrollment.id)
    assert.notEqual(body(response).data[0].id, first.enrollment.id)
  })

  test('filtra por curso', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    await enroll(client, session)
    const web = await enroll(client, session, { name: 'Web Development Fundamentals' })

    const response = await client
      .get('/administrator/enrollments')
      .qs({ courseId: web.course.id })
      .cookies(session)

    response.assertStatus(200)
    assert.lengthOf(body(response).data, 1)
    assert.equal(body(response).data[0].id, web.enrollment.id)
  })

  test('filtra por situação', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const { enrollment } = await enroll(client, session)

    await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: EnrollmentStatuses.CANCELLED })

    const pending = await client
      .get('/administrator/enrollments')
      .qs({ status: EnrollmentStatuses.PENDING })
      .cookies(session)

    assert.isEmpty(body(pending).data)

    const cancelled = await client
      .get('/administrator/enrollments')
      .qs({ status: EnrollmentStatuses.CANCELLED })
      .cookies(session)

    assert.lengthOf(body(cancelled).data, 1)
  })

  test('busca pelo nome, pelo e-mail e pelo protocolo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const { enrollment } = await enroll(client, session)

    const hit = await client
      .get('/administrator/enrollments')
      .qs({ search: 'João' })
      .cookies(session)

    assert.lengthOf(body(hit).data, 1)

    // Pelo protocolo, que é o número que o candidato dita no WhatsApp. É `uuid`
    // no banco, e sem o cast para texto a consulta inteira morre em 500 - a
    // busca do balcão deixaria de existir sem nenhum sintoma na tela além do
    // erro.
    const byProtocol = await client
      .get('/administrator/enrollments')
      .qs({ search: String(enrollment.protocol).slice(0, 8) })
      .cookies(session)

    byProtocol.assertStatus(200)
    assert.lengthOf(body(byProtocol).data, 1)

    const miss = await client
      .get('/administrator/enrollments')
      .qs({ search: 'ninguém com este nome' })
      .cookies(session)

    assert.isEmpty(body(miss).data)
  })

  /**
   * Contra o **validator**, e não pela rota como o resto: o registro de rotas
   * tipa `sort` como a união das três colunas ordenáveis, e o cliente do Japa
   * recusa qualquer outra em tempo de compilação - a query inválida não é
   * construível ali. Quem recusa é o validator, e é o que importa provar: sem
   * ele a coluna iria crua para o `ORDER BY` e o banco responderia 500 com o
   * nome de uma coluna que ninguém devia poder nomear.
   */
  test('?sort fora da lista é recusado antes de chegar ao banco', async ({ assert }) => {
    await assert.rejects(() =>
      AdministratorEnrollmentPaginationValidator.validate({ sort: 'password' })
    )
  })
})

/**
 * Arquivar, restaurar e apagar são três coisas distintas, e é o `DELETE` que
 * cobra a distinção: linha viva não é apagável, e a única porta para a lixeira é
 * o `archive`. Sem isso, um clique perderia o registro sem escala intermediária.
 */
test.group('administrador > matrículas > ciclo de vida', (group) => {
  group.each.setup(() => resetDatabase())

  test('arquiva, some da listagem e volta com ?trashed=only', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const { enrollment } = await enroll(client, session)

    const archive = await client
      .patch(`/administrator/enrollments/${enrollment.id}/archive`)
      .cookies(session)

    archive.assertStatus(204)

    const listed = await client.get('/administrator/enrollments').cookies(session)
    assert.isEmpty(body(listed).data)

    const trashed = await client
      .get('/administrator/enrollments')
      .qs({ trashed: 'only' })
      .cookies(session)

    assert.lengthOf(body(trashed).data, 1)
  })

  test('unarchive traz de volta', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const { enrollment } = await enroll(client, session)

    await client.patch(`/administrator/enrollments/${enrollment.id}/archive`).cookies(session)

    const unarchive = await client
      .patch(`/administrator/enrollments/${enrollment.id}/unarchive`)
      .cookies(session)

    unarchive.assertStatus(204)

    const listed = await client.get('/administrator/enrollments').cookies(session)
    assert.lengthOf(body(listed).data, 1)
  })

  test('delete recusa matrícula que não passou pela lixeira', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const { enrollment } = await enroll(client, session)

    const response = await client
      .delete(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)

    response.assertStatus(409)
    assert.equal(body(response).code, 'ENROLLMENT_NOT_ARCHIVED')
  })

  test('delete apaga a matrícula já arquivada', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const { enrollment } = await enroll(client, session)

    await client.patch(`/administrator/enrollments/${enrollment.id}/archive`).cookies(session)

    const response = await client
      .delete(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)

    response.assertStatus(204)
  })
})

/**
 * A máquina de estados, que é o que o painel de fato move.
 *
 * Estava no spec da vitrine porque o arranjo começa por lá - mas quem chama é a
 * secretaria, pelo `PUT /administrator/enrollments/:id`, e é aqui que o caso
 * pertence.
 */
test.group('administrador > matrículas > transição', (group) => {
  group.each.setup(() => resetDatabase())

  test('cancelar devolve a vaga e a turma volta a OPEN', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { capacity: 1 })

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const enrollment = body(created)

    const cancelled = await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: 'CANCELLED' })

    cancelled.assertStatus(200)

    const view = await client.get(`/administrator/classes/${turma.id}`).cookies(session)
    assert.equal(body(view).status, 'OPEN')
    assert.equal(body(view).seatsRemaining, 1)
  })

  test('confirmar sem comprovante é recusado', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const enrollment = body(created)

    const response = await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: 'CONFIRMED' })

    // Não há gateway: o arquivo é a única prova que existe.
    response.assertStatus(409)
    assert.equal(body(response).code, 'ENROLLMENT_RECEIPT_MISSING')
  })

  test('transição inválida é 409', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const enrollment = body(created)

    await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: 'CANCELLED' })

    const response = await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ status: 'PENDING' })

    // `CANCELLED` é terminal.
    response.assertStatus(409)
    assert.equal(body(response).code, 'ENROLLMENT_INVALID_TRANSITION')
  })
})
