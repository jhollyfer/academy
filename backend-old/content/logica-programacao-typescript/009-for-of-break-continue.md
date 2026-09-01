---
slug: "for-of-break-continue"
modulo: "Módulo 3 — Controle de Fluxo"
título: "for...of, break e continue"
subtitulo: "Percorrendo arrays e controlando loops"
descricao: "for...of para iterar arrays, break para parar e continue para pular."
ordem: 9
proximosPassos:
  - título: "Arrays"
    descricao: "Crie e manipule arrays"
  - título: "Métodos funcionais"
    descricao: "filter, map, reduce e mais"
quiz:
  - pergunta: "Qual a vantagem do for...of sobre o for clássico?"
    opcoes: ["É mais rápido", "Acessa o valor diretamente sem precisar de índice", "Funciona com números", "Permite modificar o array"]
    correta: 1
    explicacao: "✓ for...of te dá o valor direto, sem precisar de índice."
    explicacaoErrada: "✗ for...of é mais limpo quando você só precisa do valor, sem índice."
  - pergunta: "O que o break faz dentro de um loop?"
    opcoes: ["Pula para a próxima iteração", "Encerra o loop completamente", "Pausa o loop temporariamente", "Reinicia o loop"]
    correta: 1
    explicacao: "✓ break encerra o loop inteiro. A execução continua após o loop."
    explicacaoErrada: "✗ break sai do loop. Para pular uma iteração, use continue."
  - pergunta: "O que o continue faz dentro de um loop?"
    opcoes: ["Encerra o loop", "Pula o restante da iteração atual e vai para a próxima", "Continua executando normalmente", "Reinicia o loop do início"]
    correta: 1
    explicacao: "✓ continue pula o resto da volta atual e vai para a próxima."
    explicacaoErrada: "✗ continue não encerra o loop — pula a volta atual e segue para a próxima."
---

## for...of --- percorrendo arrays

O `for...of` pega cada item do array direto, sem precisar de índice. É como passar por uma fila de pessoas — você fala com cada uma na ordem:

```typescript
const nomes: string[] = ["Ana", "Bruno", "Carol"];

for (const nome of nomes) {
  console.log(`Olá, ${nome}!`);
}
// → Olá, Ana!
// → Olá, Bruno!
// → Olá, Carol!
```

Muito mais limpo que `for (let i = 0; i < nomes.length; i++)`.

### Somando notas

```typescript
const notas: number[] = [8.5, 7.0, 9.2, 6.8];
let total: number = 0;

for (const nota of notas) {
  total += nota;
}

const média: number = total / notas.length;
console.log(`Média: ${média.toFixed(1)}`); // → Média: 7.9
```

> [!info]
> Use `for...of` quando precisa só do **valor**. Se precisar do **índice**, use o `for` clássico.

## break --- parar o loop

O `break` encerra o loop na hora. É como achar o que procurava é parar de procurar:

```typescript
const nomes: string[] = ["Ana", "Bob", "Carlos", "Diana"];
const busca: string = "Carlos";

for (const nome of nomes) {
  if (nome === busca) {
    console.log(`${busca} encontrado!`); // → Carlos encontrado!
    break;
  }
}
```

Outro exemplo:

```typescript
for (let i = 1; i <= 10; i++) {
  if (i === 7) break;
  console.log(i); // → 1, 2, 3, 4, 5, 6
}
```

## continue --- pular uma volta

O `continue` pula o resto da volta atual e vai para a próxima. É como ignorar algo que não interessa:

```typescript
const números: number[] = [12, -5, 8, -3, 20, 0, 15];

for (const num of números) {
  if (num <= 0) continue; // pula negativos e zero
  console.log(num);        // → 12, 8, 20, 15
}
```

Só ímpares:

```typescript
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue;
  console.log(i); // → 1, 3, 5, 7, 9
}
```

## Combinando break e continue

```typescript
for (let i: number = 1; i <= 10; i++) {
  if (i === 8) break;          // para no 8
  if (i % 2 === 0) continue;   // pula pares
  console.log(i);               // → 1, 3, 5, 7
}
```

> [!alerta]
> Use `break` e `continue` com moderação. Muitos deles no mesmo loop dificultam a leitura. Se ficou confuso, extraia a lógica para uma função.

## Exercício prático

Encontre o primeiro número primo no array é pare:

```typescript
const números: number[] = [4, 6, 8, 9, 11, 15, 17];

for (const n of números) {
  // Pule números menores que 2 com continue
  // Verifique se é primo
  // Se for primo, exiba e use break
}
```

> [!sucesso]
> **Resumo:** `for...of` percorre arrays. `break` para o loop. `continue` pula uma volta.

## Referências

- [for...of - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/for...of) — documentação oficial do for...of com exemplos de iteração
- [JavaScript Break and Continue - W3Schools](https://www.w3schools.com/js/js_break.asp) — tutorial interativo sobre break e continue em loops
- [For...of, Break e Continue - Programador BR](https://www.youtube.com/watch?v=NTs0IAfKhRs) — vídeo explicando como percorrer arrays e controlar o fluxo de loops
