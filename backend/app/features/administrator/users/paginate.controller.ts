import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import UserListUseCase from './paginate.use-case.ts'
import { AdministratorUserPaginationValidator, USER_SORT_COLUMNS } from '#core/validator'

@inject()
export default class UserListController {
  static docs = defineDocs({
    description:
      'Listagem paginada. `?search` filtra por nome e e-mail, `?role` recorta por papel e ' +
      '`?trashed` alcança os arquivados. ' +
      `\`?sort\` aceita ${USER_SORT_COLUMNS.join(', ')} e \`?direction\` aceita asc ou desc. ` +
      'O dono não aparece para quem não é dono.',
  })

  constructor(private readonly useCase: UserListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AdministratorUserPaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute({ ...payload, actor: context.auth.user! })
    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
