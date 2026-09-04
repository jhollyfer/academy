import { test } from '@japa/runner'
import User from '#models/user'
import Enrollment from '#models/enrollment'
import { UserRoles } from '#core/entity'
import { UserFactory, FACTORY_PASSWORD } from '#database/factories/user_factory'
import {
  authenticate,
  authenticateAsOwner,
  body,
  createClass,
  createCourse,
  cpfFrom,
  enrollmentPayload,
  resetDatabase,
  type Session,
} from '../helpers.ts'
import type { ApiClient } from '@japa/api-client'

/**
 * O portal de quem é atendido pela escola.
 *
 * Este arquivo cobre o que o resto da suíte não alcança: **o escopo de dados**.
 * A matriz de papéis prova quem entra onde; aqui a pergunta é outra - dentro de
 * uma rota que a pessoa pode abrir, quais linhas ela enxerga.
 *
 * É a metade que falha em silêncio. Um `scopeEnrollmentsTo` que esquecesse a
 * cláusula devolveria a base inteira com 200, e nenhum teste de permissão
 * notaria.
 */

/**
 * Uma turma pronta para receber matrícula.
 *
 * Curso e turma são criados uma vez por teste: `createCourse` deriva o slug do
 * nome, que é fixo, e um segundo curso no mesmo teste bateria no índice único.
 */
async function openClass(client: ApiClient, session: Session): Promise<string> {
  const course = await createCourse(client, session)
  const turma = await createClass(client, session, course.id)

  return turma.id
}

/** Uma matrícula criada pela vitrine, e confirmada pela secretaria. */
async function confirmedEnrollment(
  client: ApiClient,
  classId: string,
  overrides: Record<string, unknown> = {}
): Promise<Enrollment> {
  const created = await client
    .post('/storefront/enrollments')
    .json(enrollmentPayload(classId, overrides))

  created.assertStatus(201)

  const enrollment = await Enrollment.findByOrFail('protocol', body(created).protocol)

  // Confirmar exige comprovante, e anexá-lo pela API pediria um upload real.
  // O que este arquivo prova é o escopo, não a máquina de estados - que
  // `administrator-enrollments.spec.ts` já cobre pelo caminho completo.
  enrollment.status = 'CONFIRMED' as never
  await enrollment.save()

  return enrollment
}

/**
 * Liga a matrícula a uma conta.
 *
 * Pelo model e não por `query().update({ studentId })`: o query builder não
 * traduz camelCase para a coluna, então o update sairia vazio e o teste passaria
 * a provar um escopo que nunca foi montado.
 */
async function linkAccount(
  enrollment: Enrollment,
  column: 'studentId' | 'responsibleId',
  userId: string
): Promise<void> {
  enrollment[column] = userId
  await enrollment.save()
}

test.group('portal > escopo do aluno', (group) => {
  group.each.setup(() => resetDatabase())

  test('o aluno vê a própria matrícula e não a dos outros', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)

    const classId = await openClass(client, owner)
    const mine = await confirmedEnrollment(client, classId, {
      email: 'meu@exemplo.com',
      studentDocument: cpfFrom('529982247'),
    })
    const other = await confirmedEnrollment(client, classId, {
      email: 'outro@exemplo.com',
      studentDocument: cpfFrom('390533447'),
    })

    // As contas nascem na confirmação, pelo `EnrollmentAccountService`. Aqui o
    // vínculo é feito à mão porque a confirmação acima foi direta no model.
    const student = await UserFactory.apply('student').create()
    await linkAccount(mine, 'studentId', student.id)

    const session = await authenticate(client, student.email, FACTORY_PASSWORD)

    const list = await client.get('/portal/enrollments').cookies(session)
    list.assertStatus(200)
    assert.lengthOf(body(list).data, 1)
    assert.equal(body(list).data[0].id, mine.id)

    // A alheia responde 404, e não 403: confirmar que o id existe entregaria o
    // que o recorte esconde.
    const forbidden = await client.get(`/portal/enrollments/${other.id}`).cookies(session)
    forbidden.assertStatus(404)

    const own = await client.get(`/portal/enrollments/${mine.id}`).cookies(session)
    own.assertStatus(200)
  })
})

