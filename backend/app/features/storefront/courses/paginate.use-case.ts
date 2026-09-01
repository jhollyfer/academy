import Course from '#models/course'
import { visibleCourses } from '#features/_shared.storefront'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { Paginated } from '#core/entity'
import type { PaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = PaginationPayload
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class StorefrontCourseListUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const query = visibleCourses(Course.query()).preload('cover')

      if (payload.search) query.whereILike('name', `%${payload.search}%`)

      const courses = await query
        // A ordem dos cards é decisão da escola, e é o que a home reflete.
        .orderBy('position', 'asc')
        .orderBy('name', 'asc')
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: courses.getMeta(), data: courses.all() })
    } catch (error) {
      logger.error({ err: error }, '[storefront > courses > list][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'COURSE_LIST_ERROR')
      )
    }
  }
}
