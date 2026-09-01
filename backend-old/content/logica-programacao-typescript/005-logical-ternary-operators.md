---
slug: "logical-ternary-operators"
modulo: "Módulo 2 — Operadores"
título: "Operadores Lógicos e Ternário"
subtitulo: "Combine condições e tome decisões rápidas"
descricao: "Operadores && (E), || (OU), ! (NÃO) é o operador ternário para decisões em uma linha."
ordem: 5
proximosPassos:
  - título: "Condicionais"
    descricao: "Tome decisões com if/else"
  - título: "Loops"
    descricao: "Repita ações automaticamente"
quiz:
  - pergunta: "O que && retorna quando uma das condições é falsa?"
    opcoes: ["true", "false", "undefined", "null"]
    correta: 1
    explicacao: "✓ && só dá true se os DOIS lados forem true. Um false já basta para dar false."
    explicacaoErrada: "✗ && exige ambos true. Se um for false, resultado é false."
  - pergunta: "O que || retorna quando ambas as condições são falsas?"
    opcoes: ["true", "false", "undefined", "0"]
    correta: 1
    explicacao: "✓ || só dá false se os DOIS forem false. Basta um true para dar true."
    explicacaoErrada: "✗ || precisa de pelo menos um true. Dois false = false."
  - pergunta: "O que faz: const status = nota >= 7 ? 'Aprovado' : 'Reprovado'?"
    opcoes: ["Declara duas variáveis", "Atribui 'Aprovado' se nota >= 7, senão 'Reprovado'", "Dá erro de sintaxe", "Compara duas strings"]
    correta: 1
    explicacao: "✓ Ternário: condição ? valorSeTrue : valorSeFalse. Um if/else em uma linha."
    explicacaoErrada: "✗ É o operador ternário: se true, retorna o valor antes do :. Se false, o valor depois."
---

## Operadores lógicos

Combinam condições. Pense assim:

| Operador | Nome | Quando é true? |
|----------|------|----------------|
| `&&` | E | Os **dois** precisam ser true |
| `\|\|` | OU | **Pelo menos um** precisa ser true |
| `!` | NÃO | **Inverte**: true vira false, false vira true |

```typescript
const idade = 18;
const temCarteira = true;

console.log(idade >= 18 && temCarteira); // → true (os dois são true)
console.log(idade >= 18 || temCarteira); // → true (pelo menos um é true)
console.log(!(idade >= 18));             // → false (inverteu o true)
```

### `&&` (E) — os dois precisam ser true

```typescript
const idade: number = 20;
const temDocumento: boolean = true;

if (idade >= 18 && temDocumento) {
  console.log("Pode entrar"); // → Pode entrar
}
```

### `||` (OU) — basta um ser true

```typescript
const temIngresso: boolean = false;
const ehVIP: boolean = true;

if (temIngresso || ehVIP) {
  console.log("Acesso liberado"); // → Acesso liberado
}
```

### `!` (NÃO) — inverte

```typescript
const logado: boolean = false;

if (!logado) {
  console.log("Faça login"); // → Faça login
}
```

> [!info]
> Ordem de precedência: `!` primeiro, depois `&&`, depois `||`. Use parênteses para deixar claro: `(a && b) || c` é diferente de `a && (b || c)`.

## Operador ternário

Um if/else em uma linha: `condição ? valorSeTrue : valorSeFalse`

```typescript
const nota = 7.5;
const status = nota >= 7 ? "Aprovado" : "Reprovado";
console.log(status); // → Aprovado
```

É a mesma coisa que:

```typescript
let status: string;
if (nota >= 7) {
  status = "Aprovado";
} else {
  status = "Reprovado";
}
```

Mais exemplos:

```typescript
const saldo: number = 150;
const msg = saldo >= 0 ? "Saldo positivo" : "Conta no vermelho";
// → "Saldo positivo"

const idade: number = 15;
const categoria = idade >= 18 ? "adulto" : "menor";
// → "menor"

const temp: number = 35;
const clima = temp > 30 ? "quente" : "agradável";
// → "quente"
```

> [!alerta]
> Use ternário só para coisas simples. Para lógica complexa, use `if/else`. Nunca aninhe ternários (`a ? b ? c : d : e`) — fica impossível de ler.

> [!sucesso]
> `&&` e `||` combinam condições, `!` inverte, ternário é um if/else curto. Você vai usar isso em todo programa.

## Referências

- [Operadores lógicos - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Logical_AND) — documentação dos operadores &&, || e ! com exemplos detalhados
- [JavaScript Comparison and Logical Operators - W3Schools](https://www.w3schools.com/js/js_comparisons.asp) — tutorial sobre operadores lógicos é o operador ternário
- [Operador Ternário em JavaScript - Código Fonte TV](https://www.youtube.com/watch?v=QhIlMb2WQHQ) — vídeo explicando operadores lógicos e ternário com exemplos práticos
