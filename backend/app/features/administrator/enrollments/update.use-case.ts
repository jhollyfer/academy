import Class from '#models/class'
import Enrollment from '#models/enrollment'
import { syncClassStatus } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import {
  ENROLLMENT_TRANSITIONS,
  EnrollmentFileKinds,
  EnrollmentStatuses,
  type Merge,
} from '#core/entity'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorEnrollmentUpdatePayload, IdentifierPayload } from '#core/validator'

type Payload = Merge<AdministratorEnrollmentUpdatePayload, IdentifierPayload>
type Response = Either<HTTPException, Enrollment>

@inject()
export default class EnrollmentUpdateUseCase {
  async execute({ id, ...payload }: Payload): Promise<Response> {
    try {
      const enrollment = await Enrollment.query()
        .where('id', id)
        .whereNull('deletedAt')
        .preload('files')
        .first()

      if (!enrollment)
        return left(HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND'))

      // Reenviar o estado que já está gravado não é transição, e não passa pelo
      // mapa - senão confirmar duas vezes o mesmo pedido daria 409 por nada.
      if (payload.status && payload.status !== enrollment.status) {
        const allowed = ENROLLMENT_TRANSITIONS[enrollment.status]

        if (!allowed.includes(payload.status))
          return left(
            HTTPException.Conflict('Transição inválida', 'ENROLLMENT_INVALID_TRANSITION', {
              status: `Uma matrícula ${enrollment.status} não pode ir para ${payload.status}`,
            })
          )

        // Confirmar sem comprovante seria carimbar pagamento sem prova. Não há
        // gateway no v1: o arquivo é a única evidência que existe, e um clique
        // distraído não pode substituí-la.
        if (payload.status === EnrollmentStatuses.CONFIRMED) {
          const hasReceipt = enrollment.files.some(function (file) {
            return file.kind === EnrollmentFileKinds.PAYMENT_RECEIPT
          })

          if (!hasReceipt)
            return left(
              HTTPException.Conflict('Comprovante ausente', 'ENROLLMENT_RECEIPT_MISSING', {
                status: 'Anexe o comprovante do Pix antes de confirmar a matrícula',
              })
            )
        }
      }

      enrollment.merge(payload)
      await enrollment.save()

      // Cancelar devolve a vaga, e promover da fila ocupa uma. Nos dois casos a
      // lotação da turma mudou sem que ninguém tenha editado a turma - `FULL` é
      // derivado, e precisa de quem o derive.
      const turma = await Class.find(enrollment.classId)
      if (turma) await syncClassStatus(turma)

      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[enrollments > update][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_UPDATE_ERROR')
      )
    }
  }
}
