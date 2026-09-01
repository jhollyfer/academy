/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'
import { scalarPage } from '#core/openapi/scalar'
import openapi from '#config/openapi'

router.get('/', function (context) {
  return context.response.redirect('/documentation')
})

/**
 * Sonda de saúde do container.
 *
 * Responde apenas "o processo está de pé e aceitando requisição", que é o que o
 * orquestrador precisa para decidir se manda tráfego. Não é o
 * `@adonisjs/core/health` de propósito: o `/health/ready` dele reporta uso de
 * disco, memória e contagem de conexões, e a própria documentação avisa que essa
 * resposta descreve a infraestrutura e precisa de header secreto. Uma sonda que
 * exige segredo para ser usada é uma sonda a menos.
 */
router.get('/health', function (context) {
  return context.response.ok({ status: 'ok' })
})

/**
 * Documentação da API.
 *
 * Ambas as rotas ficam fora de qualquer grupo autenticado, e ambas estão em
 * `openapi.ignore` - o documento não se documenta.
 *
 * O JSON é lido do disco na primeira requisição e mantido em memória: é um
 * artefato gerado por `node ace openapi:generate` e commitado, então em produção
 * ele não muda enquanto o processo vive. Ler por requisição só gastaria I/O.
 */
let specification: string | undefined

router.get('/openapi.json', async function (context) {
  if (!specification) {
    specification = await readFile(app.makePath('openapi.json'), 'utf-8')
  }

  return context.response.header('content-type', 'application/json').send(specification)
})

router.get('/documentation', function (context) {
  return context.response
    .header('content-type', 'text/html')
    .send(scalarPage('/openapi.json', openapi.info.title))
})
