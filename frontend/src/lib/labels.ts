/**
 * As iniciais de um nome, para o `AvatarFallback` de quem não tem foto.
 *
 * Primeira e última, e não as duas primeiras: "Maria Aparecida Souza" é MS, que
 * é como a pessoa assina, e não MA.
 */
export function initials(name: string | undefined | null): string {
  if (!name?.trim()) return ''

  const parts = name.trim().split(/\s+/)
  const first = parts.at(0)?.at(0) ?? ''

  let last = ''
  if (parts.length > 1) last = parts.at(-1)?.at(0) ?? ''

  return first.concat(last).toUpperCase()
}
