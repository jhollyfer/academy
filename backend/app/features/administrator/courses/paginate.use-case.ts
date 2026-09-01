import Course from '#models/course'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { TrashedModes, sortOrder, type Paginated } from '#core/entity'
import type { AdministratorCoursePaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = AdministratorCoursePaginationPayload
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class CourseListUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      // A contagem de turmas vem numa consulta agregada só, e não numa por
      // linha. Ela conta a viva: turma arquivada não ocupa o curso, e é essa
      // contagem que decide se dá para removê-lo - a chave estrangeira é
      // `RESTRICT`.
      const query = Course.query().withCount('classes', function (classes) {
        classes.whereNull('classes.deleted_at')
      })

      // Sem `?trashed` a listagem é a de sempre: só os vivos.
      if (!payload.trashed) query.whereNull('deletedAt')
      if (payload.trashed === TrashedModes.ONLY) query.whereNotNull('deletedAt')

      if (payload.status) query.where('status', payload.status)
      if (payload.accent) query.where('accent', payload.accent)

      if (payload.search) query.whereILike('name', `%${payload.search}%`)

      const courses = await query
        // `position` e não `name`: a ordem dos cards na home é decisão da
        // escola, e é ela que a tela do painel reflete.
        .orderBy(...sortOrder(payload, 'position'))
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({
        meta: courses.getMeta(),
        // O `classesCount` sai do `@computed` do model, que lê o `withCount`
        // acima. Ele some sozinho nas leituras que não contam.
        data: courses.all(),
      })
    } catch (error) {
      logger.error({ err: error }, '[courses > list][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_LIST_ERROR')
      )
    }
  }
}
