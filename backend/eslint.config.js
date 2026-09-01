import { configApp } from '@adonisjs/eslint-config'

/**
 * `database/schema.ts` é gerado por `node ace migration:run` e traz "DO NOT EDIT
 * manually" no topo. Formatá-lo é trabalho que a próxima migration desfaz.
 *
 * Precisa ser um objeto próprio no array: no flat config, um objeto só com
 * `ignores` é ignore global. Dentro de `configApp({ ignores })` valeria apenas
 * para aquele bloco de configuração, e o arquivo continuaria sendo verificado.
 */
const gerados = { ignores: ['database/schema.ts'] }

export default [
  gerados,
  ...configApp({
    rules: {
      '@unicorn/filename-case': 'off',

      /**
       * A mesma configuração de `@adonisjs/eslint-config`, com uma adição: variável
       * não usada pode começar com `_`.
       *
       * É o idioma para descartar uma chave no destructuring - `const { role:
       * _papelIgnorado, ...dados } = payload` diz, no próprio nome, que o valor foi
       * jogado fora de propósito. Sem a exceção, a regra empurra para um nome pior
       * ou para o descarte deixar de ser explícito.
       */
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'variable', format: ['camelCase', 'UPPER_CASE', 'PascalCase'] },
        {
          selector: 'variable',
          modifiers: ['unused'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'class', format: ['PascalCase'] },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: { regex: '^I[A-Z]', match: false },
        },
      ],
    },
  }),
]
