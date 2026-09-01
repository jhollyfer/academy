---
slug: "funcoes-agregacao"
modulo: "Modulo 3 -- Consultas Avancadas"
titulo: "Funcoes de Agregacao"
subtitulo: "COUNT, SUM, AVG, MIN e MAX"
descricao: "Aprenda a usar funcoes de agregacao para resumir dados: contar registros, somar valores, calcular medias e encontrar extremos."
ordem: 10
proximosPassos:
  - titulo: "GROUP BY e HAVING"
    descricao: "Agrupando dados e filtrando grupos com HAVING"
  - titulo: "Relacionando Tabelas"
    descricao: "JOIN para conectar dados de tabelas diferentes"
quiz:
  - pergunta: "Qual a diferenca entre COUNT(*) e COUNT(coluna)?"
    opcoes: ["Nao ha diferenca", "COUNT(*) conta todas as linhas, COUNT(coluna) ignora NULLs", "COUNT(coluna) e mais rapido", "COUNT(*) conta apenas NULLs"]
    correta: 1
    explicacao: "COUNT(*) conta todas as linhas (inclusive com NULL). COUNT(coluna) ignora linhas onde a coluna e NULL."
    explicacaoErrada: "COUNT(*) conta TODAS as linhas. COUNT(coluna) pula as linhas onde aquela coluna e NULL."
  - pergunta: "O que AVG faz com valores NULL?"
    opcoes: ["Trata como zero", "Ignora os NULLs no calculo", "Retorna NULL se houver qualquer NULL", "Da erro"]
    correta: 1
    explicacao: "AVG ignora NULLs. Se voce tem valores 10, NULL, 30, o AVG e (10+30)/2 = 20, nao (10+0+30)/3."
    explicacaoErrada: "AVG ignora NULLs completamente. Eles nao entram nem no somatorio nem na contagem."
  - pergunta: "Qual funcao retorna o menor valor de uma coluna?"
    opcoes: ["LEAST", "MIN", "MINIMUM", "LOWEST"]
    correta: 1
    explicacao: "MIN retorna o menor valor. Funciona com numeros, datas e ate strings (ordem alfabetica)."
    explicacaoErrada: "A funcao e MIN. LEAST existe, mas compara valores passados como parametro, nao uma coluna inteira."
  - pergunta: "Posso usar WHERE junto com funcoes de agregacao?"
    opcoes: ["Nao, funcoes de agregacao nao aceitam WHERE", "Sim, WHERE filtra as linhas ANTES da agregacao", "Sim, mas precisa usar HAVING em vez de WHERE", "Sim, WHERE filtra DEPOIS da agregacao"]
    correta: 1
    explicacao: "WHERE filtra as linhas primeiro, depois a funcao de agregacao roda sobre o resultado filtrado."
    explicacaoErrada: "WHERE filtra ANTES da agregacao. HAVING filtra DEPOIS (sobre os grupos). Sao complementares."
  - pergunta: "No Prisma, como calcular a media de precos dos produtos?"
    opcoes: ["prisma.produto.avg({ preco: true })", "prisma.produto.aggregate({ _avg: { preco: true } })", "prisma.produto.findMany({ avg: 'preco' })", "prisma.produto.average('preco')"]
    correta: 1
    explicacao: "No Prisma, funcoes de agregacao usam o metodo aggregate() com prefixo _ (_avg, _sum, _count, etc)."
    explicacaoErrada: "O Prisma usa aggregate() com operadores prefixados por underscore: _avg, _sum, _min, _max, _count."
---

## O que sao funcoes de agregacao?

Funcoes de agregacao pegam **varias linhas** e retornam **um unico valor**. Em vez de ver cada registro individualmente, voce obtem um resumo: quantos registros existem, qual a soma, a media, o menor ou o maior valor.

As cinco funcoes principais sao:

| Funcao | O que faz |
|--------|-----------|
| `COUNT` | Conta registros |
| `SUM` | Soma valores |
| `AVG` | Calcula a media |
| `MIN` | Encontra o menor valor |
| `MAX` | Encontra o maior valor |

## COUNT -- contando registros

