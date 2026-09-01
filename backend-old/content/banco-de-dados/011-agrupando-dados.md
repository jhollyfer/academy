---
slug: "agrupando-dados"
modulo: "Modulo 3 -- Consultas Avancadas"
titulo: "GROUP BY e HAVING"
subtitulo: "Agrupando resultados e filtrando grupos"
descricao: "Aprenda a agrupar dados com GROUP BY, usar funcoes de agregacao e filtrar grupos com HAVING."
ordem: 11
proximosPassos:
  - titulo: "Relacionando Tabelas"
    descricao: "Entenda chaves estrangeiras e como tabelas se conectam"
  - titulo: "Juntando Tabelas (JOIN)"
    descricao: "Combine dados de varias tabelas com INNER JOIN, LEFT JOIN e mais"
quiz:
  - pergunta: "Qual clausula agrupa linhas com valores iguais em uma coluna?"
    opcoes: ["ORDER BY", "GROUP BY", "HAVING", "DISTINCT"]
    correta: 1
    explicacao: "GROUP BY agrupa linhas que tem o mesmo valor na coluna indicada."
    explicacaoErrada: "ORDER BY ordena, HAVING filtra grupos, DISTINCT remove duplicatas. Quem agrupa e o GROUP BY."
  - pergunta: "Qual a diferenca entre WHERE e HAVING?"
    opcoes: ["WHERE filtra depois do GROUP BY, HAVING filtra antes", "WHERE filtra linhas antes do agrupamento, HAVING filtra grupos depois", "Nao tem diferenca, sao sinonimos", "HAVING so funciona sem GROUP BY"]
    correta: 1
    explicacao: "WHERE filtra as linhas ANTES do agrupamento. HAVING filtra os GRUPOS ja formados."
    explicacaoErrada: "A ordem importa: WHERE age nas linhas individuais antes de agrupar, HAVING age nos grupos depois."
  - pergunta: "Qual consulta retorna a quantidade de alunos por cidade?"
    opcoes: ["SELECT cidade, COUNT(*) FROM alunos GROUP BY cidade", "SELECT cidade, COUNT(*) FROM alunos ORDER BY cidade", "SELECT COUNT(cidade) FROM alunos", "SELECT cidade, SUM(*) FROM alunos GROUP BY cidade"]
    correta: 0
    explicacao: "COUNT(*) conta as linhas de cada grupo, e GROUP BY cidade cria um grupo por cidade."
    explicacaoErrada: "Para contar por grupo, voce precisa de COUNT(*) junto com GROUP BY."
  - pergunta: "Qual consulta mostra apenas cidades com mais de 5 alunos?"
    opcoes: ["SELECT cidade, COUNT(*) FROM alunos GROUP BY cidade WHERE COUNT(*) > 5", "SELECT cidade, COUNT(*) FROM alunos WHERE COUNT(*) > 5 GROUP BY cidade", "SELECT cidade, COUNT(*) FROM alunos GROUP BY cidade HAVING COUNT(*) > 5", "SELECT cidade, COUNT(*) FROM alunos HAVING COUNT(*) > 5"]
    correta: 2
    explicacao: "HAVING filtra grupos. A sintaxe correta e GROUP BY primeiro, depois HAVING."
    explicacaoErrada: "WHERE nao aceita funcoes de agregacao. Use HAVING depois do GROUP BY para filtrar grupos."
  - pergunta: "Qual funcao de agregacao retorna a media dos valores?"
    opcoes: ["SUM()", "COUNT()", "AVG()", "MAX()"]
    correta: 2
    explicacao: "AVG() calcula a media (average) dos valores na coluna."
    explicacaoErrada: "SUM soma tudo, COUNT conta linhas, MAX pega o maior. AVG e a media."
---

## O que e GROUP BY?

Ate agora, todas as consultas retornavam linhas individuais. Mas e quando voce quer respostas como "quantos alunos tem em cada cidade?" ou "qual a media de nota por turma?"? E ai que entra o `GROUP BY` — ele junta linhas que tem o mesmo valor em uma coluna e permite usar funcoes de agregacao em cada grupo.

> [!info]
> Pense no GROUP BY como separar cartas em pilhas: todas as cartas de espadas juntas, todas de copas juntas. Depois voce conta quantas tem em cada pilha.

## Funcoes de agregacao

Antes de agrupar, voce precisa conhecer as funcoes que trabalham com grupos:

| Funcao     | O que faz                          |
|------------|------------------------------------|
| `COUNT(*)` | Conta quantas linhas tem no grupo  |
| `SUM()`    | Soma os valores da coluna          |
| `AVG()`    | Calcula a media dos valores        |
| `MIN()`    | Retorna o menor valor              |
| `MAX()`    | Retorna o maior valor              |

