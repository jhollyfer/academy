import Class from '#models/class'
import Enrollment from '#models/enrollment'
import { syncClassStatus } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Enrollment>

/**
 * Apaga a linha de vez. Só aceita matrícula já arquivada.
 *
 * A busca não filtra `deletedAt`, senão matrícula viva e inexistente cairiam no
 * mesmo 404 e o cliente não saberia qual dos dois aconteceu.
 */
@inject()
export default class EnrollmentDeleteUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const enrollment = await Enrollment.query().where('id', payload.id).first()

      if (!enrollment)
        return left(HTTPException.NotFound('Matrícula não encontrada', 'ENROLLMENT_NOT_FOUND'))

      if (!enrollment.deletedAt)
        return left(
          HTTPException.Conflict('Matrícula não está arquivada', 'ENROLLMENT_NOT_ARCHIVED', {
            id: 'Arquive a matrícula antes de apagá-la',
          })
        )

      const classId = enrollment.classId

      // Os vínculos em `enrollment_files` vão junto por `CASCADE`. As linhas de
      // `storages` ficam: o binário é de outra rotina, e apagá-lo aqui deixaria
      // a secretaria sem o comprovante de uma conferência já feita.
      await enrollment.delete()

      const turma = await Class.find(classId)
      if (turma) await syncClassStatus(turma)

      return right(enrollment)
    } catch (error) {
      logger.error({ err: error }, '[enrollments > delete][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_DELETE_ERROR')
      )
    }
  }
}
