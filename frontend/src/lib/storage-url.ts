import { BASE_URL } from '#/integrations/tanstack-query/http'
import type { StorageResponse } from '#/integrations/response'

/**
 * A URL de **ver** o arquivo: a que o backend derivou de `path` (RF-63) e já
 * mandou pronta na resposta.
 *
 * Não é montada aqui de propósito. Trocar o bucket muda o host inteiro, e uma
 * segunda montagem no cliente seria o lugar onde essa troca passaria
 * despercebida.
 */
export function getStorageInlineUrl(storage: { url: string | null }): string {
  return storage.url ?? ''
}

/**
 * A URL de **baixar** o arquivo, com o nome original.
 *
 * Rota própria e não a inline com `download` no `<a>`: o atributo é ignorado
 * entre origens, e a API responde numa origem diferente da do app. Sem ela o
 * clique abriria a imagem numa aba, e o arquivo chegaria nomeado com o uuid.
 */
export function getStorageDownloadUrl(
  storage: Pick<StorageResponse, 'id'>,
): string {
  return BASE_URL.concat('/storages/').concat(storage.id).concat('/download')
}
