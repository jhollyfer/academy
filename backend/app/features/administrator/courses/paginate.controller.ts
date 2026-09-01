import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import CourseListUseCase from './paginate.use-case.ts'
import { AdministratorCoursePaginationValidator, COURSE_SORT_COLUMNS } from '#core/validator'

@inject()
export default class CourseListController {
  static docs = defineDocs({
    description:
      'Listagem paginada. `?search` filtra por nome e `?trashed` alcança os arquivados. ' +
      `\`?sort\` aceita ${COURSE_SORT_COLUMNS.join(', ')} e \`?direction\` aceita asc ou desc. ` +
      'Padrão: página 1, 20 por página, ordenada pela posição na home.',
  })

  constructor(private readonly useCase: CourseListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AdministratorCoursePaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
