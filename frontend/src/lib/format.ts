/**
 * Documento, telefone, dinheiro e data na forma que se lê.
 *
 * O banco guarda só dígitos - `cpf()` e `phone()` tiram a máscara no `parse()`
 * antes de qualquer regra -, e a máscara de digitação só existe enquanto o
 * campo está em foco. Fora do formulário, quem reexibe é isto.
 *
 * Todas devolvem o valor cru quando ele não tem o tamanho esperado, em vez de
 * fatiar o que não deve: dado antigo ou fora do padrão aparece como está, e não
 * disfarçado de documento válido.
 */

/** O hífen que as tabelas usam para "não informado". */
const EMPTY = '-'

export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return EMPTY
  if (cpf.length !== 11) return cpf

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

/**
 * Fixo tem dez dígitos e celular tem onze, e a diferença está no tamanho do
 * segundo grupo - `(97) 3333-4444` contra `(97) 98431-7149`. É a mesma regra que
 * a máscara `phone-br` aplica na digitação.
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return EMPTY
  if (phone.length !== 10 && phone.length !== 11) return phone

  const ddd = phone.slice(0, 2)
  const meio = phone.slice(2, phone.length - 4)
  const fim = phone.slice(-4)

  return `(${ddd}) ${meio}-${fim}`
}

/**
 * Centavos inteiros na forma que se lê.
 *
 * A API guarda dinheiro em centavos porque ponto flutuante não representa
 * R$ 150,10 exatamente. A divisão por 100 acontece **aqui**, na borda de
 * apresentação, e em nenhum outro lugar - fazer conta com o valor dividido é
 * como o centavo volta a se perder.
 */
export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/**
 * Centavos como se digita num campo de dinheiro: `15000` vira `'150,00'`.
 *
 * Sem o `R$`, ao contrário do `formatMoney` acima. O símbolo do campo é um
 * adorno ao lado do input, não texto editável: dentro dele, o cursor teria de
 * desviar do prefixo a cada tecla, e o espaço que o `Intl` põe depois do `R$`
 * não é o espaço comum - é um sem quebra, que quem edita não consegue apagar e
 * quem compara em teste não enxerga.
 */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/**
 * O que foi digitado num campo de dinheiro, de volta a centavos inteiros.
 *
 * **O campo é um acumulador de centavos**, e não um texto livre com vírgula:
 * conta só os dígitos, e a vírgula sai do formato, não da digitação. Teclar
 * `1`,`5`,`0`,`0`,`0` mostra `0,01 → 0,15 → 1,50 → 15,00 → 150,00`, que é como
 * todo aplicativo de banco brasileiro se comporta.
 *
 * Isso é o que dispensa caso especial: colar "R$ 1.500,00" sobra `150000`,
 * apagar um dígito refaz o formato sozinho, e não há o que decidir sobre `1.5`,
 * `1,5` e `1.500` - as três ambiguidades que um campo de texto livre teria de
 * resolver e erraria em pelo menos uma.
 *
 * O teto acompanha o `money()` do validator; sem ele, segurar uma tecla passa
 * do limite e o erro só aparece no envio.
 */
export function parseCents(text: string): number {
  const digits = text.replace(/\D/g, '')

  if (!digits) return 0

  return Math.min(Number(digits), 100_000_000)
}

/**
 * Uma data ISO da API na forma brasileira.
 *
 * `'2026-03-07'` chega como data pura, sem hora. Passá-la por `new Date()` a
 * interpreta como UTC meia-noite, e num fuso a oeste ela retrocede um dia - a
 * turma que começa dia 7 seria anunciada dia 6, e Benjamin Constant é UTC-5.
 * Por isso a data é fatiada como texto, e não convertida.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return EMPTY

  const [date] = iso.split('T')
  const [year, month, day] = date.split('-')

  if (!year || !month || !day) return iso

  return `${day}/${month}/${year}`
}

/**
 * O mês e o ano por extenso, para o bloco de próxima turma: "março de 2026".
 *
 * A landing anuncia quando a turma começa, e o dia exato pesa menos que o mês -
 * quem está decidindo quer saber se dá tempo de se organizar.
 *
 * `timeZone: 'UTC'` no formatador pelo mesmo motivo do `formatDate`: a data é
 * construída em UTC, e formatá-la no fuso local a puxaria de volta um dia.
 */
export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return EMPTY

  const [date] = iso.split('T')
  const [year, month] = date.split('-')

  if (!year || !month) return iso

  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)))

  return `${label} de ${year}`
}

/**
 * "1 turma", "5 turmas".
 *
 * O `count === 1 ? 'turma' : 'turmas'` estava escrito à mão no hero, no banner
 * final e no "o que você leva", e a regra 1 do `code-pattern` proíbe o ternário
 * como control flow. Um lugar só, e a contagem passa a vir junto: as três
 * frases sempre imprimiam o número antes da palavra.
 */
export function pluralize(count: number, one: string, many: string): string {
  if (count === 1) return `${count} ${one}`

  return `${count} ${many}`
}
