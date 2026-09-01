---
slug: "buscando-dados"
modulo: "Modulo 2 -- CRUD Basico"
titulo: "Buscando Dados"
subtitulo: "SELECT para consultar registros"
descricao: "Aprenda a consultar dados com SELECT, escolher colunas especificas, usar alias e entender por que evitar SELECT * em producao."
ordem: 5
proximosPassos:
  - titulo: "Filtrando com WHERE"
    descricao: "Adicione condicoes para filtrar os resultados das consultas"
  - titulo: "Ordenando e Limitando"
    descricao: "Use ORDER BY e LIMIT para organizar e paginar resultados"
quiz:
  - pergunta: "O que SELECT * retorna?"
    opcoes: ["Apenas a primeira linha", "Todas as colunas de todos os registros", "Apenas as colunas com dados", "Um erro, porque * nao e valido"]
    correta: 1
    explicacao: "SELECT * retorna todas as colunas de todos os registros da tabela."
    explicacaoErrada: "O * (asterisco) significa 'todas as colunas'. SELECT * traz tudo da tabela."
  - pergunta: "Por que devemos evitar SELECT * em producao?"
    opcoes: ["Porque e mais lento de digitar", "Porque traz dados desnecessarios e pode expor informacoes sensiveis", "Porque nao funciona em todos os bancos", "Porque retorna dados duplicados"]
    correta: 1
    explicacao: "SELECT * traz todas as colunas, incluindo dados que voce nao precisa e possivelmente informacoes sensiveis como senhas."
    explicacaoErrada: "Em producao, SELECT * e ruim porque traz colunas desnecessarias, consome mais memoria e pode vazar dados sensiveis."
  - pergunta: "Qual a funcao do AS no SELECT?"
    opcoes: ["Filtra os resultados", "Cria um alias (apelido) para a coluna", "Ordena os resultados", "Define o tipo de dado"]
    correta: 1
    explicacao: "AS cria um alias -- um nome temporario para a coluna no resultado da consulta."
    explicacaoErrada: "AS define um alias (apelido) para renomear colunas no resultado. Nao altera a tabela."
  - pergunta: "No Prisma, como buscar apenas nome e email de todos os alunos?"
    opcoes: ["prisma.aluno.findMany({ columns: { nome: true, email: true } })", "prisma.aluno.findMany({ select: { nome: true, email: true } })", "prisma.aluno.findMany({ fields: ['nome', 'email'] })", "prisma.aluno.select({ nome: true, email: true })"]
    correta: 1
    explicacao: "No Prisma, usamos select dentro de findMany() para escolher quais campos retornar."
    explicacaoErrada: "O Prisma usa select: { campo: true } dentro de findMany() para selecionar colunas especificas."
  - pergunta: "Qual metodo do Drizzle seleciona colunas especificas?"
    opcoes: ["db.select().from(alunos).columns()", "db.query(alunos).pick()", "db.select({ nome: alunos.nome }).from(alunos)", "db.from(alunos).select('nome')"]
    correta: 2
    explicacao: "No Drizzle, voce passa um objeto com as colunas desejadas dentro de db.select()."
    explicacaoErrada: "No Drizzle, a selecao de colunas e feita dentro do select(): db.select({ campo: tabela.campo }).from(tabela)."
---

## SELECT -- lendo dados do banco

O comando `SELECT` e o mais usado do SQL. Ele consulta dados de uma ou mais tabelas. Vamos usar esta tabela de exemplo:

| id | nome | email | idade | ativo |
|----|------|-------|-------|-------|
| 1 | Ana Silva | ana@email.com | 20 | 1 |
| 2 | Carlos Souza | carlos@email.com | 22 | 1 |
| 3 | Julia Santos | julia@email.com | 19 | 1 |
| 4 | Pedro Lima | pedro@email.com | 21 | 0 |
| 5 | Maria Costa | maria@email.com | 23 | 1 |

## SELECT * -- tudo de uma vez

O asterisco (`*`) significa "todas as colunas":

```sql
SELECT * FROM alunos;
-- → Retorna todas as colunas de todos os registros
```

Resultado: a tabela inteira, todas as 5 linhas com todas as 5 colunas.

> [!alerta]
> `SELECT *` e otimo para testar e aprender, mas **evite em producao**. Motivos:
> - Traz colunas que voce nao precisa (desperdicando memoria e banda)
> - Pode expor dados sensiveis (senha, token, CPF)
> - Se alguem adicionar uma coluna pesada (como BLOB), sua query fica lenta sem voce perceber

## Selecionando colunas especificas

Informe exatamente quais colunas voce quer:

```sql
SELECT nome, email FROM alunos;
-- → Retorna apenas nome e email
```

| nome | email |
|------|-------|
| Ana Silva | ana@email.com |
| Carlos Souza | carlos@email.com |
| Julia Santos | julia@email.com |
| Pedro Lima | pedro@email.com |
| Maria Costa | maria@email.com |

Voce pode selecionar quantas colunas quiser, em qualquer ordem:

```sql
SELECT email, nome, idade FROM alunos;
-- → Retorna email, nome e idade (nessa ordem)
```

## Alias com AS -- renomeando colunas

Use `AS` para dar um apelido temporario a uma coluna no resultado:

```sql
SELECT
    nome AS aluno,
    email AS contato,
    idade AS anos
FROM alunos;
```

| aluno | contato | anos |
|-------|---------|------|
| Ana Silva | ana@email.com | 20 |
| Carlos Souza | carlos@email.com | 22 |

