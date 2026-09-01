import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import EnrollmentListUseCase from './paginate.use-case.ts'
import {
  AdministratorEnrollmentPaginationValidator,
  ENROLLMENT_SORT_COLUMNS,
} from '#core/validator'

@inject()
export default class EnrollmentListController {
  static docs = defineDocs({
    description:
      'A fila da secretaria. `?search` filtra por nome, e-mail ou protocolo; `?classId` e ' +
      '`?courseId` recortam por turma e por curso; `?status` pela situação. ' +
      `\`?sort\` aceita ${ENROLLMENT_SORT_COLUMNS.join(', ')}. ` +
      'Padrão: mais recentes primeiro - é a ordem em que a secretaria trabalha.',
  })

  constructor(private readonly useCase: EnrollmentListUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AdministratorEnrollmentPaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
