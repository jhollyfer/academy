import { Secret } from '@adonisjs/core/helpers'
import { errors, symbols } from '@adonisjs/auth'
import type { HttpContext } from '@adonisjs/core/http'
import type { AccessToken } from '@adonisjs/auth/access_tokens'
import type { AuthClientResponse, GuardContract } from '@adonisjs/auth/types'

import User from '#models/user'
import { COOKIE_TOKEN, issueSessionTokens } from '#services/cookie.service'
import { ActiveStatuses } from '#core/entity'

/**
 * O usuário já autenticado, onde `currentAccessToken` deixou de ser opcional.
 *
 * Interseção, e não `Merge`: `User` é uma classe do Lucid, e mapear as chaves
 * dela achataria os métodos e o tipo nominal que `GuardContract` espera.
 */
type GuardUser = User & { currentAccessToken: AccessToken }

/**
 * Reuses Adonis's native opaque access-token machinery (hashing,
 * expiry, DB persistence via DbAccessTokensProvider) but reads the
 * token from a cookie instead of the Authorization header. No
 * bearer-header fallback.
 */
export class CookieAccessTokensGuard implements GuardContract<GuardUser> {
  readonly driverName = COOKIE_TOKEN.DRIVER_NAME
  authenticationAttempted = false
  isAuthenticated = false
  user?: GuardUser;

  declare [symbols.GUARD_KNOWN_EVENTS]: {}

  constructor(private context: HttpContext) {}

  #authenticationFailed() {
    return new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
      guardDriverName: this.driverName,
    })
  }

  #getCookieToken(): string {
    const token = this.context.request.cookie(COOKIE_TOKEN.ACCESS)

    if (!token) throw this.#authenticationFailed()

    return token
  }

  getUserOrFail(): GuardUser {
    if (!this.user) throw this.#authenticationFailed()

    return this.user
  }

  async authenticate(): Promise<GuardUser> {
    if (this.authenticationAttempted) return this.getUserOrFail()

    this.authenticationAttempted = true

    const secret = new Secret(this.#getCookieToken())

    const accessToken = await User.accessTokens.verify(secret)

    if (!accessToken || accessToken.name !== COOKIE_TOKEN.ACCESS) throw this.#authenticationFailed()

    // Conta removida ou desativada não autentica, mesmo com token válido.
    //
    // O filtro estava só no sign-in, e o token vive um dia: desativar alguém não
    // o expulsava, apenas o impedia de entrar de novo. Com dono e secretaria isso
    // passava, porque desativação era rara e combinada. Com aluno e responsável
    // deixa de passar - é o caminho normal de encerrar um vínculo, e precisa ter
    // efeito imediato.
    const user = await User.query()
      // `tokenableId` é tipado como `string | number | BigInt` pelo pacote de
      // auth, e o query builder não aceita `BigInt`. Aqui a chave é sempre uuid.
      .where('id', String(accessToken.tokenableId))
      .whereNull('deletedAt')
      .where('status', ActiveStatuses.ACTIVE)
      .first()

    if (!user) throw this.#authenticationFailed()

    // `Object.assign` em vez de `as GuardUser`: ele devolve
    // `User & { currentAccessToken: AccessToken }` porque o campo foi de fato
    // atribuído, e não porque alguém afirmou ao compilador que estava lá.
    this.user = Object.assign(user, { currentAccessToken: accessToken })
    this.isAuthenticated = true
    return this.user
  }

  async check(): Promise<boolean> {
    try {
      await this.authenticate()
      return true
    } catch {
      return false
    }
  }

  async authenticateAsClient(user: User): Promise<AuthClientResponse> {
    const tokens = await issueSessionTokens(user)
    return {
      cookies: {
        [COOKIE_TOKEN.ACCESS]: tokens.accessToken,
        [COOKIE_TOKEN.REFRESH]: tokens.refreshToken,
      },
    }
  }
}

export function cookieAccessTokensGuard() {
  return (context: HttpContext) => new CookieAccessTokensGuard(context)
}