```sql
-- Quantos usuarios existem?
SELECT COUNT(*) FROM usuarios;
-- → 1523

-- Quantos usuarios tem telefone cadastrado?
SELECT COUNT(telefone) FROM usuarios;
-- → 1204 (ignora NULLs)

-- Quantos usuarios ativos existem?
SELECT COUNT(*) FROM usuarios WHERE status = 'ativo';
-- → 1389

-- Quantas cidades diferentes temos?
SELECT COUNT(DISTINCT cidade) FROM usuarios;
-- → 47
```

> [!info]
> `COUNT(*)` conta TODAS as linhas, inclusive aquelas com NULL em alguma coluna. `COUNT(coluna)` ignora linhas onde aquela coluna e NULL.

## SUM -- somando valores

```sql
-- Valor total de todos os pedidos
SELECT SUM(valor_total) FROM pedidos;
-- → 458320.50

-- Valor total dos pedidos de janeiro
SELECT SUM(valor_total) FROM pedidos
WHERE data_criacao BETWEEN '2025-01-01' AND '2025-01-31';
-- → 52340.00

-- Total de itens em estoque
SELECT SUM(estoque) FROM produtos WHERE categoria = 'eletronicos';
-- → 3420
```

> [!alerta]
> SUM so funciona com colunas numericas. Se tentar somar texto, vai dar erro.

## AVG -- calculando a media

```sql
-- Idade media dos usuarios
SELECT AVG(idade) FROM usuarios;
-- → 28.5

-- Preco medio dos produtos
SELECT AVG(preco) FROM produtos;
-- → 149.90

-- Nota media dos alunos aprovados
SELECT AVG(nota) FROM alunos WHERE nota >= 7;
-- → 8.3

-- Media arredondada com 2 casas decimais
SELECT ROUND(AVG(preco), 2) FROM produtos;
-- → 149.90
```

> [!info]
> AVG ignora valores NULL. Se voce tem valores 10, NULL, 30, a media e (10+30)/2 = 20, nao (10+0+30)/3 = 13.33. Se quiser tratar NULL como zero, use `AVG(COALESCE(coluna, 0))`.

## MIN e MAX -- encontrando extremos

```sql
-- Produto mais barato
SELECT MIN(preco) FROM produtos;
-- → 5.90

-- Produto mais caro
SELECT MAX(preco) FROM produtos;
-- → 4999.99

-- Usuario mais novo e mais velho
SELECT MIN(idade), MAX(idade) FROM usuarios;
-- → 16 | 72

-- Primeiro e ultimo cadastro
SELECT MIN(data_criacao), MAX(data_criacao) FROM usuarios;
-- → 2023-01-15 | 2025-03-28

-- MIN e MAX com strings (ordem alfabetica)
SELECT MIN(nome), MAX(nome) FROM usuarios;
-- → Abel | Zuleica
```

## Combinando funcoes de agregacao

Voce pode usar varias funcoes na mesma query:

```sql
-- Resumo completo de produtos
SELECT
  COUNT(*) AS total_produtos,
  SUM(estoque) AS total_estoque,
  ROUND(AVG(preco), 2) AS preco_medio,
  MIN(preco) AS mais_barato,
  MAX(preco) AS mais_caro
FROM produtos;
-- → 150 | 8430 | 149.90 | 5.90 | 4999.99

-- Resumo de pedidos do mes
SELECT
  COUNT(*) AS total_pedidos,
  SUM(valor_total) AS faturamento,
  ROUND(AVG(valor_total), 2) AS ticket_medio,
  MIN(valor_total) AS menor_pedido,
  MAX(valor_total) AS maior_pedido
FROM pedidos
WHERE data_criacao >= '2025-03-01';
```

## Combinando com WHERE

O WHERE filtra as linhas **antes** da agregacao rodar:

```sql
-- Media de preco apenas de eletronicos
SELECT AVG(preco) FROM produtos WHERE categoria = 'eletronicos';

-- Total vendido por um vendedor especifico
SELECT SUM(valor_total) FROM pedidos WHERE vendedor_id = 5;

-- Quantos pedidos acima de R$100
SELECT COUNT(*) FROM pedidos WHERE valor_total > 100;

-- Estatisticas apenas de usuarios ativos
SELECT
  COUNT(*) AS ativos,
  ROUND(AVG(idade), 1) AS idade_media,
  MIN(data_criacao) AS primeiro_cadastro
FROM usuarios
WHERE status = 'ativo';
```

## No Prisma

