import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */

/**
 * A allowlist vem de `CORS_ORIGIN`, separada por vírgula.
 *
 * Ela precisa ser explícita: com `credentials: true` abaixo, o protocolo recusa
 * `*` - o navegador não envia cookie para uma origem curinga. Então ou a origem
 * do frontend está listada, ou não existe sessão entre os dois.
 */
function allowlist() {
  const configured = env.get('CORS_ORIGIN') ?? ''

  return configured
    .split(',')
    .map(function (origin) {
      return origin.trim()
    })
    .filter(Boolean)
}

/**
 * Em desenvolvimento libera qualquer origem, para não exigir configuração de
 * quem só quer subir front e back na própria máquina.
 */
let origin: boolean | string[] = allowlist()
if (app.inDev) origin = true

const corsConfig = defineConfig({
  /**
   * Enable or disable CORS handling globally.
   */
  enabled: true,

  origin,

  /**
   * HTTP methods accepted for cross-origin requests.
   */
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Reflect request headers by default. Use a string array to restrict
   * allowed headers.
   */
  headers: true,

  /**
   * Response headers exposed to the browser.
   */
  exposeHeaders: [],

  /**
   * Allow cookies/authorization headers on cross-origin requests.
   */
  credentials: true,

  /**
   * Cache CORS preflight response for N seconds.
   */
  maxAge: 90,
})

export default corsConfig