```sql
-- Sem GROUP BY, a funcao age em TODAS as linhas
SELECT COUNT(*) AS total FROM alunos;
-- → 150

SELECT AVG(nota) AS media_geral FROM alunos;
-- → 7.45
```

## GROUP BY na pratica

Imagine a tabela `alunos`:

| id | nome    | cidade      | nota |
|----|---------|-------------|------|
| 1  | Ana     | Sao Paulo   | 8.5  |
| 2  | Bruno   | Curitiba    | 7.0  |
| 3  | Carla   | Sao Paulo   | 9.0  |
| 4  | Diego   | Curitiba    | 6.5  |
| 5  | Elena   | Belo Horizonte | 8.0 |

```sql
SELECT cidade, COUNT(*) AS total_alunos
FROM alunos
GROUP BY cidade;
```

Resultado:

| cidade         | total_alunos |
|----------------|-------------|
| Sao Paulo      | 2           |
| Curitiba       | 2           |
| Belo Horizonte | 1           |

```sql
-- Media de nota por cidade
SELECT cidade, AVG(nota) AS media_nota
FROM alunos
GROUP BY cidade;
```

| cidade         | media_nota |
|----------------|-----------|
| Sao Paulo      | 8.75      |
| Curitiba       | 6.75      |
| Belo Horizonte | 8.00      |

## WHERE vs HAVING

Essa e uma das confusoes mais comuns em SQL. A regra e simples:

- **WHERE** filtra **linhas** ANTES do agrupamento
- **HAVING** filtra **grupos** DEPOIS do agrupamento

```sql
-- WHERE: filtra linhas antes de agrupar
-- So considera alunos com nota >= 7
SELECT cidade, COUNT(*) AS total_aprovados
FROM alunos
WHERE nota >= 7
GROUP BY cidade;
```

| cidade         | total_aprovados |
|----------------|----------------|
| Sao Paulo      | 2              |
| Curitiba       | 1              |
| Belo Horizonte | 1              |

```sql
-- HAVING: filtra grupos depois de agrupar
-- So mostra cidades com mais de 1 aluno
SELECT cidade, COUNT(*) AS total_alunos
FROM alunos
GROUP BY cidade
HAVING COUNT(*) > 1;
```

| cidade    | total_alunos |
|-----------|-------------|
| Sao Paulo | 2           |
| Curitiba  | 2           |

> [!alerta]
> Voce NAO pode usar funcoes de agregacao no WHERE. `WHERE COUNT(*) > 5` da erro. Use HAVING para filtrar grupos.

## Combinando WHERE e HAVING

Voce pode usar os dois juntos. O WHERE filtra primeiro, depois o GROUP BY agrupa, e o HAVING filtra os grupos:

```sql
-- Cidades com mais de 1 aluno aprovado (nota >= 7)
SELECT cidade, COUNT(*) AS aprovados
FROM alunos
WHERE nota >= 7
GROUP BY cidade
HAVING COUNT(*) > 1;
```

A ordem de execucao no banco e: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY`.

## GROUP BY com ORDER BY

Voce pode ordenar o resultado agrupado:

```sql
SELECT cidade, COUNT(*) AS total
FROM alunos
GROUP BY cidade
ORDER BY total DESC;
```

## GROUP BY nos ORMs

### Prisma

```typescript
const alunosPorCidade = await prisma.aluno.groupBy({
  by: ['cidade'],
  _count: { id: true },
  _avg: { nota: true },
  having: {
    nota: { _avg: { gt: 7 } }
  }
})
```

### Drizzle

```typescript
import { sql, count, avg } from 'drizzle-orm'

const resultado = await db
  .select({
    cidade: alunos.cidade,
    total: count(),
    media: avg(alunos.nota)
  })
  .from(alunos)
  .groupBy(alunos.cidade)
  .having(sql`count(*) > 1`)
```

### Lucid (AdonisJS)

```typescript
const resultado = await Aluno
  .query()
  .select('cidade')
  .count('* as total')
  .avg('nota as media_nota')
  .groupBy('cidade')
  .having('count(*)', '>', 1)
```

## Exercicios

1. Escreva uma consulta que retorne a quantidade de alunos por cidade, ordenada da maior para a menor quantidade.
2. Escreva uma consulta que retorne a maior nota por cidade.
3. Escreva uma consulta que mostre apenas cidades onde a media de notas e maior que 7.
4. Usando WHERE e HAVING juntos, retorne cidades com mais de 2 alunos que tem nota acima de 6.

## Referencias

- [GROUP BY — PostgreSQL Docs](https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUP) -- documentacao oficial
- [SQL GROUP BY Statement](https://www.w3schools.com/sql/sql_groupby.asp) -- W3Schools com exemplos interativos
- [Curso SQL #10 - GROUP BY e HAVING](https://www.youtube.com/watch?v=s2MIKOcRh_U) -- Curso em Video
