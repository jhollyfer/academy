---
slug: "ordenando-resultados"
modulo: "Modulo 2 -- CRUD Basico"
titulo: "Ordenando e Limitando"
subtitulo: "ORDER BY, LIMIT e OFFSET para organizar resultados"
descricao: "Aprenda a ordenar resultados com ORDER BY, limitar com LIMIT e paginar com OFFSET. Implemente paginacao real na sua aplicacao."
ordem: 7
proximosPassos:
  - titulo: "Atualizando Dados"
    descricao: "UPDATE SET para modificar registros existentes"
  - titulo: "Funcoes de Agregacao"
    descricao: "COUNT, SUM, AVG, MIN e MAX para resumir dados"
quiz:
  - pergunta: "Qual a ordem padrao do ORDER BY quando nao especificamos ASC ou DESC?"
    opcoes: ["DESC (decrescente)", "ASC (crescente)", "Aleatorio", "Depende do banco de dados"]
    correta: 1
    explicacao: "O padrao e ASC (crescente). Se quiser decrescente, precisa escrever DESC explicitamente."
    explicacaoErrada: "Quando voce nao especifica, o ORDER BY usa ASC (crescente) por padrao."
  - pergunta: "Para pegar os registros da pagina 3 com 10 itens por pagina, qual o OFFSET correto?"
    opcoes: ["OFFSET 10", "OFFSET 20", "OFFSET 30", "OFFSET 3"]
    correta: 1
    explicacao: "Formula: OFFSET = (pagina - 1) * limite. Pagina 3: (3 - 1) * 10 = 20."
    explicacaoErrada: "A formula e (pagina - 1) * itens_por_pagina. Para pagina 3 com 10 itens: (3-1)*10 = 20."
  - pergunta: "O que acontece se voce usar LIMIT sem ORDER BY?"
    opcoes: ["Erro de sintaxe", "Retorna os primeiros N registros em ordem previsivel", "Retorna N registros em ordem imprevisivel", "Retorna todos os registros"]
    correta: 2
    explicacao: "Sem ORDER BY, o banco retorna em qualquer ordem. O resultado pode mudar entre execucoes."
    explicacaoErrada: "Sem ORDER BY, a ordem nao e garantida. Sempre combine LIMIT com ORDER BY para resultados previsiveis."
  - pergunta: "Como ordenar por nome crescente e, em caso de empate, por idade decrescente?"
    opcoes: ["ORDER BY nome, idade", "ORDER BY nome ASC, idade DESC", "ORDER BY nome DESC, idade ASC", "ORDER BY nome AND idade DESC"]
    correta: 1
    explicacao: "Cada coluna pode ter sua propria direcao. Nome ASC + idade DESC resolve empates por idade decrescente."
    explicacaoErrada: "Voce pode especificar direcao para cada coluna separadamente: ORDER BY nome ASC, idade DESC."
  - pergunta: "No Prisma, como fazer paginacao com 10 itens na pagina 2?"
    opcoes: ["{ limit: 10, offset: 10 }", "{ take: 10, skip: 10 }", "{ page: 2, perPage: 10 }", "{ first: 10, after: 10 }"]
    correta: 1
    explicacao: "No Prisma, take = LIMIT e skip = OFFSET. Pagina 2 com 10 itens: skip = (2-1)*10 = 10."
    explicacaoErrada: "O Prisma usa take (quantos pegar) e skip (quantos pular). Nao tem page/perPage nativo."
---

## ORDER BY -- organizando os resultados

Sem `ORDER BY`, o banco de dados retorna os registros em qualquer ordem. Pode ate parecer que esta ordenado, mas **nao ha garantia**. Se a ordem importa (e quase sempre importa), use ORDER BY.

```sql
-- Ordenar por nome (A-Z) -- ASC e o padrao
SELECT * FROM usuarios ORDER BY nome;
SELECT * FROM usuarios ORDER BY nome ASC;  -- mesmo resultado

-- Ordenar por idade (maior para menor)
SELECT * FROM usuarios ORDER BY idade DESC;

-- Produtos mais caros primeiro
SELECT * FROM produtos ORDER BY preco DESC;
```

## Ordenando por multiplas colunas

Quando dois registros tem o mesmo valor na primeira coluna, o banco usa a segunda coluna para desempatar:

```sql
-- Ordenar por cidade (A-Z), e dentro de cada cidade, por nome (A-Z)
SELECT * FROM usuarios ORDER BY cidade ASC, nome ASC;

-- Produtos por categoria (A-Z), e dentro de cada categoria, mais caros primeiro
SELECT * FROM produtos ORDER BY categoria ASC, preco DESC;

-- Pedidos mais recentes primeiro, desempatando por valor
SELECT * FROM pedidos ORDER BY data_criacao DESC, valor_total DESC;
```

> [!info]
> Cada coluna no ORDER BY pode ter sua propria direcao (ASC ou DESC). Nao precisa ser a mesma para todas.

## LIMIT -- limitando a quantidade

O `LIMIT` restringe quantos registros serao retornados:

```sql
-- Apenas os 10 primeiros usuarios
SELECT * FROM usuarios ORDER BY nome LIMIT 10;

-- Top 5 produtos mais caros
SELECT * FROM produtos ORDER BY preco DESC LIMIT 5;

-- O usuario mais novo
SELECT * FROM usuarios ORDER BY idade ASC LIMIT 1;
```

> [!alerta]
> Sempre use ORDER BY junto com LIMIT. Sem ORDER BY, voce nao sabe quais registros o LIMIT vai escolher -- o resultado e imprevisivel.

