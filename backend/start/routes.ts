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
import { STAFF_USER_ROLES } from '#core/entity'

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
 *
 * O par `invite` também é público, e tem de ser: quem chega por ele ainda não
 * tem senha, e é justamente isso que veio resolver. O que faz o papel da sessão
 * ali é o token do link - 64 caracteres sorteados, de uso único e com prazo.
 */
router
  .group(() => {
    router.post('sign-in', [controllers.authentication.SignIn]).as('sign-in')
    router
      .post('sign-out', [controllers.authentication.SignOut])
      .as('sign-out')
      .use(middleware.auth())

    router.get('invite/:token', [controllers.authentication.InviteShow]).as('invite.show')
    router.post('invite/:token', [controllers.authentication.InviteAccept]).as('invite.accept')
  })
  .prefix('authentication')
  .as('authentication')

/**
 * O site.
 *
 * Única superfície da API que responde sem sessão, junto do sign-in. A leitura é
 * somente leitura; a escrita é uma só - a matrícula - e nasce sem dono.
 *
 * Sem middleware nenhum nas leituras, e não por esquecimento: é a característica
 * do bloco. O que limita o que sai daqui é a condição de visibilidade
 * (`_shared.storefront.ts`), não a autenticação.
 */
router
  .group(() => {
    router
      .group(() => {
        router.get('/', [controllers.storefront.courses.Paginate])
        // Pelo `slug`, que é o identificador público - o `id` é interno e não
        // aparece na URL da landing.
        router.get(':slug', [controllers.storefront.courses.Show])
      })
      .prefix('courses')
      .as('courses')

    // O FAQ da escola, o que a home mostra. Fora de `courses` de propósito: são
    // as perguntas de `courseId` nulo, que não pertencem a curso nenhum.
    router.get('faqs', [controllers.storefront.faqs.Paginate]).as('faqs')

    router
      .group(() => {
        router.post('/', [controllers.storefront.enrollments.Create])
        router.get(':protocol', [controllers.storefront.enrollments.Show]).as('show')
        router
          .post(':protocol/attachments', [controllers.storefront.enrollments.Attach])
          .as('attach')

        // O upload do comprovante, para quem não tem sessão.
        //
        // São os **mesmos** controllers de `/storages`, montados atrás do
        // middleware que resolve o `:protocol`. O upload presigned multipart é
        // um só: duplicá-lo para o público daria dois caminhos de código para o
        // mesmo problema, com um deles recebendo correção e o outro não.
        router
          .group(() => {
            router.post('/', [controllers.storages.Create])
            router.post(':id/complete', [controllers.storages.Complete]).as('complete')
            router.get(':id/parts', [controllers.storages.Parts]).as('parts')
          })
          .prefix(':protocol/uploads')
          .as('uploads')
          .use(middleware.enrollmentProtocol())
      })
      .prefix('enrollments')
      .as('enrollments')
  })
  .prefix('storefront')
  .as('storefront')

/**
 * Arquivos.
 *
 * O upload tem três passos, e não um, porque o binário não passa por aqui: o
 * `POST` abre e devolve URLs assinadas, o navegador sobe as partes direto no
 * bucket, e o `complete` confirma. O `GET :id/parts` é o quarto caminho, e o
 * mesmo para dois casos - retomar depois de uma queda e buscar o próximo lote de
 * URLs de um arquivo com partes demais.
 *
 * O `DELETE` é o par do `POST` e serve aos dois estados: cancela o upload em
 * andamento e apaga o arquivo pronto. Só alcança arquivo órfão - como o registro
 * é neutro e compartilhado, a posse não serve de autorização, e quem decide é a
 * referência viva.
 *
 * Exige sessão. **Divergência deliberada da referência a partir daqui**: aqui o
 * candidato envia o comprovante do Pix sem ter conta, e não vai ter. Abrir este
 * grupo resolveria - e entregaria o bucket a quem quisesse enchê-lo. Então o
 * storefront ganha o próprio caminho de upload, escopado pelo `protocol` da
 * matrícula, que é um uuid que só quem se inscreveu conhece. É a duplicação por
 * papel que o padrão trata como isolamento, não como descuido.
 */
