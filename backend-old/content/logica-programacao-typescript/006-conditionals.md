---
slug: "conditionals"
modulo: "Módulo 3 — Controle de Fluxo"
título: "if/else"
subtitulo: "Fazendo seu código tomar decisões"
descricao: "if, else if, else, operadores de comparação e ternário."
ordem: 6
proximosPassos:
  - título: "switch/case"
    descricao: "Compare valores fixos de forma limpa"
  - título: "Loops"
    descricao: "Repita ações automaticamente"
quiz:
  - pergunta: "Se a condição do if é falsa e não tem else, o que acontece?"
    opcoes: ["O programa dá erro", "O bloco do if executa mesmo assim", "Nada acontece, o programa segue adiante", "O programa para de executar"]
    correta: 2
    explicacao: "✓ Sem else, o bloco do if é ignorado é o programa continua normalmente."
    explicacaoErrada: "✗ Sem else, o if é simplesmente pulado. O programa segue em frente."
  - pergunta: "Qual operador verifica igualdade estrita em TypeScript?"
    opcoes: ["=", "==", "===", "!="]
    correta: 2
    explicacao: "✓ === compara valor E tipo. É o recomendado em TypeScript."
    explicacaoErrada: "✗ = é atribuição, == faz conversão de tipo. Use === sempre."
  - pergunta: "O que faz: const x = idade >= 18 ? 'maior' : 'menor'?"
    opcoes: ["Declara duas variáveis", "Atribui 'maior' se idade >= 18, senão 'menor'", "Dá erro de sintaxe", "Compara duas strings"]
    correta: 1
    explicacao: "✓ É o operador ternário — um if/else compacto em uma linha."
    explicacaoErrada: "✗ Isso é o ternário: condição verdadeira retorna o valor antes do :, senão o valor depois."
---

## if e else --- a decisão básica

Pense no `if` como uma bifurcação na estrada. Se a condição for verdadeira, vai por um caminho. Se for falsa, vai por outro.

```typescript
const idade: number = 18;

if (idade >= 18) {
  console.log("Maior de idade"); // → Maior de idade
} else {
  console.log("Menor de idade");
}
```

O `else` é opcional. Sem ele, o código simplesmente segue em frente:

```typescript
const temperatura: number = 35;

if (temperatura > 30) {
  console.log("Está muito quente!"); // → Está muito quente!
}
```

> [!info]
> A condição do `if` sempre resulta em `true` ou `false`.

## Operadores de comparação

São os símbolos que comparam valores:

| Operador | Significado        | Exemplo   | Resultado |
| -------- | ------------------ | --------- | --------- |
| `===`    | Igual (estrito)    | `5 === 5` | `true`    |
| `!==`    | Diferente (estrito)| `5 !== 3` | `true`    |
| `>`      | Maior que          | `10 > 5`  | `true`    |
| `<`      | Menor que          | `3 < 8`   | `true`    |
| `>=`     | Maior ou igual     | `5 >= 5`  | `true`    |
| `<=`     | Menor ou igual     | `3 <= 2`  | `false`   |

> [!alerta]
> Sempre use `===` em vez de `==`. O `==` faz conversão de tipo é causa bugs. Exemplo: `"5" == 5` é `true`, mas `"5" === 5` é `false`.

```typescript
const nota: number = 7;

console.log(nota > 5);       // → true
console.log(nota === 7);     // → true
console.log(nota <= 6);      // → false
```

## else if --- multiplas condições

Quando tem mais de dois caminhos, encadeie com `else if`:

```typescript
const nota: number = 7.5;

if (nota >= 9) {
  console.log("Excelente");
} else if (nota >= 7) {
  console.log("Aprovado");     // → Aprovado
} else if (nota >= 5) {
  console.log("Recuperação");
} else {
  console.log("Reprovado");
}
```

As condições são testadas de cima para baixo. A primeira verdadeira executa é o resto é ignorado.

> [!alerta]
> A ordem importa! Se colocasse `nota >= 5` antes de `nota >= 9`, uma nota 10 cairia em "Recuperação".

Outro exemplo — semáforo:

```typescript
const cor: string = "vermelho";

if (cor === "verde") {
  console.log("Siga");
} else if (cor === "amarelo") {
  console.log("Atenção");
} else if (cor === "vermelho") {
  console.log("Pare!");        // → Pare!
} else {
  console.log("Cor inválida");
}
```

> [!info]
> O `else` final é sua rede de segurança — pega qualquer caso que você não previu.

## Operador ternário --- if em uma linha

Para decisões simples, o ternário é mais direto:

```typescript
const idade: number = 20;
const status: string = idade >= 18 ? "maior" : "menor";

console.log(status); // → "maior"
```

A sintaxe: `condição ? valorSeTrue : valorSeFalse`

```typescript
const saldo: number = 150;
const msg: string = saldo >= 0 ? "Saldo positivo" : "No vermelho";

console.log(msg); // → "Saldo positivo"
```

> [!alerta]
> Use ternário só para coisas simples. Para lógica complexa, use `if/else`. Nunca aninhe ternários — vira uma bagunça.

## Exercício prático

Classifique a faixa etária:

- **Criança**: 0 a 11 anos
- **Adolescente**: 12 a 17 anos
- **Adulto**: 18 a 59 anos
- **Idoso**: 60 anos ou mais

```typescript
const idade: number = 25;

// Use if/else if/else para classificar a idade
// e exiba a faixa etária no console
```

## Referências

- [if...else - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/if...else) — documentação oficial do if/else com exemplos e boas práticas
- [JavaScript if else - W3Schools](https://www.w3schools.com/js/js_if_else.asp) — tutorial interativo sobre condicionais if, else if e else
- [Estruturas Condicionais em JavaScript - Curso em Vídeo](https://www.youtube.com/watch?v=cOLgevDpts8) — aula completa sobre if/else e operadores de comparação