## OFFSET -- pulando registros

O `OFFSET` pula uma quantidade de registros antes de comecar a retornar. Junto com LIMIT, ele permite **paginacao**:

```sql
-- Pula os 10 primeiros, retorna os proximos 10
SELECT * FROM usuarios ORDER BY nome LIMIT 10 OFFSET 10;

-- Pagina 1 (itens 1-10)
SELECT * FROM usuarios ORDER BY nome LIMIT 10 OFFSET 0;

-- Pagina 2 (itens 11-20)
SELECT * FROM usuarios ORDER BY nome LIMIT 10 OFFSET 10;

-- Pagina 3 (itens 21-30)
SELECT * FROM usuarios ORDER BY nome LIMIT 10 OFFSET 20;
```

## Formula da paginacao

A formula e simples:

```
OFFSET = (pagina - 1) * itens_por_pagina
```

```sql
-- Pagina 1, 20 itens: OFFSET = (1-1) * 20 = 0
SELECT * FROM produtos ORDER BY id LIMIT 20 OFFSET 0;

-- Pagina 4, 20 itens: OFFSET = (4-1) * 20 = 60
SELECT * FROM produtos ORDER BY id LIMIT 20 OFFSET 60;

-- Pagina 10, 15 itens: OFFSET = (10-1) * 15 = 135
SELECT * FROM produtos ORDER BY id LIMIT 15 OFFSET 135;
```

> [!info]
> Para saber o total de paginas, divida o total de registros pelos itens por pagina: `Math.ceil(totalRegistros / itensPorPagina)`.

## No Prisma

```typescript
// ORDER BY simples
const porNome = await prisma.usuario.findMany({
  orderBy: { nome: 'asc' }
})

// ORDER BY multiplas colunas
const ordenado = await prisma.usuario.findMany({
  orderBy: [
    { cidade: 'asc' },
    { nome: 'asc' }
  ]
})

// LIMIT
const top5 = await prisma.produto.findMany({
  orderBy: { preco: 'desc' },
  take: 5
})

// Paginacao completa
const pagina = 3
const itensPorPagina = 10

const usuarios = await prisma.usuario.findMany({
  orderBy: { nome: 'asc' },
  take: itensPorPagina,
  skip: (pagina - 1) * itensPorPagina
})

// Contando o total para calcular paginas
const total = await prisma.usuario.count()
const totalPaginas = Math.ceil(total / itensPorPagina)
```

## No Drizzle

```typescript
import { asc, desc } from 'drizzle-orm'

// ORDER BY simples
const porNome = await db.select().from(usuarios).orderBy(asc(usuarios.nome))

// ORDER BY multiplas colunas
const ordenado = await db.select().from(usuarios)
  .orderBy(asc(usuarios.cidade), asc(usuarios.nome))

// LIMIT
const top5 = await db.select().from(produtos)
  .orderBy(desc(produtos.preco))
  .limit(5)

// Paginacao completa
const pagina = 3
const itensPorPagina = 10

const resultado = await db.select().from(usuarios)
  .orderBy(asc(usuarios.nome))
  .limit(itensPorPagina)
  .offset((pagina - 1) * itensPorPagina)

// Contando o total
import { count } from 'drizzle-orm'
const [{ total }] = await db.select({ total: count() }).from(usuarios)
const totalPaginas = Math.ceil(total / itensPorPagina)
```

## No Lucid (AdonisJS)

```typescript
// ORDER BY simples
const porNome = await Usuario.query().orderBy('nome', 'asc')

// ORDER BY multiplas colunas
const ordenado = await Usuario.query()
  .orderBy('cidade', 'asc')
  .orderBy('nome', 'asc')

// LIMIT
const top5 = await Produto.query().orderBy('preco', 'desc').limit(5)

// Paginacao completa (Lucid tem metodo paginate!)
const pagina = 3
const itensPorPagina = 10

const resultado = await Usuario.query()
  .orderBy('nome', 'asc')
  .paginate(pagina, itensPorPagina)

// resultado.total       -- → total de registros
// resultado.perPage     -- → itens por pagina
// resultado.currentPage -- → pagina atual
// resultado.lastPage    -- → ultima pagina

// Paginacao manual com offset
const manual = await Usuario.query()
  .orderBy('nome', 'asc')
  .limit(itensPorPagina)
  .offset((pagina - 1) * itensPorPagina)
```

> [!info]
> O Lucid tem o metodo `paginate()` que ja calcula tudo pra voce. E a forma mais pratica de fazer paginacao no AdonisJS.

## Exercicios

1. Escreva uma query que retorne os 3 produtos mais baratos de uma loja.
2. Implemente paginacao: busque a pagina 5 com 15 itens por pagina, ordenando por data de cadastro (mais recente primeiro).
3. Ordene usuarios por estado (A-Z) e, dentro de cada estado, por nome (A-Z). Retorne apenas os 20 primeiros.
4. Usando Lucid, implemente um endpoint de listagem com paginacao usando o metodo `paginate()`.
5. Calcule quantas paginas existem se voce tem 247 registros e exibe 20 por pagina.

## Referencias

- [PostgreSQL ORDER BY](https://www.postgresql.org/docs/current/queries-order.html)
- [PostgreSQL LIMIT/OFFSET](https://www.postgresql.org/docs/current/queries-limit.html)
- [Prisma Pagination](https://www.prisma.io/docs/orm/prisma-client/queries/pagination)
- [Drizzle Limit/Offset](https://orm.drizzle.team/docs/select#limit--offset)
- [Lucid Pagination](https://docs.adonisjs.com/guides/database/pagination)
