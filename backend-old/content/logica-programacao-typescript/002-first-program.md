---
slug: "first-program"
modulo: "Módulo 1 — Começando a Programar"
título: "Primeiro Programa"
subtitulo: "Escreva e rode seu primeiro código em TypeScript"
descricao: "console.log, strings, números, comentários — o básico para começar a programar."
ordem: 2
proximosPassos:
  - título: "Variáveis e tipos"
    descricao: "Guarde dados no programa"
  - título: "Operadores"
    descricao: "Some, subtraia e compare valores"
quiz:
  - pergunta: "O que console.log faz?"
    opcoes: ["Cria uma variável", "Exibe uma mensagem no terminal", "Salva um arquivo", "Abre o navegador"]
    correta: 1
    explicacao: "✓ console.log mostra valores no terminal."
    explicacaoErrada: "✗ console.log exibe mensagens no terminal — é sua principal ferramenta de saída."
  - pergunta: "Como se escreve um texto (string) em JavaScript/TypeScript?"
    opcoes: ["Entre parênteses: (texto)", "Entre colchetes: [texto]", "Entre aspas: \"texto\"", "Entre chaves: {texto}"]
    correta: 2
    explicacao: "✓ Strings ficam entre aspas: \"texto\", 'texto' ou `texto`."
    explicacaoErrada: "✗ Texto (string) sempre vai entre aspas: \"texto\", 'texto' ou `texto`."
  - pergunta: "Qual é o símbolo para comentário de uma linha?"
    opcoes: ["#", "//", "<!-- -->", "**"]
    correta: 1
    explicacao: "✓ // comenta uma linha. Tudo depois é ignorado."
    explicacaoErrada: "✗ Comentário de uma linha começa com //. O # é de outras linguagens."
  - pergunta: "O que acontece ao executar: console.log(Olá) (sem aspas)?"
    opcoes: ["Exibe 'Olá'", "Exibe 'undefined'", "Dá erro", "Não faz nada"]
    correta: 2
    explicacao: "✓ Sem aspas, o programa procura uma variável chamada 'Olá' — como não existe, dá erro."
    explicacaoErrada: "✗ Sem aspas, 'Olá' vira nome de variável. Como ela não existe, dá erro."
---

## Olá, mundo!

Todo programador começa aqui. Crie `ola.ts`:

```typescript
console.log("Olá, mundo!"); // → Olá, mundo!
```

Rode no terminal:

```bash
npx tsx ola.ts
```

- **`console.log`** — mostra valores no terminal
- **`"Olá, mundo!"`** — é uma **string** (texto). Sempre entre aspas.

> [!sucesso]
> Viu "Olá, mundo!" no terminal? Seu primeiro programa funcionou.

## Regras básicas

```typescript
// Comentário de uma linha (ignorado pelo programa)

/*
  Comentário de
  múltiplas linhas
*/

console.log("Primeira"); // → Primeira
console.log("Segunda");  // → Segunda
```

O código roda **de cima para baixo**, uma linha por vez.

## Strings e números

O programa trata texto e números de formas diferentes:

```typescript
console.log("Texto entre aspas"); // → Texto entre aspas
console.log(42);                  // → 42
console.log(3.14);                // → 3.14
console.log("2 + 2 =", 2 + 2);   // → 2 + 2 = 4
```

`"42"` é texto. `42` é número. Isso muda tudo na hora de calcular:

```typescript
console.log(10 + 5);     // → 15 (soma)
console.log("10" + "5"); // → "105" (juntou os textos!)
```

> [!alerta]
> `+` com números soma. `+` com strings junta os textos. `"10" + "5"` vira `"105"`, não `15`.

## Mais exemplos

```typescript
console.log("Nome:", "Ana", "| Idade:", 20);  // → Nome: Ana | Idade: 20
console.log("Dobro de 7:", 7 * 2);            // → Dobro de 7: 14
console.log(`3 + 4 = ${3 + 4}`);              // → 3 + 4 = 7
```

## Erros comuns

**Sem aspas no texto:**

```typescript
console.log(Olá);   // ✗ procura variável "Olá" → ERRO
console.log("Olá"); // ✓
```

**Sem parênteses:**

```typescript
console.log "Olá";  // ✗ ERRO
console.log("Olá"); // ✓
```

**Maiúsculas erradas:**

```typescript
Console.Log("Olá"); // ✗ não existe
console.log("Olá"); // ✓ tudo minúsculo
```

> [!alerta]
> TypeScript diferencia maiúsculas de minúsculas. `console.log` funciona, `Console.Log` não.

> [!info]
> Erros fazem parte. Leia a mensagem de erro, veja a linha indicada e corrija.

## Referências

- [Console.log() - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/API/console/log_static) — documentação oficial do console.log com exemplos práticos
- [JavaScript Output - W3Schools](https://www.w3schools.com/js/js_output.asp) — formas de exibir dados em JavaScript, incluindo console.log
- [Primeiro Programa em TypeScript - Rafaella Ballerini](https://www.youtube.com/watch?v=GMppyAPbLYk) — vídeo introdutório sobre como começar a programar com TypeScript
