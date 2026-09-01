import type { SchemaObject } from './types.ts'

/**
 * Correções de documentação para as regras compartilhadas de `#core/validator`.
 *
 * Moram num lugar só, e não dentro de cada controller, porque a divergência é do
 * helper: quem mudar `password()` vê a correção junto das demais, em vez de
 * descobrir por um documento errado meses depois.
 *
 * O gerador aplica estas correções por **nome de campo**, em qualquer payload
 * onde o campo apareça. Cinco validators usam `password()`; declarar o conserto
 * em cinco controllers era garantir que o sexto nascesse errado.
 */

/**
 * Um campo cujo schema derivado precisa ser corrigido, e o campo companheiro
 * que ele arrasta para o payload.
 */
export type FieldPatch = {
  schema?: SchemaObject
  companion?: {
    name: string
    schema: SchemaObject
    /** O companheiro é obrigatório exatamente quando o campo original é. */
    followsRequired: boolean
  }
}

/**
 * O que `password()` valida e o JSON Schema não conta.
 *
 * Duas perdas, as duas medidas na saída do VineJS 4.4.0:
 *
 * 1. Os quatro `.regex()` - minúscula, maiúscula, dígito e especial - viram um
 *    `pattern` só, o último. O documento afirmaria que `abcdefg!` passa.
 *    `allOf` expressa a conjunção que o campo realmente exige.
 * 2. `passwordConfirmation` não existe no schema gerado: `.confirmed()` lê o
 *    campo do input cru, então ele nunca entra no payload validado - mas é
 *    obrigatório na requisição.
 */
export const FIELD_PATCHES: Record<string, FieldPatch> = {
  password: {
    schema: {
      type: 'string',
      minLength: 8,
      maxLength: 32,
      description:
        'Exige ao menos uma minúscula, uma maiúscula, um dígito e um caractere especial.',
      allOf: [
        { pattern: '[a-z]' },
        { pattern: '[A-Z]' },
        { pattern: '[0-9]' },
        { pattern: '[^a-zA-Z0-9]' },
      ],
    },
    companion: {
      name: 'passwordConfirmation',
      schema: { type: 'string', description: 'Repetição exata de `password`.' },
      followsRequired: true,
    },
  },
}
