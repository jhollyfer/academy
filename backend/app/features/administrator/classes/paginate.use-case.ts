import Class from '#models/class'
import { withSeatsTaken } from '#features/_shared.seats'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { TrashedModes, sortOrder, type Paginated } from '#core/entity'
import type { AdministratorClassPaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = AdministratorClassPaginationPayload
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class ClassListUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      // A ocupação sai de uma agregada só, e a definição de "vaga ocupada" vem
      // do `_shared.seats` - reescrever o filtro aqui daria uma segunda
      // definição para divergir.
      const query = withSeatsTaken(Class.query()).preload('course')

      if (!payload.trashed) query.whereNull('deletedAt')
      if (payload.trashed === TrashedModes.ONLY) query.whereNotNull('deletedAt')

      if (payload.courseId) query.where('courseId', payload.courseId)
      if (payload.status) query.where('status', payload.status)

      if (payload.search) query.whereILike('name', `%${payload.search}%`)

      const classes = await query
        // A turma mais próxima primeiro: é a que a secretaria opera.
        .orderBy(...sortOrder(payload, 'startsAt'))
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: classes.getMeta(), data: classes.all() })
    } catch (error) {
      logger.error({ err: error }, '[classes > list][error]')
      return left(HTTPException.InternalServerError('Erro interno do servidor', 'CLASS_LIST_ERROR'))
    }
  }
}
