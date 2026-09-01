import Class from '#models/class'
import Enrollment from '#models/enrollment'
import { syncClassStatus } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Enrollment>

@inject()
export default class EnrollmentArchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const enrollment = await Enrollment.query()
        .where('id', payload.id)
        .whereNull('deletedAt')
        .first()

      if (!enrollment)
        return left(HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND'))

      enrollment.deletedAt = DateTime.now()
      await enrollment.save()

      // A contagem de ocupação ignora matrícula na lixeira, então arquivar
      // devolve a vaga. Sem esta linha a turma continuaria `FULL` com uma vaga
      // livre, e a landing recusaria uma inscrição que cabia.
      const turma = await Class.find(enrollment.classId)
      if (turma) await syncClassStatus(turma)

      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[enrollments > archive][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_ARCHIVE_ERROR')
      )
    }
  }
}
