import string from '@adonisjs/core/helpers/string'

/**
 * O teto da coluna `slug`.
 */
const MAX_LENGTH = 140

/**
 * Corta sem deixar hífen pendurado: `slice` cai no meio de uma palavra tanto
 * quanto no meio de um separador, e `robotica-` não é slug.
 */
function cut(slug: string, max: number): string {
  if (slug.length <= max) return slug

  return slug.slice(0, max).replace(/-+$/, '')
}

/**
 * Os identificadores de URL do sistema.
 *
 * Só existe a política de "repetido é conflito": o único slug do projeto é o do
 * curso, e ele é digitado no painel. Onde a pessoa escolhe o endereço, duplicata
 * é erro a mostrar, não coisa a resolver sozinho com um sufixo numérico - dois
 * cursos não se chamam a mesma coisa por acaso, como duas padarias "Central" se
 * chamam.
 */
export default class SlugService {
  /**
   * A normalização única do projeto. O slug enviado num payload passa por aqui
   * também: aceitar o valor cru deixaria a URL pública quebrada.
   *
   * `strict` descarta o que não é letra, dígito ou separador. Sem ele o
   * `string.slug` preserva pontuação - "Robótica!!" viraria `robotica!!`, com a
   * exclamação indo parar na URL.
   *
   * O corte não é zelo: `string.slug` **traduz** caracteres em vez de
   * descartá-los (`%` vira `percent`, `&` vira `and`), então um nome longo gera
   * um slug muito maior e estoura a coluna. Limitar o campo de origem no
   * validator não fecha esse caminho, porque a razão do estouro é a expansão e
   * não o tamanho do que foi digitado.
   */
  normalize(value: string): string {
    return cut(string.slug(value, { lower: true, trim: true, strict: true }), MAX_LENGTH)
  }
}
