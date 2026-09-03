import User from '#models/user'
import { ActiveStatuses } from '#core/entity'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { COOKIE_TOKEN } from '#services/cookie.service'
import { inject } from '@adonisjs/core'
import { Secret } from '@adonisjs/core/helpers'
import logger from '@adonisjs/core/services/logger'
import type { AccessToken } from '@adonisjs/auth/access_tokens'

type Payload = {
  refreshToken?: string
}

type Response = Either<HTTPException, User>

@inject()
export default class AuthenticationRefreshUseCase {
  async execute({ refreshToken }: Payload): Promise<Response> {
    // Cookie ausente e cookie com assinatura quebrada chegam aqui do mesmo
    // jeito: `request.cookie()` devolve `undefined` nos dois casos.
    if (!refreshToken) {
      return left(HTTPException.Unauthorized('Sessão expirada', 'REFRESH_TOKEN_MISSING'))
    }

    let token: AccessToken | null = null

    // `verify` devolve `null` para token vencido ou inexistente, mas *lança*
    // para token indecodificável. Os dois são a mesma coisa para quem chama -
    // sessão inválida, e não erro de servidor.
    try {
      token = await User.accessTokens.verify(new Secret(refreshToken))
    } catch (error) {
      logger.debug({ err: error }, '[authentication > refresh] token de refresh ilegível')
    }

    // A checagem de `name` é a irmã da que o guard faz em sentido contrário:
    // sem ela, o cookie de *acesso* renovaria a sessão, e o par deixaria de ter
    // dois papéis distintos.
    if (!token || token.name !== COOKIE_TOKEN.REFRESH) {
      return left(HTTPException.Unauthorized('Sessão expirada', 'REFRESH_TOKEN_INVALID'))
    }

    try {
      // A mesma query do guard, e não `User.find`: renovar sem o filtro
      // prorrogaria por escrito uma sessão que a escola já encerrou.
      const user = await User.query()
        .where('id', String(token.tokenableId))
        .whereNull('deletedAt')
        .where('status', ActiveStatuses.ACTIVE)
        .first()

      if (!user) {
        return left(HTTPException.Unauthorized('Sessão expirada', 'REFRESH_TOKEN_INVALID'))
      }

      // O `DELETE` é a seção crítica, e por isso vem antes de emitir: só quem
      // apagou a linha ganha o direito ao par novo. Sem contar as linhas
      // apagadas, duas renovações simultâneas emitiriam dois pares válidos a
      // partir do mesmo token - rotação que não rotaciona.
      const deleted = await User.accessTokens.delete(user, token.identifier)

      if (deleted === 0) {
        return left(HTTPException.Unauthorized('Sessão expirada', 'REFRESH_TOKEN_INVALID'))
      }

      return right(user)
    } catch (error) {
      logger.error({ err: error }, '[authentication > refresh][error]')

      return left(HTTPException.InternalServerError('Erro interno do servidor', 'REFRESH_ERROR'))
    }
  }
}
