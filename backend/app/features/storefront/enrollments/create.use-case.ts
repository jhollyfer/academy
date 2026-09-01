import Class from '#models/class'
import Enrollment from '#models/enrollment'
import { seatsRemaining, syncClassStatus } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import {
  ActiveStatuses,
  ClassStatuses,
  EnrollmentStatuses,
  LEGAL_AGE,
  type EnrollmentStatus,
} from '#core/entity'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type { StorefrontEnrollmentCreatePayload } from '#core/validator'

type Payload = StorefrontEnrollmentCreatePayload
type Response = Either<HTTPException, Enrollment>

/**
 * Os campos do responsável legal, e a mensagem de cada um.
 *
 * Um mapa e não três `if`: a pergunta "o que falta para um menor?" se responde
 * lendo uma linha, e um campo novo entra sem tocar em condição nenhuma.
 */
const GUARDIAN_FIELDS = {
  guardianName: 'Informe o nome do responsável legal',
  guardianDocument: 'Informe o CPF do responsável legal',
  guardianPhone: 'Informe o telefone do responsável legal',
} as const

@inject()
export default class StorefrontEnrollmentCreateUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const turma = await Class.query()
        .where('id', payload.classId)
        .whereNull('deletedAt')
        .preload('course')
        .first()

      // Turma inexistente, arquivada, de curso fora do ar ou fechada respondem
      // a mesma coisa: para quem está do lado de fora, todas significam "esta
      // vaga não existe". Distinguir só diria a um curioso o que existe no
      // banco.
      const unavailable =
        !turma ||
        turma.status === ClassStatuses.CLOSED ||
        turma.course.deletedAt ||
        turma.course.status !== ActiveStatuses.ACTIVE

      if (unavailable)
        return left(
          HTTPException.UnprocessableEntity('Turma indisponível', 'CLASS_UNAVAILABLE', {
            classId: 'Esta turma não está aberta para matrícula',
          })
        )

      // A idade na data do envio. `DateTime.now()` e não a data de hoje
      // recalculada depois: é este instante que decide se o responsável era
      // exigido, e é ele que `createdAt` vai guardar.
      const now = DateTime.now()
      const age = Math.floor(now.diff(payload.studentBirthDate, 'years').years)

      if (age < LEGAL_AGE) {
        // Vem para cá e não para o validator porque a condição depende de outro
        // campo, e uma regra de objeto do VineJS reporta no caminho do objeto -
        // o nome do campo iria para `meta`, e o formulário não pintaria input
        // nenhum. O `errors` do `HTTPException` mapeia campo para mensagem, que
        // é o que a tela precisa.
        const missing: Record<string, string> = {}

        for (const [name, message] of Object.entries(GUARDIAN_FIELDS)) {
          if (!payload[name as keyof typeof GUARDIAN_FIELDS]) missing[name] = message
        }

        if (Object.keys(missing).length > 0)
          return left(
            HTTPException.UnprocessableEntity(
              'Responsável legal obrigatório',
              'GUARDIAN_REQUIRED',
              missing
            )
          )
      }

      // Lida agora e não da leitura acima: entre carregar a turma e gravar,
      // outra pessoa pode ter ocupado a última vaga.
      const remaining = await seatsRemaining(turma.id, turma.capacity)

      // Turma cheia não recusa a inscrição. É o que permite continuar recebendo
      // candidato depois das 40 sem estourar a capacidade nem mandar ninguém
      // embora - e é para isso que `WAITLIST` existe.
      let status: EnrollmentStatus = EnrollmentStatuses.PENDING
      if (remaining <= 0) status = EnrollmentStatuses.WAITLIST

      const { termsAccepted: _terms, lgpdConsent: _lgpd, ...fields } = payload

      const enrollment = await Enrollment.create({
        ...fields,
        status,
        // Instante e não booleano: a LGPD pede saber **quando** o titular
        // consentiu, e um `true` não responde isso.
        termsAcceptedAt: now,
        lgpdConsentAt: now,
      })

      // O `protocol` vem de DEFAULT no banco, e o INSERT do Lucid só devolve a
      // chave primária - sem o refresh a resposta sairia sem a única credencial
      // que o candidato leva embora.
      await enrollment.refresh()

      // A vaga que acabou de sair pode ter sido a última. `FULL` é derivado, e
      // derivado precisa de quem o derive.
      await syncClassStatus(turma)

      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[storefront > enrollments > create][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_CREATE_ERROR')
      )
    }
  }
}
