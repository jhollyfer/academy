import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import { StorefrontEnrollmentCreateValidator } from '#core/validator'
import {
  authenticateAsOwner,
  body,
  cpfFrom,
  createClass,
  createCourse,
  enrollmentPayload,
  resetDatabase,
} from '../helpers.ts'
import type { FakeMailer } from '@adonisjs/mail'

/**
 * A data de nascimento de quem faz `age` anos hoje.
 *
 * Calculada e não escrita à mão: uma data fixa envelhece, e o teste da idade
 * mínima passaria a medir outra idade a cada aniversário do repositório - até
 * parar de medir coisa nenhuma.
 *
 * Montada campo a campo em vez de `toISOString()`: aquele converte para UTC, e
 * num fuso a oeste de Greenwich a data volta um dia.
 */
function birthDateForAge(age: number): string {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${today.getFullYear() - age}-${month}-${day}`
}

test.group('vitrine > matrículas', (group) => {
  group.each.setup(() => resetDatabase())

  test('envia matrícula sem sessão e recebe o protocolo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    response.assertStatus(201)

    const enrollment = body(response)
    assert.equal(enrollment.status, 'PENDING')
    // A única credencial que o candidato leva embora. Vem de DEFAULT no banco:
    // sem o `refresh` do use-case sairia indefinida.
    assert.isString(enrollment.protocol)
    assert.notEqual(enrollment.protocol, enrollment.id)

    /*
     * O instante do consentimento é conferido pelo painel, e não aqui.
     *
     * A resposta sem sessão passou a ser uma projeção mínima, e `lgpdConsentAt`
     * não está nela - nem precisa: quem acabou de consentir não precisa que o
     * servidor lhe conte a hora. Quem precisa é a escola, se alguém questionar
     * o consentimento.
     *
     * `isNotNull` sobre a resposta pública teria continuado **passando** depois
     * da projeção, porque `undefined !== null` - o teste seguiria verde
     * atestando algo que a resposta deixou de dizer. Ler pelo painel é o que
     * mantém a asserção ligada ao fato.
     */
    const secretaria = await client
      .get(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)

    // Instante e não booleano: a LGPD pede saber quando o titular consentiu.
    assert.isNotNull(body(secretaria).lgpdConsentAt)
    assert.isNotNull(body(secretaria).termsAcceptedAt)
  })

  test('menor de idade sem responsável é 422 com um erro por campo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentBirthDate: '2010-05-10' }))

    response.assertStatus(422)

    const errors = body(response).errors
    // Três campos marcados, e não uma mensagem no root: o formulário precisa
    // pintar os três inputs que faltam.
    assert.property(errors, 'guardianName')
    assert.property(errors, 'guardianDocument')
    assert.property(errors, 'guardianPhone')
  })

  test('menor de idade com responsável é aceito', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client.post('/storefront/enrollments').json(
      enrollmentPayload(turma.id, {
        studentBirthDate: '2010-05-10',
        guardianName: 'Maria Souza',
        guardianDocument: '39053344705',
        guardianPhone: '97984600872',
      })
    )

    response.assertStatus(201)
  })

  test('data de nascimento no futuro é recusada', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentBirthDate: '2099-01-01' }))

    response.assertStatus(422)
    assert.property(body(response).errors, 'studentBirthDate')
  })

  test('idade abaixo do piso é recusada mesmo sem idade mínima no curso', async ({
    client,
    assert,
  }) => {
    const session = await authenticateAsOwner(client)
    // Sem `minimumAge`: é o curso cadastrado às pressas, e o caso que o piso
    // existe para cobrir.
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentBirthDate: birthDateForAge(13) }))

    response.assertStatus(422)
    assert.equal(body(response).code, 'AGE_BELOW_MINIMUM')
    // No campo, e não no root: é o input da data que a tela precisa marcar.
    assert.property(body(response).errors, 'studentBirthDate')
  })

  test('a idade mínima do curso vence o piso quando é maior', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session, { minimumAge: 16 })
    const turma = await createClass(client, session, course.id)

    // Quinze anos passa do piso de 14 e não chega aos 16 deste curso.
    const recusado = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentBirthDate: birthDateForAge(15) }))

    recusado.assertStatus(422)
    assert.equal(body(recusado).code, 'AGE_BELOW_MINIMUM')

    const aceito = await client.post('/storefront/enrollments').json(
      enrollmentPayload(turma.id, {
        studentBirthDate: birthDateForAge(16),
        guardianName: 'Maria Souza',
        guardianDocument: '39053344705',
        guardianPhone: '97984600872',
      })
    )

    // Dezesseis em ponto entra: o limite é "a partir de", e quem faz aniversário
    // hoje já tem a idade.
    aceito.assertStatus(201)
  })

  test('nome com número é recusado', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentName: 'Maria 12345' }))

    response.assertStatus(422)
    assert.property(body(response).errors, 'studentName')
  })

  test('nome de uma palavra só é aceito', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    // A escola atende o Alto Solimões: nome indígena sem sobrenome é aluno
    // real, e exigir duas palavras o barraria na porta.
    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentName: 'Tarinu' }))

    response.assertStatus(201)
  })

  test('o mesmo CPF não entra duas vezes na mesma turma', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const first = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    first.assertStatus(201)

    // Mesmo CPF, outro e-mail e outro nome: é a mesma pessoa reenviando o
    // formulário, que é o que o índice existe para pegar.
    const second = await client.post('/storefront/enrollments').json(
      enrollmentPayload(turma.id, {
        studentName: 'Joao da Silva Filho',
        email: 'outro@exemplo.com',
      })
    )

    second.assertStatus(422)
    assert.equal(body(second).code, 'DUPLICATE_ENROLLMENT')
    assert.property(body(second).errors, 'studentDocument')
  })

  test('o mesmo CPF entra em turmas diferentes', async ({ client }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const primeira = await createClass(client, session, course.id)
    const segunda = await createClass(client, session, course.id, { name: 'Turma da tarde' })

    const first = await client.post('/storefront/enrollments').json(enrollmentPayload(primeira.id))
    first.assertStatus(201)

    // O índice é por turma de propósito: a mesma pessoa cursa robótica e
    // desenvolvimento web, e repete no semestre seguinte.
    const second = await client.post('/storefront/enrollments').json(enrollmentPayload(segunda.id))

    second.assertStatus(201)
  })

  test('o responsável não pode usar o CPF do próprio aluno', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const documento = cpfFrom('529982247')

    const response = await client.post('/storefront/enrollments').json(
      enrollmentPayload(turma.id, {
        studentBirthDate: birthDateForAge(15),
        studentDocument: documento,
        guardianName: 'Maria Souza',
        guardianDocument: documento,
        guardianPhone: '97984600872',
      })
    )

    response.assertStatus(422)
    assert.equal(body(response).code, 'GUARDIAN_SAME_DOCUMENT')
    assert.property(body(response).errors, 'guardianDocument')
  })

  test('turma lotada entra como WAITLIST em vez de recusar', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { capacity: 1 })

    const first = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    first.assertStatus(201)
    assert.equal(body(first).status, 'PENDING')

    const second = await client.post('/storefront/enrollments').json(
      enrollmentPayload(turma.id, {
        email: 'segundo@exemplo.com',
        studentDocument: cpfFrom('390533447'),
      })
    )

    // A vaga não estoura e o candidato não é mandado embora.
    second.assertStatus(201)
    assert.equal(body(second).status, 'WAITLIST')

    // E a turma virou FULL sozinha - `FULL` é derivado, não digitado.
    const view = await client.get(`/administrator/classes/${turma.id}`).cookies(session)
    assert.equal(body(view).status, 'FULL')
    assert.equal(body(view).seatsRemaining, 0)
  })

  test('turma fechada não aceita matrícula', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { status: 'CLOSED' })

    const response = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    response.assertStatus(422)
    assert.equal(body(response).code, 'CLASS_UNAVAILABLE')
  })

  test('curso fora do ar não aceita matrícula na turma dele', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    await client
      .put(`/administrator/courses/${course.id}`)
      .cookies(session)
      .json({ status: 'INACTIVE' })

    const response = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    response.assertStatus(422)
    assert.equal(body(response).code, 'CLASS_UNAVAILABLE')
  })

  test('acompanha pelo protocolo sem receber o cadastro', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const created = await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))
    const enrollment = body(created)

    await client
      .put(`/administrator/enrollments/${enrollment.id}`)
      .cookies(session)
      .json({ notes: 'Ligar para confirmar o Pix' })

    const response = await client.get(`/storefront/enrollments/${enrollment.protocol}`)

    response.assertStatus(200)

    const publico = body(response)

    // O que a tela de acompanhamento precisa, e chega.
    assert.equal(publico.protocol, enrollment.protocol)
    assert.equal(publico.status, 'PENDING')
    assert.equal(publico.studentFirstName, 'João')
    assert.equal(publico.class.course.name, course.name)

    /*
     * E o que não chega.
     *
     * O link desta rota viaja por WhatsApp - é encaminhado, fica no histórico
     * da conversa e sobrevive à troca de aparelho. Enquanto a rota serializava
     * o model inteiro, cada uma dessas cópias carregava o cadastro completo de
     * quem se inscreveu, inclusive de menores de idade com os dados do
     * responsável legal junto.
     *
     * A lista é escrita campo a campo de propósito: uma coluna nova em
     * `enrollments` nasce fora da projeção, e é este teste que precisa falhar
     * se alguém a colocar lá dentro sem querer.
     */
    for (const campo of [
      'studentName',
      'studentDocument',
      'studentBirthDate',
      'email',
      'phone',
      'guardianName',
      'guardianDocument',
      'guardianPhone',
      'notes',
    ]) {
      assert.notProperty(publico, campo, `\`${campo}\` não pode sair na rota sem sessão`)
    }

    // O comprovante entra como "existe ou não": o caminho do arquivo no bucket
    // é o dado mais sensível do pedido, e a tela só pergunta se há anexo.
    assert.isArray(publico.files)

    // A secretaria continua vendo tudo, que é o ponto: o dado não sumiu do
    // banco, só deixou de sair por uma URL que qualquer um pode abrir.
    const admin = await client.get(`/administrator/enrollments/${enrollment.id}`).cookies(session)
    assert.equal(body(admin).notes, 'Ligar para confirmar o Pix')
    assert.equal(body(admin).studentName, 'João da Silva')
    assert.equal(body(admin).email, 'joao@exemplo.com')
  })

  test('protocolo inexistente é 404', async ({ client }) => {
    const response = await client.get(
      '/storefront/enrollments/00000000-0000-4000-8000-000000000000'
    )

    response.assertStatus(404)
  })
})

