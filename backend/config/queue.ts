import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/queue'

/**
 * O adaptador escolhido.
 *
 * `QUEUE_DRIVER` vence quando presente; sem ele, a presença de `REDIS_URL`
 * decide. Só `redis` sobrevive a um restart, que é o motivo de a fila existir -
 * mas exigi-lo transformaria Redis fora do ar em site fora do ar.
 */
const driver = env.get('QUEUE_DRIVER', env.get('REDIS_URL') ? 'redis' : 'sync')

export default defineConfig({
  default: driver,

  /**
   * O adaptador `redis` só é **declarado** quando é o escolhido.
   *
   * Declarar sempre não é inócuo: o pacote instancia cada adaptador da lista, e
   * o do Redis abre conexão no boot. Sem servidor de pé isso enche o log de
   * `ECONNREFUSED` e derruba toda rota que enfileira algo - inclusive na suíte,
   * que não tem nem deve ter um Redis rodando.
   */
  adapters: {
    ...(driver === 'redis' ? { redis: drivers.redis({ connectionName: 'main' }) } : {}),
    sync: drivers.sync(),
  },

  worker: {
    concurrency: 5,
    idleDelay: '2s',
  },

  locations: ['./app/jobs/**/*.{ts,js}'],
})
