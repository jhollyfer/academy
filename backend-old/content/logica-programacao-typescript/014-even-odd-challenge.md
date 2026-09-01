---
slug: "even-odd-challenge"
modulo: "Módulo 5 — Prática"
título: "Desafio: Par ou Ímpar"
subtitulo: "Classificando números com entrada do usuário"
descricao: "Classifique números como par ou ímpar e aprenda a ler entrada do usuário no terminal com prompt-sync."
ordem: 14
proximosPassos:
  - título: "Desafio: Tabuada"
    descricao: "Gere tabuadas com loops"
  - título: "Desafio: Sistema de Aprovação"
    descricao: "Classifique alunos por nota"
quiz:
  - pergunta: "Como verificar se um número é par em TypeScript?"
    opcoes: ["n / 2 === 0", "n % 2 === 0", "n * 2 === 0", "n == par"]
    correta: 1
    explicacao: "% dá o resto da divisão. Se n % 2 é 0, o número é par."
    explicacaoErrada: "Use n % 2 === 0. Resto zero na divisão por 2 = par."
  - pergunta: "O que o prompt-sync faz?"
    opcoes: ["Exibe mensagens no terminal", "Lê entrada do usuário no terminal", "Cria arquivos", "Conecta à internet"]
    correta: 1
    explicacao: "prompt-sync lê o que o usuário digita no terminal."
    explicacaoErrada: "prompt-sync é uma biblioteca para ler entrada do teclado no terminal."
  - pergunta: "O que parseInt('42') retorna?"
    opcoes: ["'42' (string)", "42 (number)", "undefined", "NaN"]
    correta: 1
    explicacao: "parseInt() transforma texto em número inteiro. '42' vira 42."
    explicacaoErrada: "parseInt() converte string para número. Se não for numérica, retorna NaN."
---

## Lendo entrada do usuário

Até agora, os valores estavam fixos no código. Vamos deixar o programa interativo com `prompt-sync`.

### Instalação

```bash
npm install prompt-sync
npm install -D @types/prompt-sync
```

### Como usar

```typescript
import PromptSync from "prompt-sync";

const prompt = PromptSync();

const nome: string = prompt("Qual seu nome? ");
console.log(`Olá, ${nome}!`);

const idadeTexto: string = prompt("Qual sua idade? ");
const idade: number = parseInt(idadeTexto);
console.log(`Você tem ${idade} anos`);
```

> [!info]
> `prompt()` sempre devolve uma **string**. Para números, converta com `parseInt()` (inteiro) ou `parseFloat()` (decimal).

## O desafio

**Problema:** classifique cada número de uma lista como par ou ímpar.

### Versão com array fixo

```typescript
function parOuImpar(n: number): string {
  return n % 2 === 0 ? "par" : "ímpar";
}

const números = [1, 2, 3, 4, 5, 6, 7, 8];

for (const n of números) {
  console.log(`${n} é ${parOuImpar(n)}`);
}

// → 1 é ímpar
// → 2 é par
// → 3 é ímpar
// → ...
```

`%` dá o resto da divisão. Resto 0 ao dividir por 2 = par.

### Versão interativa

```typescript
import PromptSync from "prompt-sync";

const prompt = PromptSync();

function parOuImpar(n: number): string {
  return n % 2 === 0 ? "par" : "ímpar";
}

let continuar = true;

while (continuar) {
  const entrada = prompt("Digite um número (ou 'sair'): ");

  if (entrada === "sair") {
    continuar = false;
    continue;
  }

  const número = parseInt(entrada);

  if (isNaN(número)) {
    console.log("Entrada inválida. Digite um número.");
    continue;
  }

  console.log(`${número} é ${parOuImpar(número)}`);
}

console.log("Programa encerrado.");
```

> [!sucesso]
> Conceitos usados: funções, operador ternário, operador módulo, while, continue, prompt-sync e validação.

## Exercício extra

Modifique o programa para contar quantos pares é ímpares o usuário digitou:

```typescript
let pares = 0;
let impares = 0;

// Use a versão interativa como base
// Incremente pares ou impares conforme a classificação
// Exiba o total ao final
```

## Referências

- [Operador resto (%) - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Operators/Remainder) — documentação do operador módulo usado para verificar par ou ímpar
- [JavaScript While Loop - W3Schools](https://www.w3schools.com/js/js_loop_while.asp) — tutorial sobre loops while e validação de entrada do usuário
- [Par ou Ímpar em JavaScript - DevMedia](https://www.youtube.com/watch?v=8dZd-LkKsGQ) — vídeo prático sobre como classificar números usando operador módulo
