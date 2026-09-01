---
slug: "filtrando-dados"
modulo: "Modulo 2 -- CRUD Basico"
titulo: "Filtrando com WHERE"
subtitulo: "Buscando exatamente o que voce precisa"
descricao: "Domine a clausula WHERE com todos os operadores: comparacao, BETWEEN, IN, LIKE, IS NULL e operadores logicos AND/OR."
ordem: 6
proximosPassos:
  - titulo: "Ordenando e Limitando"
    descricao: "ORDER BY, LIMIT e OFFSET para organizar resultados"
  - titulo: "Atualizando Dados"
    descricao: "UPDATE SET para modificar registros existentes"
quiz:
  - pergunta: "Qual operador SQL busca valores dentro de um intervalo (incluindo os extremos)?"
    opcoes: ["IN", "BETWEEN", "RANGE", "WITHIN"]
    correta: 1
    explicacao: "BETWEEN inclui os dois extremos. Ex: BETWEEN 18 AND 30 pega 18, 30 e tudo no meio."
    explicacaoErrada: "O operador correto e BETWEEN. IN busca em uma lista de valores, nao em um intervalo."
  - pergunta: "O que o caractere % faz no operador LIKE?"
    opcoes: ["Substitui exatamente um caractere", "Substitui zero ou mais caracteres", "Busca numeros", "Escapa caracteres especiais"]
    correta: 1
    explicacao: "O % e o coringa que substitui qualquer quantidade de caracteres (inclusive zero)."
    explicacaoErrada: "% substitui zero ou mais caracteres. Para substituir exatamente um, use _ (underline)."
  - pergunta: "Como verificar se um campo e nulo em SQL?"
    opcoes: ["WHERE campo = NULL", "WHERE campo == NULL", "WHERE campo IS NULL", "WHERE campo EQUALS NULL"]
    correta: 2
    explicacao: "NULL nao e um valor, e a ausencia de valor. Por isso usamos IS NULL, nao = NULL."
    explicacaoErrada: "Para comparar com NULL, sempre use IS NULL. O operador = nao funciona com NULL."
  - pergunta: "Qual a diferenca entre AND e OR no WHERE?"
    opcoes: ["AND retorna se QUALQUER condicao for verdadeira", "OR retorna se TODAS as condicoes forem verdadeiras", "AND exige que TODAS sejam verdadeiras, OR exige pelo menos uma", "Nao ha diferenca, sao sinonimos"]
    correta: 2
    explicacao: "AND e restritivo (todas devem ser verdadeiras). OR e permissivo (basta uma ser verdadeira)."
    explicacaoErrada: "AND exige TODAS verdadeiras. OR exige pelo menos UMA. Sao opostos, nao sinonimos."
  - pergunta: "No Prisma, como filtrar usuarios com idade maior que 18?"
    opcoes: ["where: { idade: { gt: 18 } }", "where: { idade: { greaterThan: 18 } }", "where: { idade: { $gt: 18 } }", "filter: { idade: > 18 }"]
    correta: 0
    explicacao: "No Prisma, operadores de comparacao usam abreviacoes: gt (greater than), gte, lt, lte."
    explicacaoErrada: "O Prisma usa gt para 'greater than'. Nao confunda com a sintaxe do MongoDB ($gt)."
---

## O que e o WHERE?

O `WHERE` e o filtro do SQL. Sem ele, toda consulta retorna **todos** os registros da tabela. Com ele, voce especifica exatamente quais linhas quer buscar. Pense no WHERE como um seguranca na porta: so passa quem cumpre as condicoes.

> [!info]
> Sempre que possivel, use WHERE nas suas consultas. Buscar todos os registros de uma tabela grande pode deixar seu sistema lento e consumir muita memoria.

## Operadores de comparacao

Os operadores basicos funcionam como na matematica:

```sql
-- Igual
SELECT * FROM usuarios WHERE idade = 25;

-- Diferente
SELECT * FROM usuarios WHERE status != 'inativo';
-- tambem funciona: WHERE status <> 'inativo'

-- Maior que
SELECT * FROM usuarios WHERE idade > 18;

-- Menor que
SELECT * FROM produtos WHERE preco < 50.00;

-- Maior ou igual
SELECT * FROM usuarios WHERE idade >= 21;

-- Menor ou igual
SELECT * FROM produtos WHERE estoque <= 10;
```

