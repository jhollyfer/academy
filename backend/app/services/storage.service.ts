import Storage from '#models/storage'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'
import drive from '@adonisjs/drive/services/main'
import { left, right, type Either } from '#core/either'
import HTTPException from '#exceptions/http.exception'
import { STORAGE_EXTENSIONS, type StorageMimetype } from '#core/validator'
import { UploadStatuses } from '#core/entity'

/**
 * Tudo que envolve arquivo: gravar o binário, derivar a `url` na leitura e
 * recusar id inexistente antes de escrever.
 *
 * É um serviço injetado, e não um punhado de funções exportadas, porque quem
 * anexa está espalhado - avatar em `account`, capa em `administrator/courses`,
 * comprovante em `storefront/enrollments`. Injetar deixa cada use-case declarar
 * a dependência que tem, e um teste substituir o destino de arquivo sem tocar em
 * disco.
 */
/**
 * A contagem de uma das dez consultas de `references`.
 *
 * As duas primeiras vêm do Lucid e trazem o total em `$extras`; as outras oito
 * vêm do query builder e o trazem na própria linha. A leitura estreita o valor
 * em vez de afirmar a forma: uma consulta que voltasse vazia daria `undefined`,
 * e uma asserção diria que ela é um objeto com `total`.
 */
function totalIn(row: unknown): number {
  if (!row || typeof row !== 'object') return 0

  if ('$extras' in row && row.$extras && typeof row.$extras === 'object' && 'total' in row.$extras)
    return Number(row.$extras.total)

  if ('total' in row) return Number(row.total)

  return 0
}

export default class StorageService {
  /**
   * A chave sob a qual o objeto vai viver no bucket.
   *
   * Um uuid mais a extensão do tipo declarado (RN-48). O nome que o usuário
   * enviou fica só em `originalName`, como rótulo, e **nunca** vira caminho:
   * ele é texto de terceiro, e caminho montado com texto de terceiro é como se
   * escreve por cima do arquivo alheio.
   *
   * A extensão sai do `mimetype` e não do nome enviado porque o nome não é
   * fonte confiável - `foto.png` pode ser um pdf. O `mimetype` é o mesmo valor
   * com que a URL é assinada, então o que o bucket aceita e o que a chave diz
   * não têm como divergir.
   */
  key(mimetype: StorageMimetype): string {
    return `${randomUUID()}.${STORAGE_EXTENSIONS[mimetype]}`
  }

  /**
   * O que o bucket sabe sobre o objeto: tamanho, tipo, `ETag`.
   *
   * É com isto que a confirmação do upload confere o que **de fato** subiu
   * contra o que o cliente declarou ao pedir as URLs.
   */
  async metadata(storage: Storage) {
    return drive.use().getMetaData(storage.path)
  }

  /** Apaga só o binário, deixando a linha. Usado quando a confirmação recusa. */
  async discard(storage: Storage): Promise<void> {
    await drive.use().delete(storage.path)
  }

  /**
   * Onde um arquivo está sendo usado, em rótulos legíveis ("avatar de usuário",
   * "galeria de produto"). Vazio quer dizer órfão, e órfão é o único que o
   * `DELETE /storages/:id` apaga (RF-60).
   *
   * A checagem existe porque `storages` é registro **neutro e compartilhado**:
   * o arquivo não pertence ao formulário que o enviou. Sem ela, quem conhecesse
   * um uuid furaria a imagem de um produto alheio com uma requisição.
   *
   * `users.avatar_id` e `courses.cover_id` são `SET NULL`, então **o banco não
   * impediria nada** neles: apagar a linha esvaziaria o avatar ou a capa sem um
   * erro no caminho. Quem impede é isto aqui, e é por isso que a lista tem de
   * cobrir toda coluna que aponta para cá - uma que falte é um arquivo em uso
   * que some sem aviso.
   *
   * `enrollment_files.storage_id` é `RESTRICT` e o banco recusaria sozinho, mas
   * entra na lista mesmo assim: um 409 dizendo "anexo de matrícula" é resposta,
   * e um erro de constraint virando 500 não é.
   */
  async references(storageId: string): Promise<string[]> {
    const counts = await Promise.all([
      User.query().where('avatarId', storageId).count('* as total'),
      db.from('courses').where('cover_id', storageId).count('* as total'),
      db.from('enrollment_files').where('storage_id', storageId).count('* as total'),
      db.from('partners').where('logo_id', storageId).count('* as total'),
      db.from('photos').where('image_id', storageId).count('* as total'),
    ])

    const labels = ['avatar de usuário', 'capa de curso', 'anexo de matrícula', 'logo de parceiro']

    const found: string[] = []

    for (const [index, rows] of counts.entries()) {
      if (totalIn(rows[0]) > 0) found.push(labels[index])
    }

    return found
  }

