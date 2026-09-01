---
slug: "functions-arrow"
modulo: "Módulo 4 — Dados e Funções"
título: "Funções e Arrow Functions"
subtitulo: "Blocos de código reutilizáveis"
descricao: "Funções em TypeScript: como declarar, tipar parâmetros e retorno, usar arrow functions, valores padrão e escopo."
ordem: 12
proximosPassos:
  - título: "Parâmetros e callbacks"
    descricao: "Parâmetros opcionais, retorno e callbacks"
  - título: "Desafios"
    descricao: "Coloque funções em prática"
quiz:
  - pergunta: "O que a palavra-chave return faz em uma função?"
    opcoes: ["Imprime um valor no terminal", "Encerra a função e devolve um valor", "Declara uma variável", "Chama outra função"]
    correta: 1
    explicacao: "return para a função na hora e devolve o valor para quem chamou."
    explicacaoErrada: "return não imprime nada. Ele devolve um valor. Para imprimir, use console.log."
  - pergunta: "O que significa o tipo void no retorno de uma função?"
    opcoes: ["Retorna zero", "Retorna uma string vazia", "Não retorna nada", "Retorna null"]
    correta: 2
    explicacao: "void = a função faz algo mas não devolve nenhum valor."
    explicacaoErrada: "void significa 'sem retorno'. A função executa mas não devolve nada."
  - pergunta: "Qual é a sintaxe correta de uma arrow function?"
    opcoes: ["function => (n) { n * 2 }", "const f = (n: number): number => n * 2", "arrow f(n) => n * 2", "const f = n -> n * 2"]
    correta: 1
    explicacao: "Arrow functions usam => depois dos parâmetros. Em uma linha, o return é automático."
    explicacaoErrada: "A sintaxe é: const nome = (params) => expressão. O => define a arrow function."
  - pergunta: "Uma variável declarada dentro de uma função pode ser acessada fora dela?"
    opcoes: ["Sim, sempre", "Sim, se usar const", "Não, ela só existe dentro da função", "Sim, se usar var"]
    correta: 2
    explicacao: "Variáveis dentro de uma função só existem ali. Isso é escopo local."
    explicacaoErrada: "let e const dentro de uma função não existem fora dela. Escopo local."
---

## O que são funções?

Função é um bloco de código que você escreve uma vez e usa quantas vezes quiser. Como uma receita: anota uma vez, faz o bolo sempre que precisar.

```typescript
function saudação(nome: string): string {
  return `Olá, ${nome}!`;
}

console.log(saudação("Maria")); // → "Olá, Maria!"
console.log(saudação("João"));  // → "Olá, João!"
```

> [!info]
> Se você está copiando e colando código, provavelmente precisa de uma função.

## Parâmetros e retorno tipados

Em TypeScript, você declara os tipos dos parâmetros e do retorno:

```typescript
function somar(a: number, b: number): number {
  return a + b;
}

function exibirMensagem(msg: string): void {
  console.log(msg);
  // void = não retorna nada
}

function estaAprovado(nota: number): boolean {
  return nota >= 7;
}
```

O tipo depois dos parênteses (`: number`, `: void`, `: boolean`) é o que a função devolve.

### Exemplo: calculadora de desconto

```typescript
function calcularDesconto(preco: number, percentual: number): number {
  const desconto: number = preco * (percentual / 100);
  return preco - desconto;
}

const precoOriginal: number = 120;
const precoFinal: number = calcularDesconto(precoOriginal, 15);
console.log(`De R$${precoOriginal} por R$${precoFinal}`); // → "De R$120 por R$102"
```

## Arrow functions

Jeito mais curto de escrever funções. Perfeito para funções simples:

```typescript
const dobrar = (n: number): number => n * 2;
const saudar = (nome: string): string => `Oi, ${nome}`;
const ehPar = (n: number): boolean => n % 2 === 0;

console.log(dobrar(7));       // → 14
console.log(saudar("Ana"));   // → "Oi, Ana"
console.log(ehPar(4));        // → true
```

> [!info]
> Em uma linha, o `return` é automático. Com várias linhas, use `{}` e `return`:

```typescript
const saudacaoCompleta = (nome: string, hora: number): string => {
  if (hora < 12) return `Bom dia, ${nome}!`;
  if (hora < 18) return `Boa tarde, ${nome}!`;
  return `Boa noite, ${nome}!`;
};

console.log(saudacaoCompleta("Ana", 9));  // → "Bom dia, Ana!"
console.log(saudacaoCompleta("Ana", 15)); // → "Boa tarde, Ana!"
```

## Valores padrão

Parâmetros podem ter um valor "de reserva", usado quando nada é passado:

```typescript
function cumprimentar(nome: string, saudação: string = "Olá"): string {
  return `${saudação}, ${nome}!`;
}

console.log(cumprimentar("Ana"));            // → "Olá, Ana!"
console.log(cumprimentar("Ana", "Bom dia")); // → "Bom dia, Ana!"
```

```typescript
function formatarPreco(valor: number, moeda: string = "R$"): string {
  return `${moeda} ${valor.toFixed(2)}`;
}

console.log(formatarPreco(49.9));          // → "R$ 49.90"
console.log(formatarPreco(49.9, "US$"));   // → "US$ 49.90"
```

> [!alerta]
> Parâmetros com valor padrão devem vir por último. `function f(a: string = "oi", b: number)` não faz sentido porque você não consegue pular o primeiro.

## Escopo de variáveis

Variáveis criadas dentro de uma função só existem ali dentro. Pense como uma bolha:

```typescript
const mensagem: string = "visível em todo lugar";

function exemplo(): void {
  const local: string = "visível só aqui dentro";
  console.log(mensagem); // → funciona (vem de fora)
  console.log(local);    // → funciona (é local)
}

exemplo();
// console.log(local); // → ERRO! local não existe aqui fora
```

De fora para dentro: OK. De dentro para fora: bloqueado.

## Resumo

| Conceito | Sintaxe | Quando usar |
|---|---|---|
| Função tradicional | `function nome(p: tipo): tipo {}` | Funções nomeadas |
| Arrow function | `const f = (p: tipo): tipo => ...` | Funções curtas |
| Valor padrão | `function f(p: tipo = valor)` | Parâmetros opcionais |

> [!sucesso]
> Funções são a base de tudo. Domine elas é o resto fica mais fácil.

## Referências

- [Funções - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Functions) — guia completo sobre funções, arrow functions, parâmetros e escopo
- [JavaScript Functions - W3Schools](https://www.w3schools.com/js/js_functions.asp) — tutorial interativo sobre declaração de funções e arrow functions
- [Arrow Functions em TypeScript - Glaucia Lemos](https://www.youtube.com/watch?v=yBBSM08NOCE) — vídeo sobre funções tradicionais e arrow functions com tipagem
