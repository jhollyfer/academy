import Class from '#models/class'
import Enrollment from '#models/enrollment'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Class>

/**
 * Apaga a linha de vez. Só aceita turma já arquivada - exigir a passagem pela
 * lixeira é o que impede um clique de perder o registro sem escala.
 *
 * A busca não filtra `deletedAt`, senão turma viva e inexistente cairiam no
 * mesmo 404 e o cliente não saberia qual dos dois aconteceu.
 */
@inject()
export default class ClassDeleteUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const entity = await Class.query().where('id', payload.id).first()

      if (!entity) return left(HTTPException.NotFound('Turma não encontrada', 'CLASS_NOT_FOUND'))

      if (!entity.deletedAt)
        return left(
          HTTPException.Conflict('Turma não está arquivada', 'CLASS_NOT_ARCHIVED', {
            id: 'Arquive a turma antes de apagá-la',
          })
        )

      // `enrollments.class_id` é `RESTRICT`: sem esta checagem o `DELETE`
      // estouraria a chave estrangeira e viraria 500. Conta matrícula cancelada
      // e arquivada também - a linha continua lá, e é ela que a constraint
      // enxerga.
      const enrollments = await Enrollment.query().where('classId', entity.id).count('* as total')

      if (Number(enrollments[0].$extras.total) > 0)
        return left(
          HTTPException.Conflict('Turma possui matrículas', 'CLASS_HAS_ENROLLMENTS', {
            id: 'Apague as matrículas da turma antes de apagá-la',
          })
        )

      await entity.delete()

      return right(entity)
    } catch (error) {
      logger.error({ err: error }, '[classes > delete][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'CLASS_DELETE_ERROR')
      )
    }
  }
}