  /**
   * Uma URL temporária que entrega o arquivo com o nome original.
   *
   * O `Content-Disposition` viaja assinado dentro da própria URL, e é o bucket
   * que o devolve no download - por isso o binário não precisa atravessar esta
   * aplicação só para ganhar um header. Antes atravessava, e cada download
   * ocupava a aplicação pelo tempo da transferência.
   *
   * Expira em minutos porque é endereço de uma ação, não de um recurso: quem
   * quiser o arquivo de novo pede outra.
   */
  async signedDownload(storage: Storage): Promise<string> {
    return drive.use().getSignedUrl(storage.path, {
      expiresIn: '5 minutes',
      contentType: storage.mimetype,
      contentDisposition: this.contentDisposition(storage.originalName),
    })
  }

  /**
   * O header `Content-Disposition` de um download, com o nome original.
   *
   * Dois nomes no mesmo header porque a RFC 6266 pede os dois: `filename=` só
   * carrega ASCII e é o que navegador antigo lê, e `filename*=UTF-8''` é o que
   * preserva acento e cedilha. Mandar só o segundo faz o arquivo chegar com o
   * nome errado em quem não o entende; mandar só o primeiro perde o acento em
   * todo mundo.
   *
   * O fallback ASCII decompõe o acento e joga fora o diacrítico (`ó` → `o`), em
   * vez de passar pelo `SlugService`: slug trocaria o ponto da extensão por
   * hífen, e `relatorio-2026-pdf` não abre em programa nenhum. Aspas e barra
   * viram `_` porque escapariam do valor entre aspas do header.
   */
  contentDisposition(originalName: string): string {
    const ascii = originalName
      .normalize('NFD')
      // Os diacríticos que o NFD separou da letra base.
      .replace(/[\u0300-\u036f]/g, '')
      // O que sobrou fora do ASCII imprimível, mais aspas e barra, que
      // escapariam do valor entre aspas do header.
      .replace(/["\\]|[^\u0020-\u007e]/g, '_')

    return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(originalName)}`
  }

  /**
   * Apaga o binário e depois o registro, nesta ordem.
   *
   * Binário órfão é lixo em disco; registro órfão é `url` quebrada na tela. Se o
   * `delete` do disco falhar, a linha fica - e o arquivo continua servível - em
   * vez de o inverso.
   *
   * `delete()` de verdade, e não `deletedAt`: `storages` não tem lixeira, e um
   * arquivo "removido" que continua ocupando o bucket não remove nada.
   */
  async remove(storage: Storage): Promise<void> {
    await drive.use().delete(storage.path)

    await storage.delete()
  }

  /**
   * A `url` de um arquivo, derivada de `path` na leitura (RF-63). Nunca é
   * coluna: trocar de bucket não pode exigir migration de dado (RNF-22).
   */
  async url(storage: Storage): Promise<string> {
    return drive.use().getUrl(storage.path)
  }

  /**
   * Existência dos arquivos informados num payload, antes de qualquer escrita.
   *
   * Deduplica preservando a ordem - a posição na galeria é o índice do array
   * (RF-62), então reordenar aqui trocaria a capa do produto. Id inexistente,
   * removido ou ainda `PENDING` é `422` apontando o campo (RN-39), nunca `404`
   * nem `500`: quem mandou o id errado foi o payload.
   *
   * `PENDING` conta como inexistente de propósito. Desde que o binário sobe
   * direto para o bucket, a linha nasce antes do arquivo estar íntegro -
   * anexá-la publicaria um produto cuja imagem ainda está a meio caminho, e a
   * galeria mostraria um 404.
   */
  async assertExist(field: string, storageIds: string[]): Promise<Either<HTTPException, string[]>> {
    const ids = [...new Set(storageIds)]

    if (ids.length === 0) return right(ids)

    const storages = await Storage.query()
      .whereIn('id', ids)
      .where('status', UploadStatuses.UPLOADED)
      .whereNull('deletedAt')

    // A contagem só bate quando todos os ids deduplicados casam com um arquivo
    // vivo. Mesma checagem de `CatalogService.assertCoherentSubcategories`.
    if (storages.length !== ids.length)
      return left(
        HTTPException.UnprocessableEntity('Arquivo não encontrado', 'STORAGE_NOT_FOUND', {
          [field]: 'Arquivo não encontrado',
        })
      )

    return right(ids)
  }

  /**
   * A galeria no formato que o `sync()` do Lucid espera: id do arquivo para os
   * atributos do pivô.
   *
   * A posição é o índice no array recebido (RF-62) - a ordem do payload **é** a
   * ordem da galeria, e o primeiro é a capa. Por isso `assertExist` deduplica
   * preservando a ordem.
   */
  gallery(storageIds: string[]): Record<string, { position: number }> {
    return Object.fromEntries(
      storageIds.map(function (id, position) {
        return [id, { position }]
      })
    )
  }
}
