---
slug: "multiplication-table"
modulo: "Módulo 5 — Prática"
título: "Desafio: Tabuada"
subtitulo: "Gerando tabuadas com loops e formatação"
descricao: "Gere a tabuada de qualquer número usando for, template literals e padStart para alinhar."
ordem: 15
proximosPassos:
  - título: "Desafio: Sistema de Aprovação"
    descricao: "Classifique alunos por nota"
  - título: "Desafio: Números Primos"
    descricao: "Verifique é liste números primos"
quiz:
  - pergunta: "O que padStart(2) faz em uma string?"
    opcoes: ["Remove espaços", "Adiciona espaços no início até ter 2 caracteres", "Adiciona 2 espaços no final", "Converte para número"]
    correta: 1
    explicacao: "'1'.padStart(2) vira ' 1'. Preenche o início até ter 2 caracteres."
    explicacaoErrada: "padStart(2) preenche o início com espaços até a string ter 2 caracteres."
  - pergunta: "Quantas iterações tem um for de 1 a 10?"
    opcoes: ["9", "10", "11", "Depende"]
    correta: 1
    explicacao: "De 1 até 10 (com <=) são 10 iterações."
    explicacaoErrada: "for (let i = 1; i <= 10; i++) roda 10 vezes."
  - pergunta: "O que toString() faz com um número?"
    opcoes: ["Arredonda o número", "Converte para string", "Converte para boolean", "Remove decimais"]
    correta: 1
    explicacao: "toString() transforma o número em texto."
    explicacaoErrada: "toString() converte para string. Necessário para usar padStart."
---

## O desafio

**Problema:** gere a tabuada completa de qualquer número.

### Solução básica

```typescript
function tabuada(n: number): void {
  console.log(`\n--- Tabuada do ${n} ---`);
  for (let i = 1; i <= 10; i++) {
    console.log(`${n} x ${i} = ${n * i}`);
  }
}

tabuada(7);

// → --- Tabuada do 7 ---
// → 7 x 1 = 7
// → 7 x 2 = 14
// → ...
// → 7 x 10 = 70
```

Um `for` de 1 a 10 multiplicando `n` por `i`.

### Versão formatada

Para alinhar os números bonitinho, use `padStart`:

```typescript
function tabuadaFormatada(n: number): void {
  console.log(`\n--- Tabuada do ${n} ---`);
  for (let i = 1; i <= 10; i++) {
    const multiplicador = i.toString().padStart(2);
    const resultado = (n * i).toString().padStart(3);
    console.log(`${n} x ${multiplicador} = ${resultado}`);
  }
}

tabuadaFormatada(7);

// → --- Tabuada do 7 ---
// → 7 x  1 =   7
// → 7 x  2 =  14
// → 7 x 10 =  70
```

> [!info]
> `padStart(n)` preenche o início com espaços até ter `n` caracteres. Ótimo para alinhar colunas.

### Versão interativa

```typescript
import PromptSync from "prompt-sync";

const prompt = PromptSync();

const entrada = prompt("Digite um número para ver a tabuada: ");
const número = parseInt(entrada);

if (isNaN(número)) {
  console.log("Número inválido!");
} else {
  tabuadaFormatada(número);
}
```

## Exercício extra

Gere as tabuadas de 1 a 10 de uma vez:

```typescript
for (let n = 1; n <= 10; n++) {
  tabuadaFormatada(n);
}
```

> [!sucesso]
> Conceitos usados: funções void, for loop, template literals, `padStart` e `toString()`.

## Referências

- [String.prototype.padStart() - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/String/padStart) — documentação do padStart para formatação e alinhamento de strings
- [JavaScript For Loop - W3Schools](https://www.w3schools.com/js/js_loop_for.asp) — tutorial sobre loops for com exemplos de contagem e iteração
- [Tabuada com JavaScript - Curso em Vídeo](https://www.youtube.com/watch?v=pE6lXnbRZ1g) — vídeo prático gerando tabuadas com loops e formatação
