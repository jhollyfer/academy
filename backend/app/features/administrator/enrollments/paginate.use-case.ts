import Enrollment from '#models/enrollment'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import { SortDirections, TrashedModes, sortOrder, type Paginated } from '#core/entity'
import type { AdministratorEnrollmentPaginationPayload } from '#core/validator'
import type { ModelObject } from '@adonisjs/lucid/types/model'

type Payload = AdministratorEnrollmentPaginationPayload
type Response = Either<HTTPException, Paginated<ModelObject>>

const PAGE = 1
const PER_PAGE = 20

@inject()
export default class EnrollmentListUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const query = Enrollment.query()
        .preload('class', function (turma) {
          turma.preload('course')
        })
        .preload('files', function (files) {
          files.preload('storage')
        })

      if (!payload.trashed) query.whereNull('deletedAt')
      if (payload.trashed === TrashedModes.ONLY) query.whereNotNull('deletedAt')

      if (payload.classId) query.where('classId', payload.classId)
      if (payload.status) query.where('status', payload.status)

      // O curso não é coluna de `enrollments`: chega pela turma. Subconsulta em
      // vez de `join` porque um join duplicaria a linha se a relação crescesse,
      // e a paginação passaria a contar errado.
      if (payload.courseId)
        query.whereIn(
          'classId',
          Enrollment.query()
            .client.from('classes')
            .select('id')
            .where('course_id', payload.courseId)
        )

      // A busca alcança o protocolo de propósito: é o número que o candidato
      // dita no WhatsApp, e procurá-lo é o caso mais comum do balcão.
      if (payload.search) {
        const term = `%${payload.search}%`

        query.where(function (scope) {
          scope
            .whereILike('studentName', term)
            .orWhereILike('email', term)
            // `::text` porque `protocol` é `uuid`, e o Postgres não tem `ILIKE`
            // para esse tipo - sem o cast a consulta inteira morre em
            // `operator does not exist: uuid ~~*`, e a busca da secretaria
            // responde 500 em vez de listar.
            .orWhereRaw('protocol::text ILIKE ?', [term])
        })
      }

      const enrollments = await query
        // Mais recentes primeiro: a fila da secretaria começa pelo que acabou
        // de chegar, ao contrário das listagens de catálogo.
        .orderBy(
          ...sortOrder(
            { ...payload, direction: payload.direction ?? SortDirections.DESC },
            'createdAt'
          )
        )
        .paginate(payload.page ?? PAGE, payload.perPage ?? PER_PAGE)

      return right({ meta: enrollments.getMeta(), data: enrollments.all() })
    } catch (error) {
      logger.error({ err: error }, '[enrollments > list][error]')
      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'ENROLLMENT_LIST_ERROR')
      )
    }
  }
}
