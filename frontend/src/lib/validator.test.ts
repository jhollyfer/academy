import { describe, expect, it } from 'vitest'
import {
  AdministratorClassCreateValidator,
  AdministratorCourseCreateValidator,
  AuthenticationSignInValidator,
  StorefrontEnrollmentCreateValidator,
} from './validator'

/**
 * O `validator.ts` é cópia literal de `backend/app/core/validator.ts`, e é o
 * único arquivo do frontend em que uma divergência silenciosa com o servidor
 * vira 422 na cara de quem preencheu o formulário certo.
 *
 * O que se testa aqui é o que o schema **decide**, não o que o VineJS faz: a
 * normalização de máscara, os aceites que não podem ser booleanos e as regras
 * que a tela não tem como reproduzir sozinha. Formato de e-mail e `minLength`
 * de string ficam de fora - testá-los é testar a biblioteca.
 */

/** Os campos que um erro acusou, para comparar por nome em vez de por posição. */
function fieldsOf(error: { messages: Array<{ field: string }> } | null) {
  if (!error) return []

  return error.messages.map((m) => m.field).sort()
}

const COURSE = {
  name: 'Robótica',
  description: 'Monta, programa e vê funcionar.',
  accent: 'ROBOTICS',
  workloadHours: 32,
  durationMonths: 4,
  enrollmentFeeInCents: 15000,
  monthlyFeeInCents: 15000,
  position: 0,
  status: 'ACTIVE',
  modules: [],
  faqs: [],
}

const CLASS = {
  courseId: '3f6c1a7e-9b2d-4f8a-8c1e-2d5b7a9c0e11',
  name: 'Turma 1 / 2026',
  startsAt: '2026-03-07',
  weekday: 'SATURDAY',
  shift: 'MORNING',
  startsAtTime: '08:00',
  endsAtTime: '11:00',
  location: 'Benjamin Constant/AM',
  capacity: 40,
  status: 'OPEN',
}

const ENROLLMENT = {
  classId: '3f6c1a7e-9b2d-4f8a-8c1e-2d5b7a9c0e11',
  studentName: 'Maria Souza',
  studentBirthDate: '2008-05-14',
  // Obrigatório: é o CPF que distingue duas matrículas da mesma pessoa na mesma
  // turma, e o índice que cobra isso não funciona sobre nulo.
  studentDocument: '52998224725',
  email: 'maria@mail.com',
  phone: '97984317149',
  termsAccepted: true,
  lgpdConsent: true,
}

describe('curso', () => {
  it('aceita o cadastro mínimo', async () => {
    const [error] = await AdministratorCourseCreateValidator.tryValidate(COURSE)

    expect(fieldsOf(error)).toEqual([])
  })

  it('recusa acento fora do enum', async () => {
    const [error] = await AdministratorCourseCreateValidator.tryValidate({
      ...COURSE,
      accent: 'MUSICA',
    })

    expect(fieldsOf(error)).toContain('accent')
  })

  it('recusa idade mínima negativa', async () => {
    const [error] = await AdministratorCourseCreateValidator.tryValidate({
      ...COURSE,
      minimumAge: -1,
    })

    expect(fieldsOf(error)).toContain('minimumAge')
  })
})

describe('turma', () => {
  it('aceita o cadastro mínimo', async () => {
    const [error] = await AdministratorClassCreateValidator.tryValidate(CLASS)

    expect(fieldsOf(error)).toEqual([])
  })

  it('recusa horário fora de HH:MM', async () => {
    const [error] = await AdministratorClassCreateValidator.tryValidate({
      ...CLASS,
      startsAtTime: '8h',
    })

    expect(fieldsOf(error)).toContain('startsAtTime')
  })

  it('cobra o horário: turma anunciada sem hora não diz quando aparecer', async () => {
    // Era aceito, e virou exigência: `weekday` + `shift` não separam duas
    // turmas do mesmo curso no mesmo sábado de manhã, a hora separa.
    const [error] = await AdministratorClassCreateValidator.tryValidate({
      ...CLASS,
      startsAtTime: null,
      endsAtTime: null,
    })

    expect(fieldsOf(error)).toContain('startsAtTime')
    expect(fieldsOf(error)).toContain('endsAtTime')
  })

  it('campo em branco é cobrado como ausente, e não como formato', async () => {
    // `convertEmptyStringsToNull` transforma o `''` do input vazio em `null`
    // antes das regras, então a tela mostra "informe a hora" e não "formato
    // inválido" - que seria a mensagem errada para um campo intocado.
    const [error] = await AdministratorClassCreateValidator.tryValidate({
      ...CLASS,
      startsAtTime: '',
    })

    expect(fieldsOf(error)).toContain('startsAtTime')
  })

  it('recusa término antes do início', async () => {
    const [error] = await AdministratorClassCreateValidator.tryValidate({
      ...CLASS,
      startsAtTime: '11:00',
      endsAtTime: '08:00',
    })

    expect(fieldsOf(error)).toContain('endsAtTime')
  })

  it('recusa término igual ao início: aula de duração zero', async () => {
    const [error] = await AdministratorClassCreateValidator.tryValidate({
      ...CLASS,
      startsAtTime: '08:00',
      endsAtTime: '08:00',
    })

    expect(fieldsOf(error)).toContain('endsAtTime')
  })

  it('compara a hora do banco com a do formulário', async () => {
    // O Postgres devolve `08:00:00` e o `<input type="time">` manda `08:00`.
    // Sem cortar os segundos, `'08:00:00' <= '11:00'` seria falso por tamanho e
    // a edição de uma turma existente passaria a acusar erro do nada.
    const [error] = await AdministratorClassCreateValidator.tryValidate({
      ...CLASS,
      startsAtTime: '08:00:00',
      endsAtTime: '11:00',
    })

    expect(fieldsOf(error)).toEqual([])
  })
})

