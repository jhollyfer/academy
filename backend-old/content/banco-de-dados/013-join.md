---
slug: "join"
modulo: "Modulo 4 -- Relacionamentos"
titulo: "Juntando Tabelas"
subtitulo: "INNER JOIN, LEFT JOIN e RIGHT JOIN"
descricao: "Aprenda a combinar dados de varias tabelas usando JOIN, o recurso mais poderoso do SQL."
ordem: 13
proximosPassos:
  - titulo: "Alterando Tabelas"
    descricao: "Modifique a estrutura de tabelas existentes com ALTER TABLE"
  - titulo: "DROP e TRUNCATE"
    descricao: "Remova tabelas e dados com seguranca"
quiz:
  - pergunta: "O que o INNER JOIN retorna?"
    opcoes: ["Todas as linhas das duas tabelas", "Apenas as linhas que tem correspondencia nas duas tabelas", "Todas as linhas da tabela da esquerda", "Todas as linhas da tabela da direita"]
    correta: 1
    explicacao: "INNER JOIN retorna apenas as linhas que tem match nas duas tabelas."
    explicacaoErrada: "INNER = intersecao. So aparecem linhas que tem correspondencia em ambos os lados."
  - pergunta: "Qual JOIN retorna todos os alunos, mesmo os que nao tem matricula?"
    opcoes: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN (com alunos a esquerda)", "CROSS JOIN"]
    correta: 2
    explicacao: "LEFT JOIN retorna todas as linhas da tabela da esquerda. Se alunos esta a esquerda, todos aparecem."
    explicacaoErrada: "LEFT JOIN mantem todas as linhas da tabela da esquerda, preenchendo com NULL onde nao tem match."
  - pergunta: "O que aparece quando um LEFT JOIN nao encontra correspondencia na tabela da direita?"
    opcoes: ["A linha e removida do resultado", "Aparece 0 nas colunas da direita", "Aparece NULL nas colunas da direita", "Da erro de execucao"]
    correta: 2
    explicacao: "Quando nao tem match, as colunas da tabela da direita ficam com NULL."
    explicacaoErrada: "LEFT JOIN preenche com NULL (nao 0) quando nao encontra correspondencia no lado direito."
  - pergunta: "Qual a funcao do ON em um JOIN?"
    opcoes: ["Definir o tipo de JOIN", "Especificar a condicao de ligacao entre as tabelas", "Ordenar o resultado", "Filtrar linhas antes do JOIN"]
    correta: 1
    explicacao: "O ON define qual coluna de uma tabela se liga a qual coluna da outra."
    explicacaoErrada: "ON especifica a condicao de juncao, normalmente igualando a FK com a PK: ON m.aluno_id = a.id"
  - pergunta: "Qual consulta esta correta para juntar alunos com matriculas?"
    opcoes: ["SELECT * FROM alunos JOIN matriculas", "SELECT * FROM alunos INNER JOIN matriculas ON alunos.id = matriculas.aluno_id", "SELECT * FROM alunos, matriculas WHERE alunos.id = matriculas.id", "SELECT * FROM alunos INNER JOIN matriculas WHERE alunos.id = matriculas.aluno_id"]
    correta: 1
    explicacao: "A sintaxe correta e INNER JOIN com ON especificando a condicao de ligacao."
    explicacaoErrada: "JOIN precisa de ON para especificar como as tabelas se conectam. Use a FK correta (aluno_id, nao id)."
---

## O que e JOIN?

JOIN e como voce combina dados de duas ou mais tabelas em uma unica consulta. Quando voce separou os dados em tabelas diferentes (alunos, cursos, matriculas), o JOIN e o que junta tudo de volta para voce ver as informacoes completas.

> [!info]
> Sem JOIN, voce precisaria fazer varias consultas separadas e juntar os dados manualmente. JOIN faz isso em uma query so.

## Dados de exemplo

Vamos usar essas tabelas nos exemplos:

**alunos**

| id | nome    | cidade    |
|----|---------|-----------|
| 1  | Ana     | Sao Paulo |
| 2  | Bruno   | Curitiba  |
| 3  | Carla   | Recife    |

**cursos**

| id | nome         |
|----|--------------|
| 1  | Python       |
| 2  | Banco de Dados |

**matriculas**

| id | aluno_id | curso_id |
|----|----------|----------|
| 1  | 1        | 1        |
| 2  | 1        | 2        |
| 3  | 2        | 1        |

Note que Carla (id 3) nao tem nenhuma matricula. Isso vai ser importante nos exemplos.

## INNER JOIN

Retorna apenas as linhas que tem correspondencia nas **duas** tabelas. Se nao tem match, a linha nao aparece.

```sql
SELECT a.nome, c.nome AS curso
FROM alunos a
INNER JOIN matriculas m ON m.aluno_id = a.id
INNER JOIN cursos c ON c.id = m.curso_id;
```

| nome  | curso          |
|-------|----------------|
| Ana   | Python         |
| Ana   | Banco de Dados |
| Bruno | Python         |

Carla nao aparece porque ela nao tem matricula. O INNER JOIN so mostra quem tem match.

