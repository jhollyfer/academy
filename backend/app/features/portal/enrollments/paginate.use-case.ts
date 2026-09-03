import Enrollment from '#models/enrollment'
import User from '#models/user'
import { scopeEnrollmentsTo } from '#features/_shared.portal'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { Merge, type Paginated } from '#core/entity'
import type { PaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = Merge<PaginationPayload, { actor: User }>
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class PortalEnrollmentListUseCase {
  async execute({ actor, ...payload }: Payload): Promise<Response> {
    try {
      const query = Enrollment.query().whereNull('deletedAt').preload('class')

      scopeEnrollmentsTo(query, actor)

      const enrollments = await query
        // Sem `sortFields`: o portal não oferece ordenação. A pessoa tem uma ou
        // duas matrículas, e a mais recente primeiro é a única ordem que faz
        // sentido numa tela sem cabeçalho clicável.
        .orderBy('createdAt', 'desc')
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: enrollments.getMeta(), data: enrollments.all() })
    } catch (error) {
      logger.error({ err: error }, '[portal > enrollments > list][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_LIST_ERROR')
      )
    }
  }
}
