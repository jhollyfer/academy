import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { resolveInvite } from '#features/_shared.invite'
import { inject } from '@adonisjs/core'
import logger from '@adonisjs/core/services/logger'
import type { AuthenticationInviteShowPayload } from '#core/validator'

type Payload = AuthenticationInviteShowPayload
type Response = Either<HTTPException, null>

/**
 * Conferir um convite antes de desenhar o formulário.
 *
 * Existe para que um link expirado não vire senha digitada à toa: sem esta
 * checagem, a pessoa só descobriria o problema depois de escolher a senha e
 * apertar o botão. O `POST` refaz a mesma pergunta - esta é conveniência de
 * tela, não é a guarda.
 *
 * Não devolve o convite nem o usuário. Quem tem o token conseguiria o e-mail da
 * conta a partir daqui, e o endpoint é público: o que ele responde é apenas se
 * dá para seguir.
 */
@inject()
export default class AuthenticationInviteShowUseCase {
  async execute({ token }: Payload): Promise<Response> {
    try {
      const invite = await resolveInvite(token)

      if (invite.isLeft()) return left(invite.value)

      return right(null)
    } catch (error) {
      logger.error({ err: error }, '[authentication > invite-show][error]')

      return left(
        HTTPException.InternalServerError('Erro interno do servidor', 'INVITE_SHOW_ERROR')
      )
    }
  }
}
