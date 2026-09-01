---
slug: "params-return-callbacks"
modulo: "Módulo 4 — Dados e Funções"
título: "Parâmetros, Retorno e Callbacks"
subtitulo: "Opcionais, retorno tipado, callbacks e type aliases"
descricao: "Parâmetros opcionais, retorno tipado, funções como argumento (callbacks) e type aliases em TypeScript."
ordem: 13
proximosPassos:
  - título: "Desafio: Par ou Ímpar"
    descricao: "Primeiro desafio prático"
  - título: "Desafio: Tabuada"
    descricao: "Gere tabuadas com funções"
quiz:
  - pergunta: "O que significa o ? após um parâmetro?"
    opcoes: ["O parâmetro é obrigatório", "O parâmetro é opcional (pode ser undefined)", "O parâmetro é null", "O parâmetro é boolean"]
    correta: 1
    explicacao: "O ? torna o parâmetro opcional. Se não for passado, vira undefined."
    explicacaoErrada: "O ? indica que o parâmetro pode ou não ser fornecido."
  - pergunta: "O que é um callback?"
    opcoes: ["Um tipo de variável", "Uma função passada como argumento para outra função", "Um retorno de função", "Um loop especial"]
    correta: 1
    explicacao: "Callback é uma função que você passa como argumento para outra função executar."
    explicacaoErrada: "Callback = função como argumento. Exemplo: array.map(callback)."
  - pergunta: "Para que serve o type alias?"
    opcoes: ["Para criar variáveis", "Para dar um nome descritivo a um tipo", "Para importar módulos", "Para criar loops"]
    correta: 1
    explicacao: "type cria um apelido para o tipo. Exemplo: type Nota = number."
    explicacaoErrada: "type cria um apelido para um tipo, não cria variáveis."
---

## Parâmetros opcionais e valores padrão

Nem sempre você precisa de todos os parâmetros. Use `?` para tornar opcional ou `=` para dar um valor padrão:

```typescript
// Valor padrão: se não passar, usa 2
function potência(base: number, expoente: number = 2): number {
  return base ** expoente;
}

console.log(potência(3));      // → 9
console.log(potência(2, 10));  // → 1024

// Opcional: pode ou não vir
function criarNome(nome: string, sobrenome?: string): string {
  return sobrenome ? `${nome} ${sobrenome}` : nome;
}

console.log(criarNome("Marcos"));              // → Marcos
console.log(criarNome("Marcos", "Rodrigues")); // → Marcos Rodrigues
```

> [!alerta]
> Parâmetros opcionais e com valor padrão sempre vêm **por último**.

## Tipando o retorno

O tipo depois dos parênteses diz o que a função devolve:

```typescript
// void — não devolve nada
function exibirMensagem(msg: string): void {
  console.log(msg);
}

// Devolvendo um objeto
function dividir(a: number, b: number): { resultado: number; resto: number } {
  return {
    resultado: Math.floor(a / b),
    resto: a % b,
  };
}

const { resultado, resto } = dividir(10, 3);
console.log(`Resultado: ${resultado}, Resto: ${resto}`);
// → Resultado: 3, Resto: 1
```

> [!info]
> `const { resultado, resto } = ...` extrai valores do objeto direto em variáveis. Isso é **desestruturação**.

## Callbacks — funções como parâmetros

Callback é quando você passa uma função para outra função executar. Pense assim: você dá uma instrução e alguém executa para você.

```typescript
function aplicarOperacao(
  números: number[],
  operação: (n: number) => number,
): number[] {
  return números.map(operação);
}

const resultado = aplicarOperacao([1, 2, 3, 4], (n) => n * 3);
console.log(resultado); // → [3, 6, 9, 12]
```

Você já usa callbacks sem perceber — `filter`, `map` e `reduce` recebem callbacks:

```typescript
const notas = [8, 5, 9, 3, 7];

// (nota) => nota >= 7 é o callback
const aprovados = notas.filter((nota) => nota >= 7);
```

## Type aliases — apelidos para tipos

`type` cria um nome para um tipo. Deixa o código mais legível:

```typescript
type Aluno = {
  nome: string;
  notas: number[];
};

function calcularMedia(aluno: Aluno): number {
  const soma = aluno.notas.reduce((acc, n) => acc + n, 0);
  return soma / aluno.notas.length;
}

const ana: Aluno = { nome: "Ana", notas: [8, 9, 7] };
console.log(calcularMedia(ana)); // → 8
```

Em vez de repetir `{ nome: string; notas: number[] }` toda hora, escreve `Aluno`.

## Responsabilidade única

Cada função faz **uma coisa só**. Se o nome tem "E" no meio, quebre em duas:

```typescript
// Ruim — faz duas coisas
function calcularEImprimir(notas: number[]): void {
  const média = notas.reduce((a, b) => a + b, 0) / notas.length;
  console.log(`Média: ${média}`);
}

// Bom — cada uma faz uma coisa
function calcularMedia(notas: number[]): number {
  return notas.reduce((a, b) => a + b, 0) / notas.length;
}

console.log(`Média: ${calcularMedia([8, 7, 9])}`);
```

> [!sucesso]
> Parâmetros opcionais, callbacks e type aliases deixam seu código mais flexível e organizado. Você vai usar tudo isso nos desafios.

## Referências

- [Funções de callback - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Glossary/Callback_function) — explicação de callbacks e como funções são passadas como argumento
- [JavaScript Function Parameters - W3Schools](https://www.w3schools.com/js/js_function_parameters.asp) — tutorial sobre parâmetros, valores padrão e argumentos em funções
- [Callbacks e Type Aliases no TypeScript - Hora de Codar](https://www.youtube.com/watch?v=OXGVMpIMVKA) — vídeo sobre parâmetros opcionais, callbacks e criação de tipos customizados
