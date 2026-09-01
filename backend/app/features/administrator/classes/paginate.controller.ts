import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import ClassListUseCase from './paginate.use-case.ts'
import { AdministratorClassPaginationValidator, CLASS_SORT_COLUMNS } from '#core/validator'

@inject()
export default class ClassListController {
  static docs = defineDocs({
    description:
      'Listagem paginada. `?courseId` recorta por curso, `?status` por situação e `?trashed` ' +
      `alcança as arquivadas. \`?sort\` aceita ${CLASS_SORT_COLUMNS.join(', ')}. ` +
      'Cada turma vem com `seatsTaken` e `seatsRemaining` calculados, não gravados.',
  })

  constructor(private readonly useCase: ClassListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AdministratorClassPaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