O alias **nao altera** a tabela -- so muda o nome no resultado da consulta. Isso e util quando:

- O nome da coluna e confuso (ex: `dt_nasc` vira `data_nascimento`)
- Voce usa calculos (ex: `preco * quantidade AS total`)
- Junta tabelas e tem colunas com mesmo nome

```sql
SELECT
    nome,
    idade,
    idade + 1 AS idade_ano_que_vem
FROM alunos;
```

| nome | idade | idade_ano_que_vem |
|------|-------|-------------------|
| Ana Silva | 20 | 21 |
| Carlos Souza | 22 | 23 |

## DISTINCT -- removendo duplicatas

Se voce quer valores unicos (sem repeticao):

```sql
SELECT DISTINCT idade FROM alunos;
-- → Retorna cada idade uma unica vez
```

Util quando voce quer saber quais valores existem numa coluna:

```sql
SELECT DISTINCT ativo FROM alunos;
-- → 1, 0 (os unicos valores que existem)
```

## Contando registros

Use `COUNT(*)` para saber quantos registros existem:

```sql
SELECT COUNT(*) AS total_alunos FROM alunos;
-- → 5
```

---

## Mesma operacao com ORMs

### Prisma

Buscar todos os registros:

```typescript
const alunos = await prisma.aluno.findMany();
// → Array com todos os alunos e todas as colunas
```

Selecionar colunas especificas:

```typescript
const alunos = await prisma.aluno.findMany({
  select: {
    nome: true,
    email: true,
  },
});
// → [{ nome: 'Ana Silva', email: 'ana@email.com' }, ...]
```

Buscar um registro pelo id:

```typescript
const aluno = await prisma.aluno.findUnique({
  where: { id: 1 },
});
// → { id: 1, nome: 'Ana Silva', ... }
```

Contar registros:

```typescript
const total = await prisma.aluno.count();
// → 5
```

### Drizzle

Buscar todos:

```typescript
const todosAlunos = await db.select().from(alunos);
// → Array com todos os alunos
```

Selecionar colunas especificas:

```typescript
const resultado = await db
  .select({
    nome: alunos.nome,
    email: alunos.email,
  })
  .from(alunos);
// → [{ nome: 'Ana Silva', email: 'ana@email.com' }, ...]
```

Contar registros:

```typescript
import { count } from 'drizzle-orm';

const [resultado] = await db
  .select({ total: count() })
  .from(alunos);
// → { total: 5 }
```

### Lucid (AdonisJS)

Buscar todos:

```typescript
const alunos = await Aluno.all();
// → Array de instancias do model
```

Selecionar colunas especificas:

```typescript
const alunos = await Aluno.query().select('nome', 'email');
// → [{ nome: 'Ana Silva', email: 'ana@email.com' }, ...]
```

Buscar um registro pelo id:

```typescript
const aluno = await Aluno.find(1);
// → Instancia do model com id = 1

const aluno = await Aluno.findOrFail(1);
// → Mesmo que find(), mas lanca erro se nao encontrar
```

Contar registros:

```typescript
const total = await Aluno.query().count('* as total');
// → [{ total: 5 }]
```

> [!info]
> No Lucid, `find()` retorna `null` se nao encontrar. Use `findOrFail()` quando o registro **deve** existir -- ele lanca uma excecao automaticamente.

## Comparativo Rapido

| Operacao | SQL | Prisma | Drizzle | Lucid |
|----------|-----|--------|---------|-------|
| Buscar todos | `SELECT * FROM alunos` | `findMany()` | `db.select().from()` | `Model.all()` |
| Colunas especificas | `SELECT nome, email FROM alunos` | `findMany({ select })` | `db.select({ ... }).from()` | `query().select()` |
| Buscar por ID | `SELECT * FROM alunos WHERE id = 1` | `findUnique({ where })` | `db.select().from().where()` | `Model.find(1)` |
| Contar | `SELECT COUNT(*) FROM alunos` | `count()` | `db.select({ count() })` | `query().count()` |

## Boas Praticas

1. **Sempre liste as colunas** que voce precisa ao inves de usar `*`
2. **Use alias** para deixar o resultado mais legivel
3. **Cuidado com tabelas grandes** -- sem WHERE ou LIMIT, voce pode trazer milhoes de registros
4. **Use COUNT antes de SELECT** se quiser saber o tamanho do resultado antes de trazer os dados

```sql
-- Ruim em producao:
SELECT * FROM alunos;

-- Bom em producao:
SELECT id, nome, email FROM alunos;
```

## Exercicios

1. Escreva um SELECT que retorne apenas o `nome` e a `idade` de todos os alunos.

2. Use `AS` para renomear a coluna `nome` para `aluno` e `email` para `contato` no resultado.

3. Escreva uma query que retorne quantos alunos existem na tabela.

4. Use `DISTINCT` para listar todas as idades diferentes que existem na tabela.

5. Reescreva as queries dos exercicios 1 e 2 usando Prisma **ou** Drizzle **ou** Lucid (escolha um).

6. Pesquise: qual a diferenca entre `findUnique` e `findFirst` no Prisma?

## Referencias

- [MySQL SELECT](https://dev.mysql.com/doc/refman/8.0/en/select.html)
- [Prisma - Read](https://www.prisma.io/docs/concepts/components/prisma-client/crud#read)
- [Drizzle - Select](https://orm.drizzle.team/docs/select)
- [Lucid ORM - Read](https://docs.adonisjs.com/guides/models/crud-operations#read)
- [W3Schools SELECT](https://www.w3schools.com/sql/sql_select.asp)