test.group('portal > escopo do responsável', (group) => {
  group.each.setup(() => resetDatabase())

  test('vê a matrícula em que é o responsável registrado', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)
    const classId = await openClass(client, owner)
    const enrollment = await confirmedEnrollment(client, classId)

    const responsible = await UserFactory.apply('responsible').create()
    await linkAccount(enrollment, 'responsibleId', responsible.id)

    const session = await authenticate(client, responsible.email, FACTORY_PASSWORD)

    const list = await client.get('/portal/enrollments').cookies(session)

    list.assertStatus(200)
    assert.lengthOf(body(list).data, 1)
  })

  test('vê a do dependente vinculado, e não a de outro aluno', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)

    const classId = await openClass(client, owner)
    const dependentEnrollment = await confirmedEnrollment(client, classId, {
      email: 'a@exemplo.com',
      studentDocument: cpfFrom('529982247'),
    })
    const strangerEnrollment = await confirmedEnrollment(client, classId, {
      email: 'b@exemplo.com',
      studentDocument: cpfFrom('390533447'),
    })

    const responsible = await UserFactory.apply('responsible').create()
    const dependent = await UserFactory.apply('student').create()
    const stranger = await UserFactory.apply('student').create()

    await linkAccount(dependentEnrollment, 'studentId', dependent.id)
    await linkAccount(strangerEnrollment, 'studentId', stranger.id)

    await responsible.related('dependents').attach([dependent.id])

    const session = await authenticate(client, responsible.email, FACTORY_PASSWORD)

    const list = await client.get('/portal/enrollments').cookies(session)

    list.assertStatus(200)
    assert.lengthOf(body(list).data, 1)
    assert.equal(body(list).data[0].id, dependentEnrollment.id)

    const forbidden = await client
      .get(`/portal/enrollments/${strangerEnrollment.id}`)
      .cookies(session)

    forbidden.assertStatus(404)
  })

  test('desvincular o dependente tira a matrícula da lista', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)
    const classId = await openClass(client, owner)
    const enrollment = await confirmedEnrollment(client, classId)

    const responsible = await UserFactory.apply('responsible').create()
    const dependent = await UserFactory.apply('student').create()

    await linkAccount(enrollment, 'studentId', dependent.id)
    await responsible.related('dependents').attach([dependent.id])

    const session = await authenticate(client, responsible.email, FACTORY_PASSWORD)

    const before = await client.get('/portal/enrollments').cookies(session)
    assert.lengthOf(body(before).data, 1)

    await responsible.related('dependents').detach([dependent.id])

    // O acesso é derivado do vínculo, e não copiado no momento em que ele foi
    // criado: desfazer a guarda precisa revogar a leitura na mesma hora.
    const after = await client.get('/portal/enrollments').cookies(session)
    assert.lengthOf(body(after).data, 0)
  })
})

test.group('portal > quem não é do portal', (group) => {
  group.each.setup(() => resetDatabase())

  test('o dono recebe 403 no portal', async ({ client }) => {
    const session = await authenticateAsOwner(client)

    // O painel dele é outro. 403 e não lista vazia: a rota inteira não é dele,
    // e o middleware barra antes de qualquer consulta.
    const response = await client.get('/portal/enrollments').cookies(session)

    response.assertStatus(403)
  })

  test('sem sessão é 401', async ({ client }) => {
    const response = await client.get('/portal/enrollments')

    response.assertStatus(401)
  })
})

test.group('portal > a conta nasce da confirmação', (group) => {
  group.each.setup(() => resetDatabase())

  test('aluno maior de idade vira STUDENT e entra no portal', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)
    const classId = await openClass(client, owner)
    const enrollment = await confirmedEnrollment(client, classId, {
      email: 'maior@exemplo.com',
      studentBirthDate: '1995-04-12',
    })

    // A confirmação acima foi direta no model, então o serviço é exercitado
    // aqui pelo mesmo caminho que o use-case usa.
    const { default: EnrollmentAccountService } =
      await import('#services/enrollment-account.service')
    const { default: app } = await import('@adonisjs/core/services/app')
    const service = await app.container.make(EnrollmentAccountService)
    const model = await Enrollment.findOrFail(enrollment.id)
    await service.ensureFor(model)

    await model.refresh()

    assert.isNotNull(model.studentId)
    assert.isNull(model.responsibleId)

    const account = await User.findOrFail(model.studentId!)
    assert.equal(account.role, UserRoles.STUDENT)
    assert.equal(account.email, 'maior@exemplo.com')
  })

  test('aluno menor vira RESPONSIBLE, e o aluno não ganha conta', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)
    const classId = await openClass(client, owner)
    const enrollment = await confirmedEnrollment(client, classId, {
      email: 'responsavel@exemplo.com',
      studentBirthDate: '2010-04-12',
      guardianName: 'Maria de Souza',
      guardianDocument: '39053344705',
      guardianPhone: '97984600872',
    })

    const { default: EnrollmentAccountService } =
      await import('#services/enrollment-account.service')
    const { default: app } = await import('@adonisjs/core/services/app')
    const service = await app.container.make(EnrollmentAccountService)
    const model = await Enrollment.findOrFail(enrollment.id)
    await service.ensureFor(model)

    await model.refresh()

    // O formulário público coleta um e-mail só, e num cadastro de menor esse
    // e-mail é do adulto que preencheu. Criar a conta em nome da criança com o
    // endereço do pai registraria a pessoa errada.
    assert.isNotNull(model.responsibleId)
    assert.isNull(model.studentId)

    const account = await User.findOrFail(model.responsibleId!)
    assert.equal(account.role, UserRoles.RESPONSIBLE)
    assert.equal(account.name, 'Maria de Souza')
  })

  test('confirmar duas vezes não cria segunda conta', async ({ client, assert }) => {
    const owner = await authenticateAsOwner(client)
    const classId = await openClass(client, owner)
    const enrollment = await confirmedEnrollment(client, classId, { email: 'idem@exemplo.com' })

    const { default: EnrollmentAccountService } =
      await import('#services/enrollment-account.service')
    const { default: app } = await import('@adonisjs/core/services/app')
    const service = await app.container.make(EnrollmentAccountService)
    const model = await Enrollment.findOrFail(enrollment.id)

    await service.ensureFor(model)
    await model.refresh()
    const first = model.studentId

    await service.ensureFor(model)
    await model.refresh()

    // Confirmar duas vezes é um clique repetido, não um pedido de novo acesso.
    assert.equal(model.studentId, first)
    assert.lengthOf(await User.query().where('email', 'idem@exemplo.com'), 1)
  })
})
