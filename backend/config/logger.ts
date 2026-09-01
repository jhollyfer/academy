import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, syncDestination, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  /**
   * Default logger name used by ctx.logger and app logger calls.
   */
  default: 'app',

  loggers: {
    app: {
      /**
       * Toggle this logger on/off.
       */
      enabled: true,

      /**
       * O nome que aparece em cada registro de log.
       *
       * Literal, e não `env.get('APP_NAME')` como vinha do esqueleto do Adonis:
       * `APP_NAME` nunca foi declarada em `start/env.ts` nem existe em nenhum
       * `.env`, então todo registro saía com `name: undefined`. É o nome da
       * aplicação, e ele não muda de ambiente para ambiente - variável de
       * ambiente para um valor fixo é configuração que ninguém escolhe.
       */
      name: 'simple-hub',

      /**
       * Minimum level to output (trace, debug, info, warn, error, fatal).
       */
      level: env.get('LOG_LEVEL'),

      /**
       * Use sync destination in non-production for immediate flush.
       */
      destination: !app.inProduction ? await syncDestination() : undefined,

      /**
       * Configure where logs are written.
       */
      transport: {
        targets: [targets.file({ destination: 1 })],
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {}
}