## BETWEEN -- intervalo de valores

Busca valores dentro de um intervalo, **incluindo os extremos**:

```sql
-- Usuarios entre 18 e 30 anos (inclui 18 e 30)
SELECT * FROM usuarios WHERE idade BETWEEN 18 AND 30;

-- Equivalente a:
SELECT * FROM usuarios WHERE idade >= 18 AND idade <= 30;

-- Produtos com preco entre 10 e 100
SELECT * FROM produtos WHERE preco BETWEEN 10.00 AND 100.00;
```

## IN -- lista de valores

Quando voce quer buscar varios valores especificos, use `IN` em vez de varios `OR`:

```sql
-- Usuarios de cidades especificas
SELECT * FROM usuarios WHERE cidade IN ('Sao Paulo', 'Rio de Janeiro', 'Curitiba');

-- Equivalente a (mas muito mais limpo):
SELECT * FROM usuarios
WHERE cidade = 'Sao Paulo'
   OR cidade = 'Rio de Janeiro'
   OR cidade = 'Curitiba';

-- Produtos de categorias especificas
SELECT * FROM produtos WHERE categoria_id IN (1, 3, 5, 7);
```

## LIKE -- busca por padrao

O `LIKE` permite buscas parciais usando dois coringas:

- `%` substitui **zero ou mais** caracteres
- `_` substitui **exatamente um** caractere

```sql
-- Nomes que comecam com 'Ana'
SELECT * FROM usuarios WHERE nome LIKE 'Ana%';
-- → Ana, Ana Paula, Anabela, Anastacia

-- Nomes que terminam com 'silva'
SELECT * FROM usuarios WHERE nome LIKE '%silva';
-- → Maria Silva, Joao Silva

-- Nomes que contem 'santos'
SELECT * FROM usuarios WHERE nome LIKE '%santos%';
-- → Carlos Santos, Ana Santos Lima

-- Emails do gmail
SELECT * FROM usuarios WHERE email LIKE '%@gmail.com';

-- Nomes com exatamente 3 letras
SELECT * FROM usuarios WHERE nome LIKE '___';
-- → Ana, Leo, Bia

-- Nomes que comecam com 'A' e tem 4 letras
SELECT * FROM usuarios WHERE nome LIKE 'A___';
-- → Anna, Aline nao (5 letras)
```

> [!alerta]
> O LIKE com `%` no inicio (ex: `%silva`) nao consegue usar indices. Em tabelas grandes, isso pode ser muito lento. Prefira colocar o `%` apenas no final quando possivel.

## IS NULL e IS NOT NULL

`NULL` nao e um valor -- e a **ausencia** de valor. Por isso, nao funciona com `=`:

```sql
-- ERRADO: nunca vai funcionar!
SELECT * FROM usuarios WHERE telefone = NULL;

-- CERTO: use IS NULL
SELECT * FROM usuarios WHERE telefone IS NULL;
-- → Usuarios que nao informaram telefone

-- Usuarios que TEM telefone
SELECT * FROM usuarios WHERE telefone IS NOT NULL;
```

## Operadores logicos: AND e OR

Combine condicoes para criar filtros mais precisos:

```sql
-- AND: TODAS as condicoes devem ser verdadeiras
SELECT * FROM usuarios
WHERE idade >= 18
  AND cidade = 'Sao Paulo'
  AND status = 'ativo';

-- OR: pelo menos UMA condicao deve ser verdadeira
SELECT * FROM usuarios
WHERE cidade = 'Sao Paulo'
   OR cidade = 'Rio de Janeiro';

-- Combinando AND e OR (use parenteses!)
SELECT * FROM usuarios
WHERE status = 'ativo'
  AND (cidade = 'Sao Paulo' OR cidade = 'Curitiba');
```

> [!alerta]
> Sempre use parenteses ao misturar AND e OR. Sem parenteses, o AND tem prioridade sobre o OR e o resultado pode nao ser o que voce espera.

## No Prisma

