import Class from '#models/class'
import Course from '#models/course'
import { seatsRemaining, syncClassStatus } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import type { Merge } from '#core/entity'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorClassUpdatePayload, IdentifierPayload } from '#core/validator'

type Payload = Merge<AdministratorClassUpdatePayload, IdentifierPayload>
type Response = Either<HTTPException, Class>

@inject()
export default class ClassUpdateUseCase {
  async execute({ id, ...payload }: Payload): Promise<Response> {
    try {
      const entity = await Class.query().where('id', id).whereNull('deletedAt').first()

      if (!entity) return left(HTTPException.NotFound('Turma não encontrada', 'CLASS_NOT_FOUND'))

      if (payload.courseId && payload.courseId !== entity.courseId) {
        const course = await Course.query()
          .where('id', payload.courseId)
          .whereNull('deletedAt')
          .first()

        if (!course)
          return left(
            HTTPException.UnprocessableEntity('Curso não encontrado', 'COURSE_NOT_FOUND', {
              courseId: 'Selecione um curso existente',
            })
          )
      }

      // Encolher a capacidade abaixo do que já saiu deixaria a turma com mais
      // gente do que cabe, e o `seatsRemaining` derivado passaria a mentir zero
      // para sempre. Recusar aqui é a única forma - o banco não sabe contar
      // matrícula.
      if (payload.capacity !== undefined && payload.capacity < entity.capacity) {
        const taken = entity.capacity - (await seatsRemaining(entity.id, entity.capacity))

        if (payload.capacity < taken)
          return left(
            HTTPException.Conflict('Capacidade menor que a ocupação', 'CLASS_CAPACITY_TOO_LOW', {
              capacity: `A turma já tem ${taken} matrícula(s); a capacidade não pode ser menor`,
            })
          )
      }

      entity.merge(payload)
      await entity.save()

      // A capacidade pode ter mudado, e com ela a lotação. `FULL` é derivado, e
      // derivado precisa de quem o derive.
      await syncClassStatus(entity)

      return right(entity)
    } catch (error) {
      logger.error({ err: error }, '[classes > update][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'CLASS_UPDATE_ERROR')
      )
    }
  }
}