describe('matrícula', () => {
  it('aceita o envio mínimo', async () => {
    const [error] =
      await StorefrontEnrollmentCreateValidator.tryValidate(ENROLLMENT)

    expect(fieldsOf(error)).toEqual([])
  })

  it('grava o telefone só em dígitos, com ou sem máscara', async () => {
    const [, comMascara] =
      await StorefrontEnrollmentCreateValidator.tryValidate({
        ...ENROLLMENT,
        phone: '(97) 98431-7149',
      })

    expect(comMascara?.phone).toBe('97984317149')
  })

  it('recusa texto que não tem dígito nenhum no telefone', async () => {
    // A regra existe para "nao tenho fone" não virar string vazia e passar
    // calado por um campo opcional.
    const [error] = await StorefrontEnrollmentCreateValidator.tryValidate({
      ...ENROLLMENT,
      phone: 'nao tenho fone',
    })

    expect(fieldsOf(error)).toContain('phone')
  })

  it('grava o CPF só em dígitos e confere o dígito verificador', async () => {
    const [, valido] = await StorefrontEnrollmentCreateValidator.tryValidate({
      ...ENROLLMENT,
      studentDocument: '529.982.247-25',
    })

    expect(valido?.studentDocument).toBe('52998224725')

    const [error] = await StorefrontEnrollmentCreateValidator.tryValidate({
      ...ENROLLMENT,
      studentDocument: '111.111.111-11',
    })

    expect(fieldsOf(error)).toContain('studentDocument')
  })

  it('recusa número no nome, e aceita nome de uma palavra só', async () => {
    const [comNumero] = await StorefrontEnrollmentCreateValidator.tryValidate({
      ...ENROLLMENT,
      studentName: 'Maria 12345',
    })

    expect(fieldsOf(comNumero)).toContain('studentName')

    // Uma palavra passa de propósito: a escola atende o Alto Solimões, e nome
    // indígena sem sobrenome é aluno real, não dado malformado.
    const [umaPalavra] = await StorefrontEnrollmentCreateValidator.tryValidate({
      ...ENROLLMENT,
      studentName: 'Tarinu',
    })

    expect(fieldsOf(umaPalavra)).toEqual([])
  })

  it('recusa data de nascimento no futuro', async () => {
    const [error] = await StorefrontEnrollmentCreateValidator.tryValidate({
      ...ENROLLMENT,
      studentBirthDate: '2099-01-01',
    })

    expect(fieldsOf(error)).toContain('studentBirthDate')
  })

  it('recusa o envio sem CPF do aluno', async () => {
    const { studentDocument: _cpf, ...semCpf } = ENROLLMENT

    const [error] =
      await StorefrontEnrollmentCreateValidator.tryValidate(semCpf)

    expect(fieldsOf(error)).toContain('studentDocument')
  })

  it('recusa aceite desmarcado, e não o grava como `false`', async () => {
    // `literal(true)` e não booleano: "false" não é um consentimento que valha
    // gravar, é o formulário enviado sem a caixa marcada.
    const [error] = await StorefrontEnrollmentCreateValidator.tryValidate({
      ...ENROLLMENT,
      termsAccepted: false,
      lgpdConsent: false,
    })

    expect(fieldsOf(error)).toEqual(['lgpdConsent', 'termsAccepted'])
  })
})

describe('sign-in', () => {
  it('recusa e-mail malformado sem vazar qual dos dois campos falhou', async () => {
    const [error] = await AuthenticationSignInValidator.tryValidate({
      email: 'maria',
      password: 'Administrator1!',
    })

    expect(fieldsOf(error)).toEqual(['email'])
  })
})
