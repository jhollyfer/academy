import env from '#start/env'
import { defineConfig } from '@adonisjs/redis'
import { type InferConnections } from '@adonisjs/redis/types'

/**
 * Quebra `redis://[:senha@]host:porta[/db]` no que o pacote pede.
 *
 * O ambiente carrega **uma** variável, que é como todo provedor entrega a
 * credencial e o que o compose sobrescreve. O `RedisConnectionConfig` do
 * AdonisJS estende as opções do ioredis e não aceita `url`, então a tradução
 * mora aqui - num lugar só, em vez de quatro variáveis que podem divergir entre
 * si.
 *
 * Sem a variável, devolve o alvo local. A conexão declarada precisa existir para
 * o container resolver o serviço; quem decide se ela chega a ser usada é o
 * `config/queue.ts`, que sem `REDIS_URL` nem escolhe o adaptador `redis`.
 */
function parseRedisUrl(value?: string) {
  const url = value ? new URL(value) : null

  return {
    host: url?.hostname ?? '127.0.0.1',
    port: url?.port ? Number(url.port) : 6379,
    password: url?.password ? decodeURIComponent(url.password) : '',
    // O caminho da URL é o número do banco: `redis://host:6379/2` é o db 2.
    db: url?.pathname && url.pathname.length > 1 ? Number(url.pathname.slice(1)) : 0,
    keyPrefix: '',
    retryStrategy(times: number) {
      return times > 10 ? null : times * 50
    },
  }
}

const redisConfig = defineConfig({
  connection: 'main',

  connections: {
    /*
    |--------------------------------------------------------------------------
    | The default connection
    |--------------------------------------------------------------------------
    |
    | The main connection you want to use to execute redis commands. The same
    | connection will be used by the session provider, if you rely on the
    | redis driver.
    |
    */
    main: parseRedisUrl(env.get('REDIS_URL')),
  },
})

export default redisConfig

declare module '@adonisjs/redis/types' {
  export interface RedisConnections extends InferConnections<typeof redisConfig> {}
}
