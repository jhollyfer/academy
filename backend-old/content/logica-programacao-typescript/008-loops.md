---
slug: "loops"
modulo: "Módulo 3 — Controle de Fluxo"
título: "Loops (for, while, do-while)"
subtitulo: "Repetindo ações automaticamente"
descricao: "Loops for, while e do-while em TypeScript."
ordem: 8
proximosPassos:
  - título: "for...of e break/continue"
    descricao: "Percorra arrays e controle o fluxo"
  - título: "Arrays"
    descricao: "Agrupe dados em listas"
quiz:
  - pergunta: "Quais são as três partes do loop for?"
    opcoes: ["entrada, saída, retorno", "inicialização, condição, incremento", "variável, operador, valor", "início, meio, fim"]
    correta: 1
    explicacao: "✓ for tem: inicialização (let i = 0), condição (i < 10) e incremento (i++)."
    explicacaoErrada: "✗ A estrutura é: for (inicialização; condição; incremento)."
  - pergunta: "Quando usar while em vez de for?"
    opcoes: ["Nunca, for é sempre melhor", "Quando sabe exatamente quantas vezes repetir", "Quando não sabe quantas vezes vai repetir", "Quando quer executar apenas uma vez"]
    correta: 2
    explicacao: "✓ while é para quando a quantidade de repetições é imprevisível."
    explicacaoErrada: "✗ while = não sabe quantas vezes. for = sabe quantas vezes."
  - pergunta: "O que causa um loop infinito?"
    opcoes: ["Usar break dentro do loop", "A condição nunca se tornar falsa", "Usar continue dentro do loop", "Declarar variáveis dentro do loop"]
    correta: 1
    explicacao: "✓ Se a condição nunca fica falsa, o loop roda para sempre e trava o programa."
    explicacaoErrada: "✗ Loop infinito = condição nunca fica falsa. Sempre garanta que algo mude a condição."
---

## Por que loops?

Imagine imprimir os números de 1 a 100. Sem loops, seriam 100 linhas de `console.log`. Com um loop, são 3 linhas.

## for --- quando sabe quantas vezes repetir

O `for` é como um contador automático:

```typescript
for (let i: number = 1; i <= 5; i++) {
  console.log(i);
}
// → 1
// → 2
// → 3
// → 4
// → 5
```

Três partes separadas por `;`:

1. **Inicialização** — `let i = 1` — roda uma vez no começo
2. **Condição** — `i <= 5` — testada antes de cada volta
3. **Incremento** — `i++` — roda depois de cada volta

### Somando números

```typescript
let soma: number = 0;

for (let i: number = 1; i <= 100; i++) {
  soma += i;
}

console.log(soma); // → 5050
```

### Contagem regressiva

O incremento pode ser qualquer coisa:

```typescript
for (let i: number = 10; i >= 0; i--) {
  console.log(i);
}
console.log("Lançamento!"); // → 10, 9, 8... 0, Lançamento!
```

> [!info]
> Use `for` quando sabe **exatamente** quantas vezes repetir.

## while --- quando não sabe quantas vezes

O `while` repete enquanto a condição for verdadeira. É como tentar abrir uma porta — você tenta até conseguir:

```typescript
let tentativas: number = 0;
let acertou: boolean = false;

while (!acertou) {
  tentativas++;
  acertou = Math.random() > 0.8;
}
console.log(`Acertou em ${tentativas} tentativas`);
```

Pode ser 1 tentativa, pode ser 20. O `while` lida com isso.

### Encontrando um divisor

```typescript
function menorDivisor(n: number): number {
  let divisor: number = 2;

  while (n % divisor !== 0) {
    divisor++;
  }

  return divisor;
}

console.log(menorDivisor(15)); // → 3
console.log(menorDivisor(7));  // → 7 (é primo)
```

> [!alerta]
> Todo `while` precisa que algo mude a condição. Se nada mudar, o loop roda para sempre e trava o programa.

## do-while --- executa pelo menos uma vez

O `do-while` é como o `while`, mas executa primeiro e pergunta depois:

```typescript
let número: number;

do {
  número = Math.floor(Math.random() * 10);
  console.log(`Gerou: ${número}`);
} while (número !== 7);

console.log("Encontrou o 7!");
```

A diferença: `while` pode nunca executar. `do-while` sempre roda pelo menos uma vez.

> [!info]
> Use `do-while` quando precisa executar a ação pelo menos uma vez — como mostrar um menu antes de pedir a escolha.

## Exemplo: tabuada

```typescript
const número: number = 7;

for (let i: number = 1; i <= 10; i++) {
  console.log(`${número} x ${i} = ${número * i}`);
}
// → 7 x 1 = 7
// → 7 x 2 = 14
// → ...
// → 7 x 10 = 70
```

## Exercício prático

**Desafio 1:** Calcule o fatorial (5! = 5 x 4 x 3 x 2 x 1 = 120):

```typescript
const n: number = 5;
let fatorial: number = 1;

// Use um for multiplicando fatorial por cada número de 1 até n
```

**Desafio 2:** Conte os números pares de 1 a 50:

```typescript
let contadorPares: number = 0;

// Use for + if para encontrar os pares
// Exiba cada par e, no final, o total
```

## Referências

- [Loops e iteração - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Loops_and_iteration) — guia completo sobre for, while e do-while com exemplos
- [JavaScript For Loop - W3Schools](https://www.w3schools.com/js/js_loop_for.asp) — tutorial interativo sobre loops for, while e do-while
- [Estruturas de Repetição em JavaScript - Curso em Vídeo](https://www.youtube.com/watch?v=NfHVP1td6oY) — aula completa sobre loops for, while e do-while