> [!info]
> Os aliases `a`, `m`, `c` sao atalhos para nao escrever o nome completo da tabela toda hora. `alunos a` = "alunos, que vou chamar de a".

## LEFT JOIN

Retorna **todas** as linhas da tabela da esquerda, mesmo que nao tenham correspondencia na direita. Onde nao tem match, aparece NULL.

```sql
SELECT a.nome, c.nome AS curso
FROM alunos a
LEFT JOIN matriculas m ON m.aluno_id = a.id
LEFT JOIN cursos c ON c.id = m.curso_id;
```

| nome  | curso          |
|-------|----------------|
| Ana   | Python         |
| Ana   | Banco de Dados |
| Bruno | Python         |
| Carla | NULL           |

Agora Carla aparece, mas com NULL no curso porque ela nao tem matricula.

## RIGHT JOIN

Retorna **todas** as linhas da tabela da direita, mesmo sem correspondencia na esquerda. E o inverso do LEFT JOIN.

```sql
SELECT a.nome, c.nome AS curso
FROM matriculas m
RIGHT JOIN cursos c ON c.id = m.curso_id
LEFT JOIN alunos a ON a.id = m.aluno_id;
```

Na pratica, RIGHT JOIN e pouco usado. Voce pode sempre reescrever como LEFT JOIN invertendo a ordem das tabelas.

## Resumo dos JOINs

| Tipo        | O que retorna                                          |
|-------------|--------------------------------------------------------|
| INNER JOIN  | Apenas linhas com match nas duas tabelas               |
| LEFT JOIN   | Todas da esquerda + match da direita (NULL se nao tem) |
| RIGHT JOIN  | Todas da direita + match da esquerda (NULL se nao tem) |

> [!alerta]
> JOIN sem ON vira CROSS JOIN (produto cartesiano) — combina TODAS as linhas de uma tabela com TODAS da outra. Numa tabela com 1000 linhas, isso gera 1.000.000 de linhas. Sempre use ON.

## Exemplo completo

Listar todos os alunos com seus cursos e a data da matricula:

```sql
SELECT
  a.nome AS aluno,
  a.cidade,
  c.nome AS curso,
  m.data_matricula
FROM alunos a
LEFT JOIN matriculas m ON m.aluno_id = a.id
LEFT JOIN cursos c ON c.id = m.curso_id
ORDER BY a.nome;
```

| aluno | cidade    | curso          | data_matricula |
|-------|-----------|----------------|---------------|
| Ana   | Sao Paulo | Python         | 2025-03-01    |
| Ana   | Sao Paulo | Banco de Dados | 2025-03-15    |
| Bruno | Curitiba  | Python         | 2025-03-10    |
| Carla | Recife    | NULL           | NULL          |

## JOIN nos ORMs

### Prisma (include)

No Prisma, voce nao escreve JOIN. Voce usa `include` para trazer dados relacionados:

```typescript
const alunos = await prisma.aluno.findMany({
  include: {
    matriculas: {
      include: {
        curso: true
      }
    }
  }
})

// Resultado:
// [
//   { nome: 'Ana', matriculas: [{ curso: { nome: 'Python' } }, ...] },
//   { nome: 'Bruno', matriculas: [{ curso: { nome: 'Python' } }] },
//   { nome: 'Carla', matriculas: [] }
// ]
```

### Drizzle

```typescript
import { eq } from 'drizzle-orm'

// INNER JOIN
const resultado = await db
  .select({
    aluno: alunos.nome,
    curso: cursos.nome,
  })
  .from(alunos)
  .innerJoin(matriculas, eq(matriculas.alunoId, alunos.id))
  .innerJoin(cursos, eq(cursos.id, matriculas.cursoId))

// LEFT JOIN
const todosAlunos = await db
  .select({
    aluno: alunos.nome,
    curso: cursos.nome,
  })
  .from(alunos)
  .leftJoin(matriculas, eq(matriculas.alunoId, alunos.id))
  .leftJoin(cursos, eq(cursos.id, matriculas.cursoId))
```

### Lucid (AdonisJS - preload)

No Lucid, voce usa `preload` para carregar relacionamentos:

```typescript
// Carrega alunos com matriculas e cursos
const alunos = await Aluno
  .query()
  .preload('matriculas', (query) => {
    query.preload('curso')
  })

// Acesso: alunos[0].matriculas[0].curso.nome
```

## Exercicios

1. Escreva um INNER JOIN que retorne o nome do aluno e o nome do curso de cada matricula.
2. Use LEFT JOIN para listar todos os cursos, incluindo os que nao tem nenhuma matricula.
3. Liste os alunos que NAO estao matriculados em nenhum curso (dica: LEFT JOIN + WHERE ... IS NULL).
4. Escreva uma consulta que retorne: nome do aluno, cidade, nome do curso, e ordene por cidade.

## Referencias

- [JOIN — PostgreSQL Docs](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-JOIN) -- documentacao oficial
- [SQL Joins](https://www.w3schools.com/sql/sql_join.asp) -- W3Schools com diagramas visuais
- [Visual Representation of SQL Joins](https://blog.codinghorror.com/a-visual-explanation-of-sql-joins/) -- artigo classico com diagramas de Venn
