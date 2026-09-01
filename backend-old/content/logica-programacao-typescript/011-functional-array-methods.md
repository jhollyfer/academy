---
slug: "functional-array-methods"
modulo: "Módulo 4 — Dados e Funções"
título: "Métodos de Array"
subtitulo: "filter, map, reduce, find, some e every"
descricao: "Aprenda os métodos funcionais de arrays: filter filtra, map transforma, reduce acumula, find busca e some/every verificam."
ordem: 11
proximosPassos:
  - título: "Funções"
    descricao: "Crie blocos de código reutilizáveis"
  - título: "Callbacks"
    descricao: "Passe funções como argumento"
quiz:
  - pergunta: "O que o método filter retorna?"
    opcoes: ["O primeiro elemento encontrado", "Um novo array com os elementos que passam no teste", "true ou false", "O array original modificado"]
    correta: 1
    explicacao: "filter() cria um novo array só com os elementos que passam na condição."
    explicacaoErrada: "filter() não muda o original — devolve um novo array filtrado."
  - pergunta: "Qual método transforma cada elemento e retorna um novo array?"
    opcoes: ["filter", "find", "map", "reduce"]
    correta: 2
    explicacao: "map() aplica uma função em cada elemento e devolve um novo array transformado."
    explicacaoErrada: "map() transforma. filter() filtra. find() busca um. reduce() acumula."
  - pergunta: "O que reduce faz?"
    opcoes: ["Remove elementos do array", "Acumula um valor percorrendo o array", "Reduz o tamanho do array", "Ordena o array"]
    correta: 1
    explicacao: "reduce() percorre o array juntando tudo em um único valor (soma, objeto, etc)."
    explicacaoErrada: "reduce() não remove nada — ele acumula. Exemplo: somar todos os números."
  - pergunta: "Qual a diferença entre some e every?"
    opcoes: ["São iguais", "some retorna true se ALGUM satisfaz; every retorna true se TODOS satisfazem", "some retorna array, every retorna boolean", "some é mais rápido"]
    correta: 1
    explicacao: "some() = pelo menos um passa. every() = todos passam. Ambos devolvem true/false."
    explicacaoErrada: "some() checa se ALGUM passa. every() checa se TODOS passam."
---

## Por que usar métodos funcionais?

Você já percorreu arrays com `for`. Métodos funcionais fazem a mesma coisa, só que em menos código.

Regra de ouro: **eles nunca mudam o array original** — sempre devolvem algo novo.

## filter — selecionar elementos

Pense num filtro de café: só passa o que interessa.

```typescript
const notas: number[] = [8.5, 7.0, 9.5, 6.0, 5.5];

const aprovados = notas.filter((nota) => nota >= 7);
console.log(aprovados); // → [8.5, 7.0, 9.5]

const reprovados = notas.filter((nota) => nota < 7);
console.log(reprovados); // → [6.0, 5.5]
```

A função retorna `true` (fica) ou `false` (sai).

## map — transformar cada elemento

Como uma fábrica: entra uma coisa, sai outra.

```typescript
const notas: number[] = [8.5, 7.0, 9.5, 6.0, 5.5];

const arredondadas = notas.map((nota) => Math.round(nota));
console.log(arredondadas); // → [9, 7, 10, 6, 6]

const comBonus = notas.map((nota) => nota + 0.5);
console.log(comBonus); // → [9.0, 7.5, 10.0, 6.5, 6.0]
```

> [!info]
> `map` sempre devolve um array do mesmo tamanho.

## reduce — acumular um valor

Imagina somar todas as compras do carrinho numa única conta. Isso é o reduce.

```typescript
const notas: number[] = [8.5, 7.0, 9.5, 6.0, 5.5];

const soma = notas.reduce((acumulador, nota) => acumulador + nota, 0);
console.log(soma); // → 36.5

const média = soma / notas.length;
console.log(média); // → 7.3
```

Recebe dois argumentos: uma função `(acumulador, elementoAtual)` é o valor inicial (`0`).

### Exemplo: contar votos

```typescript
const votos: string[] = ["A", "B", "A", "C", "B", "A"];

const contagem = votos.reduce((acc, voto) => {
  acc[voto] = (acc[voto] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log(contagem); // → { A: 3, B: 2, C: 1 }
```

## find — encontrar o primeiro

Devolve o **primeiro** elemento que bate com a condição. Se não achar, devolve `undefined`.

```typescript
const notas: number[] = [8.5, 7.0, 9.5, 6.0, 5.5];

const primeiraBaixa = notas.find((nota) => nota < 7);
console.log(primeiraBaixa); // → 6.0

const notaDez = notas.find((nota) => nota === 10);
console.log(notaDez); // → undefined
```

> [!alerta]
> `find` devolve UM elemento (ou `undefined`). Se quiser todos, use `filter`.

## some e every — verificar condições

```typescript
const notas: number[] = [8.5, 7.0, 9.5, 6.0, 5.5];

// some — ALGUM satisfaz?
const temReprovado = notas.some((nota) => nota < 7);
console.log(temReprovado); // → true

// every — TODOS satisfazem?
const todosAprovados = notas.every((nota) => nota >= 7);
console.log(todosAprovados); // → false
```

Ambos devolvem `true` ou `false`.

## Encadeando métodos

Você pode ligar um método no outro, como peças de Lego:

```typescript
const números: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const resultado = números
  .filter((n) => n % 2 === 0)    // → [2, 4, 6, 8, 10]
  .map((n) => n * 3)             // → [6, 12, 18, 24, 30]
  .reduce((acc, n) => acc + n, 0); // → 90

console.log(resultado); // → 90
```

> [!sucesso]
> **Resumo:** `filter` seleciona, `map` transforma, `reduce` acumula, `find` busca um, `some`/`every` verificam. Nenhum muda o array original.

## Referências

- [Array.prototype.map() - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/map) — documentação de map, filter, reduce e outros métodos funcionais
- [JavaScript Array Methods - W3Schools](https://www.w3schools.com/js/js_array_methods.asp) — tutorial interativo sobre filter, map, reduce, find, some e every
- [Métodos de Array (map, filter, reduce) - Filipe Deschamps](https://www.youtube.com/watch?v=NhHB79zSTdg) — vídeo explicando os principais métodos funcionais de arrays
