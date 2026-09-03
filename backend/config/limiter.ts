import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'
import type { InferLimiters } from '@adonisjs/limiter/types'

/**
 * O limitador de tentativas.
 *
 * Nenhum dos projetos irmãos tem, e aqui ele faz falta por uma razão que só este
 * contrato tem: `POST /storefront/enrollments` e o upload por protocolo são
 * **escrita anônima**, e a segunda entrega URL assinada de bucket. Sem teto, um
 * laço de shell enche o banco de matrículas e o bucket de arquivos.
 *
 * O `sign-in` e o `invite` entram pelo motivo clássico: são as duas portas onde
 * tentar muitas vezes é o ataque.
 *
 * `database` e não `redis` como padrão: o Postgres é obrigatório neste projeto e
 * o Redis é opcional (`REDIS_URL`), e um limitador que só existe quando a fila
 * existe seria um teto que some justamente no ambiente mais simples. Onde há
 * Redis ele é usado, porque contar tentativa é escrita quente e não vale ocupar
 * a conexão do banco com isso.
 */
const store = env.get('REDIS_URL') ? 'redis' : 'database'

const limiterConfig = defineConfig({
  default: store,

  stores: {
    database: stores.database({
      tableName: 'rate_limits',
      // A linha do contador não é dado do domínio: deixá-la para trás encheria
      // a tabela de chaves que já expiraram.
      clearExpiredByTimeout: true,
    }),

    redis: stores.redis({}),
  },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
  export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
