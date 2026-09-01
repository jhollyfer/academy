import Class from '#models/class'
import Course from '#models/course'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AdministratorClassCreatePayload } from '#core/validator'

type Payload = AdministratorClassCreatePayload
type Response = Either<HTTPException, Class>

@inject()
export default class ClassCreateUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      // O curso é conferido antes: sem isto o INSERT estouraria a chave
      // estrangeira e viraria 500, em vez de um 422 apontando o campo.
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

      const created = await Class.create(payload)

      // `status` vem de DEFAULT no banco, e o INSERT do Lucid só devolve a
      // chave primária - sem o refresh a resposta sairia com ele indefinido.
      await created.refresh()

      return right(created)
    } catch (error) {
      logger.error({ err: error }, '[classes > create][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'CLASS_CREATE_ERROR')
      )
    }
  }
}
