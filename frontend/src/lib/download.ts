/**
 * Salvar no disco um arquivo que veio pelo cliente HTTP.
 *
 * Existe porque a exportação deixou de ser um `<a href>` para a API: âncora não
 * passa pelo `request`/`download` de `integrations/tanstack-query/http.ts`,
 * logo não renova a sessão, e com o access token vencido o navegador salvava o
 * JSON do erro com nome de planilha. Agora o blob chega pela mesma porta de todo
 * o resto, e o disparo do salvamento é este arquivo.
 *
 * Sem React, como todo `lib/`: o que está aqui é DOM e string.
 */

/**
 * O nome do arquivo declarado no `Content-Disposition`, ou `undefined`.
 *
 * Duas formas no mesmo header, e a ordem importa: `filename*` (RFC 5987, com a
 * codificação declarada) vence o `filename` simples quando os dois aparecem,
 * porque é ele que carrega acento sem depender do palpite de quem lê.
 *
 * `undefined` e não um nome padrão: o fallback é decisão de quem baixa - a tela
 * sabe o que está exportando, este módulo não.
 */
export function filenameFromContentDisposition(
  header: string | null | undefined,
): string | undefined {
  if (!header) return undefined

  const extended = /filename\*=(?:UTF-8|utf-8)''([^;]+)/.exec(header)

  if (extended) {
    try {
      return decodeURIComponent(extended[1].trim())
    } catch {
      // Percent-encoding quebrado. Cai para o `filename` simples abaixo, que é
      // o que o próprio header costuma trazer junto justamente para isto.
    }
  }

  const plain = /filename="?([^";]+)"?/.exec(header)

  if (!plain) return undefined

  return plain[1].trim() || undefined
}

/**
 * Entrega o blob ao navegador com o nome pedido.
 *
 * O `<a>` nasce e morre aqui, fora do documento: anexar ao `body` só para
 * clicar deixaria um nó órfão se algo estourasse no meio.
 *
 * A revogação é adiada de propósito. `revokeObjectURL` logo depois do `click()`
 * corre com o início do download, e no Safari o arquivo chega vazio ou nem
 * chega. Um turno de macrotarefa é o bastante para o navegador já ter lido a
 * URL, e segurá-la por isso não vaza nada.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()

  setTimeout(() => URL.revokeObjectURL(url), 0)
}
