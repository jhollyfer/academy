import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import EnrollmentExportUseCase from './export.use-case.ts'
import { AdministratorEnrollmentPaginationValidator } from '#core/validator'

@inject()
export default class EnrollmentExportController {
  static docs = defineDocs({
    summary: 'Exportar matrículas em CSV',
    description:
      'Aceita os mesmos filtros da listagem e devolve `text/csv`, não JSON: é o arquivo que a ' +
      'secretaria abre no Excel. `?page` e `?perPage` são ignorados de propósito - exportar meia ' +
      'lista seria a pior forma de errar isto.\n\n' +
      'Separador `;` e BOM UTF-8 no início: sem os dois, o Excel em português quebra o ' +
      'arquivo numa coluna só e come os acentos.',
  })

  constructor(private readonly useCase: EnrollmentExportUseCase) {}

  async handle(context: HttpContext) {
    const payload = await AdministratorEnrollmentPaginationValidator.validate(context.request.qs())
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value

    return context.response
      .header('content-type', 'text/csv; charset=utf-8')
      .header('content-disposition', 'attachment; filename="matriculas.csv"')
      .send(result.value)
  }
}
