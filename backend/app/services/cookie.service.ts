import app from '@adonisjs/core/services/app'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export const COOKIE_TOKEN = {
  DRIVER_NAME: 'cookie-access-tokens',
  ACCESS: 'access-token',
  REFRESH: 'refresh-token',
  ACCESS_EXPIRY: '1d',
  REFRESH_EXPIRY: '7d',
} as const

export default class CookieService {
  private get(maxAge: string) {
    let sameSite: 'lax' | 'none' = 'lax' as const

    if (app.inProduction) sameSite = 'none' as const

    return {
      httpOnly: true,
      secure: app.inProduction,
      sameSite,
      path: '/',
      maxAge,
    }
  }

  set(context: HttpContext, tokens: { accessToken: string; refreshToken: string }) {
    context.response
      .cookie(COOKIE_TOKEN.ACCESS, tokens.accessToken, this.get(COOKIE_TOKEN.ACCESS_EXPIRY))
      .cookie(COOKIE_TOKEN.REFRESH, tokens.refreshToken, this.get(COOKIE_TOKEN.REFRESH_EXPIRY))
  }

  clear(context: HttpContext) {
    context.response.clearCookie(COOKIE_TOKEN.ACCESS).clearCookie(COOKIE_TOKEN.REFRESH)
  }
}

/**
 * O par de tokens da sessão, emitido para o usuário.
 *
 * Função e não método de `CookieService`: emitir token toca o banco, escrever
 * cookie toca a resposta HTTP, e são duas razões diferentes para este arquivo
 * mudar. Ficam no mesmo módulo porque o `COOKIE_TOKEN` acima é quem nomeia e
 * datas os dois tokens, e porque os três chamadores pedem sempre o par
 * seguido do `set()`.
 *
 * `release()` só existe na criação: o valor em claro do token não volta do
 * banco depois, e é por isso que ele sobe até o controller em vez de o cookie
 * ser escrito aqui dentro.
 */
export async function issueSessionTokens(user: User) {
  const accessToken = await User.accessTokens.create(user, [], {
    name: COOKIE_TOKEN.ACCESS,
    expiresIn: COOKIE_TOKEN.ACCESS_EXPIRY,
  })

  const refreshToken = await User.accessTokens.create(user, [], {
    name: COOKIE_TOKEN.REFRESH,
    expiresIn: COOKIE_TOKEN.REFRESH_EXPIRY,
  })

  return {
    accessToken: accessToken.value!.release(),
    refreshToken: refreshToken.value!.release(),
  }
}
