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
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
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

/**
 * Autenticação da secretaria.
 *
 * `sign-in` é público - é a porta. `sign-out` exige sessão, porque apagar o
 * token da sessão atual pressupõe saber qual é.
 */
router
  .group(() => {
    router.post('sign-in', [controllers.authentication.SignIn]).as('sign-in')
    router
      .post('sign-out', [controllers.authentication.SignOut])
      .as('sign-out')
      .use(middleware.auth())
  })
  .prefix('authentication')
  .as('authentication')

/**
 * Módulo do painel: dono e administrador da secretaria. O papel é exigido no
 * grupo, não no endpoint - rota nova nasce protegida por estar aqui dentro.
 *
 * A ordem `auth` → `role` é o que faz uma requisição sem sessão receber `401` e
 * não `403`: sem sessão o papel do requisitante ainda é desconhecido.
 */
router
  .group(() => {
    router
      .group(() => {
        router.get('/', [controllers.administrator.courses.Paginate])
        router.post('/', [controllers.administrator.courses.Create])
        router.get(':id', [controllers.administrator.courses.Show])
        router.put(':id', [controllers.administrator.courses.Update])
      })
      .prefix('courses')
      .as('courses')

    // O ciclo de vida do registro é privilégio do dono. As três operações são
    // distintas de propósito: `archive` manda para a lixeira (grava
    // `deletedAt`), `unarchive` traz de volta, e só o `DELETE` apaga a linha -
    // recusando o que ainda não passou pela lixeira.
    //
    // E a permissão segue essa distinção: o administrador **gerencia a
    // lixeira** - arquiva e restaura - e só o dono apaga de vez. Por isso o
    // `role(['OWNER'])` está em cada `DELETE`, e não no grupo: aqui a matriz
    // difere por verbo, e um guard de grupo diria que o administrador não pode
    // arquivar, que é o oposto do desenho.
    //
    // Um subgrupo por recurso porque o Adonis deriva o nome da rota do verbo:
    // com três operações para vários recursos num grupo plano, os nomes
    // colidiriam. O `prefix` dá o caminho, o `as` dá o nome.
    router
      .group(() => {
        router
          .group(() => {
            router.patch(':id/archive', [controllers.administrator.courses.Archive]).as('archive')
            router
              .patch(':id/unarchive', [controllers.administrator.courses.Unarchive])
              .as('unarchive')
            router
              .delete(':id', [controllers.administrator.courses.Delete])
              .as('purge')
              .use(middleware.role(['OWNER']))
          })
          .prefix('courses')
          .as('courses')
      })
      .as('lifecycle')
  })
  .prefix('administrator')
  .as('administrator')
  .use(middleware.auth())
  .use(middleware.role(['OWNER', 'ADMINISTRATOR']))
