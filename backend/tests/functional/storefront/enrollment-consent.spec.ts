import { test } from '@japa/runner'
import { StorefrontEnrollmentCreateValidator } from '#core/validator'

/**
 * O aceite do contrato e o consentimento da LGPD.
 *
 * Testado contra o **validator**, e não pela rota como o resto: o registro de
 * rotas tipa os dois campos como `literal(true)`, e o cliente do Japa recusa
 * `false` em tempo de compilação - o corpo inválido não é construível ali. O que
 * importa provar é que o servidor os exige, e é o validator quem os exige.
 */
test.group('storefront/enrollments · consentimento', () => {
  const base = {
    classId: '00000000-0000-4000-8000-000000000000',
    studentName: 'João da Silva',
    studentBirthDate: '2000-04-12',
    email: 'joao@exemplo.com',
    phone: '97984600872',
    termsAccepted: true,
    lgpdConsent: true,
  }

  test('aceita o payload com os dois aceites marcados', async ({ assert }) => {
    const payload = await StorefrontEnrollmentCreateValidator.validate(base)

    assert.equal(payload.email, 'joao@exemplo.com')
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