/**
 * O aceite do contrato e o consentimento da LGPD.
 *
 * Testado contra o **validator**, e não pela rota como o resto: o registro de
 * rotas tipa os dois campos como `literal(true)`, e o cliente do Japa recusa
 * `false` em tempo de compilação - o corpo inválido não é construível ali. O que
 * importa provar é que o servidor os exige, e é o validator quem os exige.
 */
test.group('vitrine > matrículas > consentimento', () => {
  const base = {
    classId: '00000000-0000-4000-8000-000000000000',
    studentName: 'João da Silva',
    studentBirthDate: '2000-04-12',
    studentDocument: '52998224725',
    email: 'joao@exemplo.com',
    phone: '97984600872',
    termsAccepted: true,
    lgpdConsent: true,
  }

  test('aceita o payload com os dois aceites marcados', async ({ assert }) => {
    const payload = await StorefrontEnrollmentCreateValidator.validate(base)

    assert.equal(payload.email, 'joao@exemplo.com')
  })

  test('recusa o envio sem CPF do aluno', async ({ assert }) => {
    // Aqui e não pela rota pelo mesmo motivo dos aceites: o registro de rotas
    // tipa `studentDocument` como obrigatório, e o corpo sem ele não compila do
    // lado do cliente do Japa.
    const { studentDocument: _cpf, ...semCpf } = base

    await assert.rejects(() => StorefrontEnrollmentCreateValidator.validate(semCpf))
  })

  test('recusa sem o consentimento da LGPD', async ({ assert }) => {
    await assert.rejects(() =>
      StorefrontEnrollmentCreateValidator.validate({ ...base, lgpdConsent: false })
    )
  })

  test('recusa sem o aceite do contrato', async ({ assert }) => {
    await assert.rejects(() =>
      StorefrontEnrollmentCreateValidator.validate({ ...base, termsAccepted: false })
    )
  })

  test('recusa telefone que não é telefone', async ({ assert }) => {
    await assert.rejects(() =>
      StorefrontEnrollmentCreateValidator.validate({ ...base, phone: 'nao tenho fone' })
    )
  })

  test('recusa CPF com dígito verificador errado', async ({ assert }) => {
    await assert.rejects(() =>
      StorefrontEnrollmentCreateValidator.validate({ ...base, studentDocument: '11111111111' })
    )
  })

  test('aceita CPF mascarado e grava só os dígitos', async ({ assert }) => {
    const payload = await StorefrontEnrollmentCreateValidator.validate({
      ...base,
      studentDocument: '390.533.447-05',
    })

    // O `parse()` tira a máscara antes de qualquer regra: sem isso o mesmo CPF
    // existiria no banco de duas formas.
    assert.equal(payload.studentDocument, '39053344705')
  })
})