router
  .group(() => {
    router.post('/', [controllers.storages.Create])
    router.post(':id/complete', [controllers.storages.Complete]).as('complete')
    router.get(':id/parts', [controllers.storages.Parts]).as('parts')
    router.delete(':id', [controllers.storages.Delete])
  })
  .prefix('storages')
  .as('storages')
  .use(middleware.auth())

/**
 * Download com o nome original, **fora** do grupo autenticado acima.
 *
 * O bucket é `visibility: 'public'` e o mesmo binário já sai sem sessão pela
 * `url` derivada. Exigir sessão só aqui trancaria a porta da frente com a dos
 * fundos aberta, e ainda quebraria o `<a>` de "salvar arquivo" quando o cookie
 * não acompanhasse a navegação.
 */
router.get('storages/:id/download', [controllers.storages.Download]).as('storages.download')

/**
 * A própria conta de quem está autenticado.
 *
 * Grupo próprio e não um recurso dentro de `/administrator`: o escopo aqui é a
 * sessão, não o papel. Se amanhã existir outro papel no painel, ele lê o próprio
 * perfil por esta mesma rota, sem duplicá-la.
 */
router
  .group(() => {
    router.get('profile', [controllers.account.Show]).as('profile')
  })
  .prefix('account')
  .as('account')
  .use(middleware.auth())

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

    router
      .group(() => {
        router.get('/', [controllers.administrator.classes.Paginate])
        router.post('/', [controllers.administrator.classes.Create])
        router.get(':id', [controllers.administrator.classes.Show])
        router.put(':id', [controllers.administrator.classes.Update])
      })
      .prefix('classes')
      .as('classes')

    router
      .group(() => {
        router.get('/', [controllers.administrator.enrollments.Paginate])
        // Antes de `:id`: o Adonis casa na ordem de declaração, e `export`
        // cairia no parâmetro de identificador se viesse depois - virando um
        // 422 de uuid inválido.
        router.get('export', [controllers.administrator.enrollments.Export]).as('export')
        router.get(':id', [controllers.administrator.enrollments.Show])
        router.put(':id', [controllers.administrator.enrollments.Update])
      })
      .prefix('enrollments')
      .as('enrollments')

    router
      .group(() => {
        router.get('/', [controllers.administrator.users.Paginate])
        router.post('/', [controllers.administrator.users.Create])
        router.get(':id', [controllers.administrator.users.Show])
        router.put(':id', [controllers.administrator.users.Update])
        // O vínculo de guarda. `:id` é o responsável; o dependente vai no corpo
        // no POST e no parâmetro no DELETE, que não tem corpo.
        router
          .post(':id/dependents', [controllers.administrator.users.AttachDependent])
          .as('dependents.attach')
        router
          .delete(':id/dependents/:studentId', [controllers.administrator.users.DetachDependent])
          .as('dependents.detach')
      })
      .prefix('users')
      .as('users')

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

        router
          .group(() => {
            router.patch(':id/archive', [controllers.administrator.classes.Archive]).as('archive')
            router
              .patch(':id/unarchive', [controllers.administrator.classes.Unarchive])
              .as('unarchive')
            router
              .delete(':id', [controllers.administrator.classes.Delete])
              .as('purge')
              .use(middleware.role(['OWNER']))
          })
          .prefix('classes')
          .as('classes')

        router
          .group(() => {
            router
              .patch(':id/archive', [controllers.administrator.enrollments.Archive])
              .as('archive')
            router
              .patch(':id/unarchive', [controllers.administrator.enrollments.Unarchive])
              .as('unarchive')
            router
              .delete(':id', [controllers.administrator.enrollments.Delete])
              .as('purge')
              .use(middleware.role(['OWNER']))
          })
          .prefix('enrollments')
          .as('enrollments')

        router
          .group(() => {
            router.patch(':id/archive', [controllers.administrator.users.Archive]).as('archive')
            router
              .patch(':id/unarchive', [controllers.administrator.users.Unarchive])
              .as('unarchive')
            router
              .delete(':id', [controllers.administrator.users.Delete])
              .as('purge')
              .use(middleware.role(['OWNER']))
          })
          .prefix('users')
          .as('users')
      })
      .as('lifecycle')
  })
  .prefix('administrator')
  .as('administrator')
  .use(middleware.auth())
  .use(middleware.role(STAFF_USER_ROLES))
