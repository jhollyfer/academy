/**
 * Documento e telefone na forma que se lê.
 *
 * O banco guarda só dígitos - `cpf()`, `cnpj()`, `cep()` e `phone()` tiram a
 * máscara no `parse()` antes de qualquer regra -, e a máscara de digitação só
 * existe enquanto o campo está em foco. Fora do formulário, quem reexibe é isto.
 *
 * Existe porque a mesma formatação estava escrita sete vezes em `slice()` solto
 * pelas telas de listagem e de detalhe, com sete chances de divergir, e porque o
 * telefone passou a precisar da mesma coisa quando deixou de ser gravado com
 * máscara.
 *
 * Todas devolvem o valor cru quando ele não tem o tamanho esperado, em vez de
 * fatiar o que não deve: dado antigo ou fora do padrão aparece como está, e não
 * disfarçado de documento válido.
 */

/** O hífen que as tabelas usam para "não informado". */
const EMPTY = '-'

/**
 * A placa da loja: nome fantasia, com a razão social de reserva.
 *
 * Existe porque a empresa deixou de ser achatada sobre o usuário, e o
 * `tradeName ?? name` que as telas usavam passou a ser `tradeName ?? legalName`
 * - em treze lugares. `legalName` é `notNullable()`, então nunca falta nome.
 */
export function companyName(
  company: { tradeName: string | null; legalName: string } | null | undefined,
): string {
  if (!company) return EMPTY

  return company.tradeName ?? company.legalName
}

export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return EMPTY
  if (cpf.length !== 11) return cpf

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

export function formatCnpj(cnpj: string | null | undefined): string {
  if (!cnpj) return EMPTY
  if (cnpj.length !== 14) return cnpj

  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`
}

export function formatCep(cep: string | null | undefined): string {
  if (!cep) return EMPTY
  if (cep.length !== 8) return cep

  return `${cep.slice(0, 5)}-${cep.slice(5)}`
}

/**
 * Fixo tem dez dígitos e celular tem onze, e a diferença está no tamanho do
 * segundo grupo - `(92) 3333-4444` contra `(92) 99999-0000`. É a mesma regra que
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