/**
 * O aviso que a secretaria recebe quando alguém se inscreve.
 *
 * `mail.fake()` troca o transporte antes de qualquer envio, então nada sai da
 * máquina - e o teste continua exercitando o caminho real do use-case, que é o
 * que importa. As mensagens vão para `queued` e não para `sent` porque o serviço
 * usa `sendLater`: enfileirar é o comportamento, e afirmar `sent` provaria o
 * oposto do desenhado.
 */
test.group('vitrine > matrículas > aviso para a secretaria', (group) => {
  let mails: FakeMailer

  group.each.setup(() => resetDatabase())
  group.each.setup(() => {
    mails = mail.fake()

    // Só restaura. `clear()` depois de `restore()` mexe num fake que já saiu de
    // cena e estoura no teardown.
    return () => mail.restore()
  })

  test('matrícula nova enfileira o aviso com o protocolo no corpo', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id)

    const response = await client
      .post('/storefront/enrollments')
      .json(enrollmentPayload(turma.id, { studentName: 'Maria de Souza' }))

    response.assertStatus(201)

    const queued = mails.messages.queued()

    assert.lengthOf(queued, 1)
    assert.equal(queued[0].nodeMailerMessage.subject, 'Nova matrícula: Maria de Souza')
    assert.include(String(queued[0].nodeMailerMessage.html), response.body().protocol)
    queued[0].assertRecipient('to', 'secretaria@maiyu.test')
  })

  test('fila de espera muda o assunto do aviso', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)
    const course = await createCourse(client, session)
    const turma = await createClass(client, session, course.id, { capacity: 1 })

    await client.post('/storefront/enrollments').json(enrollmentPayload(turma.id))

    const response = await client.post('/storefront/enrollments').json(
      enrollmentPayload(turma.id, {
        studentName: 'Ana Ribeiro',
        email: 'ana@exemplo.com',
        studentDocument: cpfFrom('390533447'),
      })
    )

    response.assertStatus(201)
    assert.equal(response.body().status, 'WAITLIST')

    const queued = mails.messages.queued()

    assert.lengthOf(queued, 2)
    assert.equal(queued[1].nodeMailerMessage.subject, 'Fila de espera: Ana Ribeiro')
  })
})
