---
slug: "arrays-basics"
modulo: "Módulo 4 — Dados e Funções"
título: "Arrays"
subtitulo: "Guardando vários valores em uma lista"
descricao: "Criar, acessar, modificar e percorrer arrays em TypeScript."
ordem: 10
proximosPassos:
  - título: "Métodos funcionais"
    descricao: "filter, map, reduce e mais"
  - título: "Funções"
    descricao: "Organize código em blocos reutilizáveis"
quiz:
  - pergunta: "Qual é o índice do primeiro elemento de um array?"
    opcoes: ["1", "0", "-1", "Depende do array"]
    correta: 1
    explicacao: "✓ Arrays começam no índice 0. Primeiro é [0], segundo é [1]."
    explicacaoErrada: "✗ O primeiro elemento está no índice 0, sempre."
  - pergunta: "O que faz o método push()?"
    opcoes: ["Remove o primeiro elemento", "Adiciona um elemento no final", "Ordena o array", "Remove o último elemento"]
    correta: 1
    explicacao: "✓ push() adiciona no final. pop() remove do final."
    explicacaoErrada: "✗ push = adiciona no final. pop = remove do final."
---

## O que é um array?

Um array é uma lista ordenada. Em vez de criar 30 variáveis para 30 notas de alunos, você coloca tudo em uma lista:

```typescript
const notas: number[] = [8.5, 7.0, 9.2, 6.8];
const nomes: string[] = ["Ana", "Bob", "Carlos"];
const aprovados: boolean[] = [true, true, false, true];
```

`number[]` = lista de números. `string[]` = lista de strings.

> [!info]
> Também existe a sintaxe `Array<number>`, mas `number[]` é mais comum.

## Acessando elementos (índice começa em 0)

Cada item tem uma posição (índice), começando do 0:

```typescript
const frutas: string[] = ["maçã", "banana", "uva", "manga"];

console.log(frutas[0]);     // → "maçã" (primeiro)
console.log(frutas[2]);     // → "uva" (terceiro)
console.log(frutas.length); // → 4
```

Visualizando:

```
Índice:   0        1        2       3
Valor:  "maçã"  "banana"  "uva"  "manga"
```

Para pegar o último sem saber o tamanho:

```typescript
const ultimo = frutas[frutas.length - 1]; // → "manga"
```

> [!alerta]
> `frutas[10]` não dá erro — retorna `undefined`. Sempre verifique se o índice existe.

## Modificando arrays

Mesmo com `const`, o conteúdo pode mudar (o `const` só impede trocar o array inteiro):

```typescript
const lista: string[] = ["a", "b", "c"];

lista.push("d");       // adiciona no final    → ["a","b","c","d"]
lista.pop();            // remove do final      → ["a","b","c"]
lista.unshift("z");     // adiciona no início   → ["z","a","b","c"]
lista.shift();          // remove do início     → ["a","b","c"]
lista[1] = "X";        // muda posição 1       → ["a","X","c"]
```

| Método      | O que faz               | Retorna                |
| ----------- | ----------------------- | ---------------------- |
| `push()`    | Adiciona no final       | Novo tamanho           |
| `pop()`     | Remove do final         | Elemento removido      |
| `unshift()` | Adiciona no início      | Novo tamanho           |
| `shift()`   | Remove do início        | Elemento removido      |
| `splice()`  | Remove/insere no meio   | Array dos removidos    |

### splice --- mexendo no meio

```typescript
const cores: string[] = ["vermelho", "azul", "verde", "amarelo"];

cores.splice(1, 1);           // remove 1 a partir do índice 1
// → ["vermelho", "verde", "amarelo"]

cores.splice(1, 0, "roxo");   // insere "roxo" no índice 1
// → ["vermelho", "roxo", "verde", "amarelo"]
```

## Métodos úteis

```typescript
const números: number[] = [3, 1, 4, 1, 5, 9];

números.includes(5);  // → true (contém 5?)
números.indexOf(4);   // → 2 (em qual posição?)
```

## Percorrendo arrays

Com `for...of` (mais limpo):

```typescript
const alunos: string[] = ["Ana", "Bob", "Carlos"];

for (const aluno of alunos) {
  console.log(`Aluno: ${aluno}`);
}
// → Aluno: Ana
// → Aluno: Bob
// → Aluno: Carlos
```

Com `for` clássico (quando precisa do índice):

```typescript
for (let i: number = 0; i < alunos.length; i++) {
  console.log(`${i + 1}. ${alunos[i]}`);
}
// → 1. Ana
// → 2. Bob
// → 3. Carlos
```

## Padroes comuns

### Encontrar o maior valor

```typescript
const valores: number[] = [45, 12, 78, 34, 91, 23];
let maior: number = valores[0];

for (const valor of valores) {
  if (valor > maior) maior = valor;
}

console.log(maior); // → 91
```

### Contar ocorrências

```typescript
const votos: string[] = ["A", "B", "A", "C", "B", "A", "A"];
let votosA: number = 0;

for (const voto of votos) {
  if (voto === "A") votosA++;
}

console.log(votosA); // → 4
```

### Criar array a partir de outro

```typescript
const celsius: number[] = [0, 20, 37, 100];
const fahrenheit: number[] = [];

for (const c of celsius) {
  fahrenheit.push((c * 9) / 5 + 32);
}

console.log(fahrenheit); // → [32, 68, 98.6, 212]
```

## Exercício prático

Dado um array de notas:

1. Calcule a média
2. Filtre os aprovados (nota >= 7)
3. Encontre a maior e a menor nota

```typescript
const notas: number[] = [8.5, 6.0, 9.2, 4.5, 7.0, 5.5, 8.0, 3.0];

// 1. Some tudo com for, divida por notas.length

// 2. Crie um novo array e use push para notas >= 7

// 3. Use for para achar a maior é menor
```

> [!info]
> Na próxima aula, você vai aprender a encapsular essa lógica em funções reutilizáveis.

## Referências

- [Array - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array) — documentação completa de arrays com todos os métodos disponíveis
- [JavaScript Arrays - W3Schools](https://www.w3schools.com/js/js_arrays.asp) — tutorial interativo sobre criação, acesso e manipulação de arrays
- [Arrays em JavaScript - Curso em Vídeo](https://www.youtube.com/watch?v=defBuY0nLrc) — aula sobre arrays, índices e métodos push, pop, shift e splice
