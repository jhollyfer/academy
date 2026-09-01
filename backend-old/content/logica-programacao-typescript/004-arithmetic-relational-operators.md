---
slug: "arithmetic-relational-operators"
modulo: "Módulo 2 — Operadores"
título: "Operadores Aritméticos e Relacionais"
subtitulo: "Calcule, compare e atualize valores"
descricao: "Operadores de conta (+, -, *, /), comparação (===, >, <) e atalhos de atribuição (+=, -=) em TypeScript."
ordem: 4
proximosPassos:
  - título: "Operadores lógicos"
    descricao: "Combine condições com &&, || e ternário"
  - título: "Condicionais"
    descricao: "Tome decisões com if/else"
quiz:
  - pergunta: "O que o operador % (módulo) retorna?"
    opcoes: ["O resultado da divisão", "O resto da divisão", "A porcentagem", "O quociente"]
    correta: 1
    explicacao: "✓ % retorna o resto. 10 % 3 = 1 (10 ÷ 3 = 3, sobra 1)."
    explicacaoErrada: "✗ % não é porcentagem — é o resto da divisão."
  - pergunta: "Qual a diferença entre == e === em TypeScript?"
    opcoes: ["São iguais", "== compara valor é tipo, === só valor", "=== compara valor é tipo sem coerção, == faz coerção", "== é mais seguro"]
    correta: 2
    explicacao: "✓ === compara valor E tipo. == converte tipos e pode causar bugs."
    explicacaoErrada: "✗ Use sempre ===. O == converte tipos: \"5\" == 5 é true, mas \"5\" === 5 é false."
  - pergunta: "O que x += 5 faz?"
    opcoes: ["Compara x com 5", "Atribui 5 a x", "Soma 5 ao valor atual de x", "Subtrai 5 de x"]
    correta: 2
    explicacao: "✓ x += 5 é atalho para x = x + 5."
    explicacaoErrada: "✗ += soma ao valor atual. x += 5 = x = x + 5."
  - pergunta: "Qual o resultado de 2 ** 3?"
    opcoes: ["6", "8", "5", "23"]
    correta: 1
    explicacao: "✓ ** é potência. 2 ** 3 = 2³ = 8."
    explicacaoErrada: "✗ ** eleva à potência. 2 ** 3 = 2 × 2 × 2 = 8."
---

## Operadores aritméticos

As operações matemáticas básicas:

```typescript
const a = 10;
const b = 3;

console.log(a + b);  // → 13 (soma)
console.log(a - b);  // → 7  (subtração)
console.log(a * b);  // → 30 (multiplicação)
console.log(a / b);  // → 3.333... (divisão)
console.log(a % b);  // → 1  (resto da divisão)
console.log(a ** b); // → 1000 (potência: 10³)
```

> [!info]
> `%` (módulo) retorna o resto da divisão. Muito útil para saber se um número é par: `n % 2 === 0`.

### Ordem das operações

Mesma regra da matemática: potência primeiro, depois multiplicação/divisão, depois soma/subtração.

```typescript
console.log(2 + 3 * 4);   // → 14 (multiplica primeiro)
console.log((2 + 3) * 4); // → 20 (parênteses mudam a ordem)
```

## Operadores relacionais

Comparam valores e retornam `true` ou `false`:

```typescript
console.log(5 > 3);   // → true
console.log(5 < 3);   // → false
console.log(5 >= 5);  // → true
console.log(5 <= 4);  // → false
console.log(5 === 5); // → true  (igual em valor E tipo)
console.log(5 !== 3); // → true  (diferente)
```

| Operador | Significado | Exemplo | Resultado |
|----------|------------|---------|-----------|
| `===` | Igual (estrito) | `5 === 5` | `true` |
| `!==` | Diferente (estrito) | `5 !== 3` | `true` |
| `>` | Maior que | `10 > 5` | `true` |
| `<` | Menor que | `3 < 8` | `true` |
| `>=` | Maior ou igual | `5 >= 5` | `true` |
| `<=` | Menor ou igual | `3 <= 2` | `false` |

> [!alerta]
> Sempre use `===`, nunca `==`. O `==` converte tipos e causa bugs:
>
> ```typescript
> console.log(5 == "5");  // → true  (perigoso!)
> console.log(5 === "5"); // → false (correto)
> ```

## Operadores de atribuição

Atalhos para atualizar variáveis:

```typescript
let x = 10;
x += 5;  // x = x + 5  → 15
x -= 3;  // x = x - 3  → 12
x *= 2;  // x = x * 2  → 24
x /= 4;  // x = x / 4  → 6
x **= 2; // x = x ** 2 → 36
x %= 5;  // x = x % 5  → 1
```

Em vez de `soma = soma + valor`, escreva `soma += valor`. Mais curto é mais claro.

> [!sucesso]
> Aritméticos fazem contas, relacionais comparam (retornam true/false), atribuição atualiza variáveis. Domine esses três antes de avançar.

## Referências

- [Expressões e operadores - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Expressions_and_operators) — guia completo sobre operadores aritméticos, de comparação e atribuição
- [JavaScript Operators - W3Schools](https://www.w3schools.com/js/js_operators.asp) — tutorial interativo com exemplos de todos os operadores
- [Operadores em TypeScript - Hora de Codar](https://www.youtube.com/watch?v=2lSLEfYIhGQ) — vídeo explicando operadores aritméticos e relacionais na prática
