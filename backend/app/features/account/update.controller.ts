import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { defineDocs } from '#core/openapi/types'
import { AccountUpdateValidator } from '#core/validator'
import AccountUpdateUseCase from './update.use-case.ts'

@inject()
export default class AccountUpdateController {
  static docs = defineDocs({
    summary: 'Atualizar a própria conta',
    description:
      'Edita a conta de quem está autenticado. O usuário vem sempre da sessão: não há ' +
      'identificador no caminho, e não teria como haver.\n\n' +
      'Trocar a senha exige a **senha atual**, e não só a sessão. O cookie prova posse do ' +
      'navegador; a senha prova identidade, e sem ela um cookie sequestrado trocaria a senha ' +
      'sem que o dono da conta tivesse dito nada.\n\n' +
      'Trocar e-mail ou senha **derruba todas as sessões**, inclusive a que fez a chamada: um ' +
      'token anterior à troca sobreviveria à mudança que existe para revogá-lo.\n\n' +
      '`role` e `status` não entram: quem muda o próprio papel deixa de ser gerido por quem o ' +
      'concedeu. Para isso existe o painel de usuários.',
  })

  constructor(private readonly useCase: AccountUpdateUseCase) {}

  async handle(context: HttpContext) {
    const payload = await context.request.validateUsing(AccountUpdateValidator)

    const result = await this.useCase.execute({ ...payload, id: context.auth.user!.id })

    if (result.isLeft()) throw result.value

    return context.response.ok(result.value)
  }
}