```typescript
// Comparacao simples
const adultos = await prisma.usuario.findMany({
  where: { idade: { gte: 18 } }
})

// BETWEEN
const faixaEtaria = await prisma.usuario.findMany({
  where: { idade: { gte: 18, lte: 30 } }
})

// IN
const cidades = await prisma.usuario.findMany({
  where: { cidade: { in: ['Sao Paulo', 'Curitiba'] } }
})

// LIKE (contains, startsWith, endsWith)
const gmail = await prisma.usuario.findMany({
  where: { email: { endsWith: '@gmail.com' } }
})

const busca = await prisma.usuario.findMany({
  where: { nome: { contains: 'santos', mode: 'insensitive' } }
})

// IS NULL
const semTelefone = await prisma.usuario.findMany({
  where: { telefone: null }
})

// AND (implicito -- todas as condicoes no mesmo objeto)
const filtro = await prisma.usuario.findMany({
  where: {
    idade: { gte: 18 },
    status: 'ativo',
    cidade: 'Sao Paulo'
  }
})

// OR (explicito)
const ouCidade = await prisma.usuario.findMany({
  where: {
    OR: [
      { cidade: 'Sao Paulo' },
      { cidade: 'Curitiba' }
    ]
  }
})
```

## No Drizzle

```typescript
import { eq, ne, gt, lt, gte, lte, between, inArray, like, isNull, isNotNull, and, or } from 'drizzle-orm'

// Comparacao simples
const adultos = await db.select().from(usuarios).where(gte(usuarios.idade, 18))

// BETWEEN
const faixa = await db.select().from(usuarios).where(between(usuarios.idade, 18, 30))

// IN
const cidades = await db.select().from(usuarios)
  .where(inArray(usuarios.cidade, ['Sao Paulo', 'Curitiba']))

// LIKE
const gmail = await db.select().from(usuarios)
  .where(like(usuarios.email, '%@gmail.com'))

// IS NULL
const semTel = await db.select().from(usuarios).where(isNull(usuarios.telefone))

// AND
const filtro = await db.select().from(usuarios).where(
  and(
    gte(usuarios.idade, 18),
    eq(usuarios.status, 'ativo')
  )
)

// OR
const ouCidade = await db.select().from(usuarios).where(
  or(
    eq(usuarios.cidade, 'Sao Paulo'),
    eq(usuarios.cidade, 'Curitiba')
  )
)
```

## No Lucid (AdonisJS)

```typescript
// Comparacao simples
const adultos = await Usuario.query().where('idade', '>=', 18)

// BETWEEN
const faixa = await Usuario.query().whereBetween('idade', [18, 30])

// IN
const cidades = await Usuario.query().whereIn('cidade', ['Sao Paulo', 'Curitiba'])

// LIKE
const gmail = await Usuario.query().where('email', 'LIKE', '%@gmail.com')

// IS NULL
const semTel = await Usuario.query().whereNull('telefone')

// IS NOT NULL
const comTel = await Usuario.query().whereNotNull('telefone')

// AND (encadeamento)
const filtro = await Usuario.query()
  .where('idade', '>=', 18)
  .where('status', 'ativo')
  .where('cidade', 'Sao Paulo')

// OR
const ouCidade = await Usuario.query()
  .where('cidade', 'Sao Paulo')
  .orWhere('cidade', 'Curitiba')

// AND + OR combinados
const combo = await Usuario.query()
  .where('status', 'ativo')
  .where((query) => {
    query.where('cidade', 'Sao Paulo').orWhere('cidade', 'Curitiba')
  })
```

## Exercicios

1. Escreva uma query que busque todos os produtos com preco entre R$50 e R$200.
2. Encontre usuarios cujo email termina com `@empresa.com` e que estejam com status `ativo`.
3. Busque pedidos que foram feitos em janeiro de 2024 (use BETWEEN com datas).
4. Liste clientes que nao informaram telefone (IS NULL) mas que tem email cadastrado (IS NOT NULL).
5. Reescreva a query do exercicio 2 usando Prisma, Drizzle e Lucid.

## Referencias

- [PostgreSQL WHERE](https://www.postgresql.org/docs/current/queries-table-expressions.html)
- [Prisma Filtering](https://www.prisma.io/docs/orm/prisma-client/queries/filtering-and-sorting)
- [Drizzle Filters](https://orm.drizzle.team/docs/operators)
- [Lucid Query Builder](https://docs.adonisjs.com/guides/database/query-builder)
