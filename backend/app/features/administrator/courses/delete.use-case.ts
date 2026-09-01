import Class from '#models/class'
import Course from '#models/course'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { IdentifierPayload } from '#core/validator'

type Payload = IdentifierPayload
type Response = Either<HTTPException, Course>

/**
 * Apaga a linha de vez. Só aceita curso já arquivado - o caminho para a lixeira
 * é `PATCH /:id/archive`, e exigir a passagem por lá é o que impede um clique de
 * perder o registro sem escala intermediária.
 *
 * A busca não filtra `deletedAt`, senão curso vivo e inexistente cairiam no
 * mesmo 404 e o cliente não saberia qual dos dois aconteceu.
 */
@inject()
export default class CourseDeleteUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const course = await Course.query().where('id', payload.id).first()

      if (!course) return left(HTTPException.NotFound('Curso não encontrado', 'COURSE_NOT_FOUND'))

      if (!course.deletedAt)
        return left(
          HTTPException.Conflict('Curso não está arquivado', 'COURSE_NOT_ARCHIVED', {
            id: 'Arquive o curso antes de apagá-lo',
          })
        )

      // `classes.course_id` é `RESTRICT`: sem esta checagem o `DELETE`
      // estouraria a chave estrangeira e viraria 500. Conta turma arquivada
      // também - a linha continua lá, e é ela que a constraint enxerga.
      const classes = await Class.query().where('courseId', course.id).count('* as total')

      if (Number(classes[0].$extras.total) > 0)
        return left(
          HTTPException.Conflict('Curso possui turmas', 'COURSE_HAS_CLASSES', {
            id: 'Apague as turmas do curso antes de apagá-lo',
          })
        )

      // A grade e o FAQ vão junto por `CASCADE`.
      await course.delete()

      return right(course)
    } catch (error) {
      logger.error({ err: error }, '[courses > delete][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_DELETE_ERROR')
      )
    }
  }
}
