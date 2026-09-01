import Class from '#models/class'
import Enrollment from '#models/enrollment'
import { seatsRemaining, syncClassStatus } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { EnrollmentStatuses, SEAT_TAKING_ENROLLMENT_STATUSES } from '#core/entity'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Enrollment>

/**
 * Tira da lixeira. O espelho de `archive`: busca só o que está arquivado, então
 * matrícula viva é 404 aqui pela mesma razão que arquivada é 404 lá.
 */
@inject()
export default class EnrollmentUnarchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const enrollment = await Enrollment.query()
        .where('id', payload.id)
        .whereNotNull('deletedAt')
        .first()

      if (!enrollment)
        return left(HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND'))

      const turma = await Class.find(enrollment.classId)

      // Enquanto esteve na lixeira, a vaga que ela ocupava pode ter sido tomada.
      // Restaurar às cegas colocaria 41 pessoas numa turma de 40 - e o
      // `seatsRemaining` derivado passaria a mentir zero para sempre. Volta para
      // a fila de espera, que é o estado que existe exatamente para isso.
      if (turma && SEAT_TAKING_ENROLLMENT_STATUSES.includes(enrollment.status)) {
        const remaining = await seatsRemaining(turma.id, turma.capacity)

        if (remaining <= 0) enrollment.status = EnrollmentStatuses.WAITLIST
      }

      enrollment.deletedAt = null
      await enrollment.save()

      if (turma) await syncClassStatus(turma)

      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[enrollments > unarchive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_UNARCHIVE_ERROR')
      )
    }
  }
}
