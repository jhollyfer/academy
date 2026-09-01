import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { defineDocs } from '#core/openapi/types'
import StorefrontCourseShowUseCase from './show.use-case.ts'
import { SlugValidator } from '#core/validator'

@inject()
export default class StorefrontCourseShowController {
  static docs = defineDocs({
    description:
      'O curso pelo `slug`, que é o identificador público - o `id` é interno e não aparece na ' +
      'URL da landing.\n\n' +
      'Vem com a grade, o FAQ e a **próxima turma**, com as vagas restantes calculadas. Turma ' +
      'lotada continua aparecendo: a fila de espera existe para ela, e esconder a turma cheia ' +
      'faria o candidato achar que o curso acabou.',
  })

  constructor(private readonly useCase: StorefrontCourseShowUseCase) {}

  async handle(context: HttpContext) {
    const payload = await SlugValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.ok(result.value)
  }
}