```typescript
// COUNT
const total = await prisma.usuario.count()
const ativos = await prisma.usuario.count({ where: { status: 'ativo' } })

// Aggregate (SUM, AVG, MIN, MAX)
const stats = await prisma.produto.aggregate({
  _sum: { preco: true, estoque: true },
  _avg: { preco: true },
  _min: { preco: true },
  _max: { preco: true },
  _count: true
})
// → stats._avg.preco = 149.90
// → stats._sum.estoque = 8430
// → stats._min.preco = 5.90
// → stats._count = 150

// Aggregate com WHERE
const eletronicos = await prisma.produto.aggregate({
  _avg: { preco: true },
  _count: true,
  where: { categoria: 'eletronicos' }
})

// COUNT DISTINCT (via groupBy + contagem)
const cidadesUnicas = await prisma.usuario.groupBy({
  by: ['cidade']
})
// → cidadesUnicas.length = numero de cidades distintas
```

## No Drizzle

```typescript
import { count, sum, avg, min, max } from 'drizzle-orm'

// COUNT
const [{ total }] = await db.select({ total: count() }).from(usuarios)

// COUNT com WHERE
const [{ ativos }] = await db.select({ ativos: count() }).from(usuarios)
  .where(eq(usuarios.status, 'ativo'))

// Todas as agregacoes de uma vez
const [stats] = await db.select({
  total: count(),
  somaEstoque: sum(produtos.estoque),
  precoMedio: avg(produtos.preco),
  maisBarato: min(produtos.preco),
  maisCaro: max(produtos.preco)
}).from(produtos)

// Com WHERE
const [eletronicos] = await db.select({
  total: count(),
  precoMedio: avg(produtos.preco)
}).from(produtos)
  .where(eq(produtos.categoria, 'eletronicos'))

// COUNT DISTINCT
import { countDistinct } from 'drizzle-orm'
const [{ cidades }] = await db.select({
  cidades: countDistinct(usuarios.cidade)
}).from(usuarios)
```

## No Lucid (AdonisJS)

```typescript
// COUNT
const total = await Usuario.query().count('* as total')
// → total[0].$extras.total = 1523

// Forma mais limpa com getCount
const ativos = await Usuario.query().where('status', 'ativo').getCount()
// → ativos = 1389

// SUM
const faturamento = await Pedido.query().sum('valor_total as total')
// → faturamento[0].$extras.total

// AVG
const media = await Produto.query().avg('preco as media')
// → media[0].$extras.media

// MIN e MAX
const extremos = await Produto.query()
  .min('preco as mais_barato')
  .max('preco as mais_caro')
// → extremos[0].$extras.mais_barato
// → extremos[0].$extras.mais_caro

// Combinando com WHERE
const statsEletronicos = await Produto.query()
  .where('categoria', 'eletronicos')
  .count('* as total')
  .avg('preco as preco_medio')
  .min('preco as mais_barato')
  .max('preco as mais_caro')

// COUNT DISTINCT
const { default: Database } = await import('@adonisjs/lucid/services/db')
const cidades = await Database.from('usuarios').countDistinct('cidade as total')
```

> [!info]
> No Lucid, os metodos de agregacao retornam o resultado em `$extras`. O metodo `getCount()` e um atalho que retorna o numero direto, sem precisar acessar `$extras`.

## Exercicios

1. Escreva uma query que retorne o total de pedidos, o faturamento total e o ticket medio (valor medio por pedido).
2. Encontre o produto mais caro e o mais barato de cada categoria (por enquanto, faca queries separadas -- GROUP BY vem na proxima aula).
3. Calcule quantos usuarios se cadastraram em cada mes de 2025 (use WHERE para filtrar cada mes).
4. Qual a diferenca entre `COUNT(*)` e `COUNT(email)` numa tabela onde alguns usuarios nao tem email?
5. Implemente um dashboard de estatisticas usando Prisma: total de usuarios, total de pedidos, faturamento total e ticket medio.

## Referencias

- [PostgreSQL Aggregate Functions](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [Prisma Aggregate](https://www.prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing)
- [Drizzle Aggregations](https://orm.drizzle.team/docs/select#aggregations)
- [Lucid Aggregate Helpers](https://docs.adonisjs.com/guides/database/query-builder#aggregate-helpers)
