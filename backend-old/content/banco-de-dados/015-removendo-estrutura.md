---
slug: "removendo-estrutura"
modulo: "Modulo 5 -- Estrutura e Manutencao"
titulo: "DROP, TRUNCATE e Boas Praticas"
subtitulo: "Removendo tabelas e boas praticas do dia-a-dia"
descricao: "Entenda a diferenca entre DELETE, TRUNCATE e DROP, e aprenda boas praticas essenciais para trabalhar com bancos de dados."
ordem: 15
proximosPassos:
  - titulo: "Pratica com exercicios"
    descricao: "Reforce o aprendizado com exercicios praticos de SQL"
  - titulo: "Projetos com banco de dados"
    descricao: "Aplique tudo que aprendeu construindo projetos reais"
quiz:
  - pergunta: "Qual a diferenca entre DELETE e TRUNCATE?"
    opcoes: ["Nao tem diferenca, sao a mesma coisa", "DELETE remove linhas com filtro (WHERE), TRUNCATE remove todas as linhas de uma vez", "TRUNCATE remove a tabela inteira, DELETE remove so os dados", "DELETE e mais rapido que TRUNCATE"]
    correta: 1
    explicacao: "DELETE permite WHERE para filtrar quais linhas apagar. TRUNCATE remove todas as linhas de uma vez, sem filtro."
    explicacaoErrada: "DELETE aceita WHERE para filtrar. TRUNCATE apaga TUDO de uma vez (sem WHERE). DROP remove a tabela inteira."
  - pergunta: "O que o DROP TABLE faz?"
    opcoes: ["Remove todas as linhas da tabela", "Remove a tabela inteira (estrutura + dados)", "Remove apenas a estrutura, mantendo os dados", "Remove o banco de dados inteiro"]
    correta: 1
    explicacao: "DROP TABLE remove a tabela por completo: estrutura, dados, indices, tudo."
    explicacaoErrada: "DROP TABLE e o mais destrutivo: apaga a tabela, seus dados, seus indices — tudo. A tabela deixa de existir."
  - pergunta: "Por que devemos evitar SELECT * em producao?"
    opcoes: ["Porque da erro de sintaxe", "Porque traz todas as colunas, gastando mais memoria e rede desnecessariamente", "Porque so funciona com uma tabela", "Porque nao funciona com JOIN"]
    correta: 1
    explicacao: "SELECT * traz todas as colunas, incluindo as que voce nao precisa. Isso gasta mais recursos e pode expor dados sensiveis."
    explicacaoErrada: "SELECT * funciona, mas traz colunas desnecessarias. Em producao, sempre especifique as colunas que precisa."
  - pergunta: "Antes de rodar um DELETE ou UPDATE, qual a boa pratica recomendada?"
    opcoes: ["Rodar TRUNCATE antes", "Fazer backup do banco inteiro", "Testar com SELECT usando a mesma clausula WHERE", "Desligar o servidor"]
    correta: 2
    explicacao: "Trocar DELETE/UPDATE por SELECT com o mesmo WHERE mostra quais linhas serao afetadas, sem risco."
    explicacaoErrada: "Antes de DELETE/UPDATE, troque o comando por SELECT com o mesmo WHERE para verificar quais linhas serao atingidas."
  - pergunta: "Qual padrao de nomenclatura e recomendado para tabelas e colunas?"
    opcoes: ["camelCase: nomeCompleto", "PascalCase: NomeCompleto", "snake_case: nome_completo", "UPPER_CASE: NOME_COMPLETO"]
    correta: 2
    explicacao: "snake_case (minusculo com underscores) e o padrao mais usado em bancos de dados."
    explicacaoErrada: "Em SQL, o padrao e snake_case: tudo minusculo com underscores separando palavras."
---

## Comandos destrutivos do SQL

Existem tres formas de remover dados ou estrutura no SQL: `DELETE`, `TRUNCATE` e `DROP`. Cada um tem um nivel diferente de destruicao, e confundir eles pode causar problemas serios.

## DELETE — Remove linhas especificas

Voce ja conhece o DELETE das aulas anteriores. Ele remove linhas e aceita WHERE para filtrar:

```sql
-- Remove apenas alunos de Curitiba
DELETE FROM alunos WHERE cidade = 'Curitiba';

-- Remove TODAS as linhas (cuidado!)
DELETE FROM alunos;
```

Caracteristicas do DELETE:
- Aceita WHERE para filtrar
- Pode ser revertido com ROLLBACK (dentro de uma transacao)
- Dispara triggers
- Mais lento para grandes volumes de dados

## TRUNCATE TABLE — Limpa todos os dados

TRUNCATE remove **todas** as linhas da tabela de uma vez. Nao aceita WHERE.

```sql
-- Remove todos os dados, mas mantem a tabela
TRUNCATE TABLE alunos;
```

```sql
-- Reseta o contador do SERIAL/auto-increment
TRUNCATE TABLE alunos RESTART IDENTITY;
```

Caracteristicas do TRUNCATE:
- Remove TODAS as linhas (sem WHERE)
- Muito mais rapido que DELETE para tabelas grandes
- Reseta o auto-increment (com RESTART IDENTITY)
- Nao dispara triggers de linha
- A tabela continua existindo, so fica vazia

> [!alerta]
> TRUNCATE nao tem WHERE. Ele apaga TUDO. Se voce quer apagar linhas especificas, use DELETE.

## DROP TABLE — Remove a tabela inteira

DROP remove a tabela por completo: estrutura, dados, indices, constraints — tudo.

```sql
-- Remove a tabela completamente
DROP TABLE matriculas;
```

```sql
-- Remove so se existir (evita erro)
DROP TABLE IF EXISTS matriculas;
```

A tabela deixa de existir. Para usar novamente, voce precisa recria-la com CREATE TABLE.

## DROP DATABASE — Remove o banco inteiro

O mais destrutivo de todos:

```sql
-- Remove o banco de dados inteiro (MUITO cuidado!)
DROP DATABASE IF EXISTS escola;
```

> [!alerta]
> DROP DATABASE apaga TUDO: todas as tabelas, todos os dados, toda a estrutura. Esse comando nao tem volta. So use se realmente quiser apagar o banco inteiro.

## Comparacao: DELETE vs TRUNCATE vs DROP

| Caracteristica        | DELETE              | TRUNCATE             | DROP                    |
|----------------------|---------------------|----------------------|-------------------------|
| O que remove          | Linhas especificas  | Todas as linhas      | A tabela inteira        |
| Aceita WHERE          | Sim                 | Nao                  | N/A                     |
| Tabela continua existindo | Sim            | Sim                  | Nao                     |
| Velocidade            | Lento (linha a linha)| Rapido              | Rapido                  |
| Reseta auto-increment | Nao                | Sim (RESTART IDENTITY)| N/A                    |
| Dispara triggers      | Sim                 | Nao (por linha)      | Nao                     |

---

## Boas Praticas no dia-a-dia

Essas sao as praticas que vao evitar dor de cabeca quando voce trabalhar com bancos de dados em projetos reais.

### 1. Sempre use WHERE no DELETE e UPDATE

```sql
-- ERRADO: apaga TODOS os alunos
DELETE FROM alunos;

-- CERTO: apaga apenas o aluno especifico
DELETE FROM alunos WHERE id = 5;
```

```sql
-- ERRADO: muda a cidade de TODOS
UPDATE alunos SET cidade = 'Curitiba';

-- CERTO: muda apenas o aluno 5
UPDATE alunos SET cidade = 'Curitiba' WHERE id = 5;
```

### 2. Teste DELETE/UPDATE com SELECT antes

Antes de rodar um DELETE ou UPDATE, troque o comando por SELECT com o mesmo WHERE. Isso mostra quais linhas serao afetadas sem mudar nada:

```sql
-- Primeiro, veja quem vai ser afetado
SELECT * FROM alunos WHERE cidade = 'Curitiba';

-- So depois, se estiver correto, rode o DELETE
DELETE FROM alunos WHERE cidade = 'Curitiba';
```

> [!info]
> Essa e a dica mais importante desta aula. Crie o habito de sempre testar com SELECT antes de qualquer DELETE ou UPDATE.

### 3. Use snake_case para nomes

```sql
-- CERTO: snake_case, minusculo
CREATE TABLE historico_notas (
  aluno_id INTEGER,
  nota_final DECIMAL(4,2),
  data_avaliacao DATE
);

-- EVITE: camelCase, PascalCase, espacos
CREATE TABLE "HistoricoNotas" (
  "alunoId" INTEGER,
  "notaFinal" DECIMAL(4,2)
);
```

### 4. Use NOT NULL para campos obrigatorios

Se um campo deve sempre ter valor, marque como NOT NULL. Isso evita dados incompletos:

```sql
CREATE TABLE alunos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,       -- obrigatorio
  email VARCHAR(150) NOT NULL,      -- obrigatorio
  telefone VARCHAR(20),             -- opcional (pode ser NULL)
  cidade VARCHAR(100) NOT NULL DEFAULT 'Nao informada'
);
```

### 5. Evite SELECT * em producao

```sql
-- EVITE: traz tudo, inclusive colunas que voce nao precisa
SELECT * FROM alunos;

-- PREFIRA: apenas as colunas necessarias
SELECT nome, email, cidade FROM alunos;
```

Motivos para evitar SELECT *:
- Gasta mais memoria e banda de rede
- Pode expor dados sensiveis (senhas, tokens)
- Dificulta entender o que a consulta realmente precisa
- Quebra se alguem adicionar/remover colunas

### 6. Crie indices em colunas usadas no WHERE e JOIN

```sql
-- Se voce filtra por cidade frequentemente:
CREATE INDEX idx_alunos_cidade ON alunos(cidade);

-- Se voce faz JOIN por aluno_id frequentemente:
CREATE INDEX idx_matriculas_aluno_id ON matriculas(aluno_id);
```

> [!info]
> Indices funcionam como o indice de um livro: em vez de ler pagina por pagina, o banco vai direto ao lugar certo. Tabelas pequenas nao precisam, mas tabelas grandes ficam muito mais rapidas com indices.

### 7. Faca backup antes de comandos destrutivos

Antes de rodar DROP, TRUNCATE, ou DELETE sem WHERE em producao, faca backup:

```bash
# Backup de um banco PostgreSQL
pg_dump nome_do_banco > backup_2025_03_30.sql

# Restaurar o backup
psql nome_do_banco < backup_2025_03_30.sql
```

### 8. Use transacoes para operacoes criticas

```sql
-- Comeca a transacao
BEGIN;

-- Faz as alteracoes
DELETE FROM matriculas WHERE curso_id = 5;
DELETE FROM cursos WHERE id = 5;

-- Se tudo esta certo:
COMMIT;

-- Se algo deu errado:
ROLLBACK;
```

## Resumo de seguranca

| Comando              | Nivel de perigo | Reversivel?                  |
|---------------------|----------------|------------------------------|
| SELECT              | Nenhum          | N/A (so leitura)            |
| INSERT/UPDATE/DELETE | Medio          | Sim, com ROLLBACK em transacao|
| TRUNCATE            | Alto            | Depende do banco             |
| DROP TABLE          | Muito alto      | Nao (precisa backup)         |
| DROP DATABASE       | Critico         | Nao (precisa backup)         |

## Exercicios

1. Explique com suas palavras a diferenca entre DELETE, TRUNCATE e DROP.
2. Escreva o SELECT que voce rodaria antes de executar: `DELETE FROM alunos WHERE nota < 5`.
3. Crie uma tabela `produtos` com boas praticas: snake_case, NOT NULL nos campos obrigatorios, valor padrao onde faz sentido.
4. Crie um indice na coluna `cidade` da tabela `alunos`.
5. Escreva uma transacao que apaga um curso e todas as matriculas relacionadas a ele.

## Referencias

- [DROP TABLE — PostgreSQL Docs](https://www.postgresql.org/docs/current/sql-droptable.html) -- documentacao oficial
- [TRUNCATE — PostgreSQL Docs](https://www.postgresql.org/docs/current/sql-truncate.html) -- documentacao oficial
- [SQL Performance Best Practices](https://use-the-index-luke.com/) -- guia completo sobre indices e performance
- [Curso SQL #12 - Boas Praticas](https://www.youtube.com/watch?v=4H3BBa8uYMs) -- Curso em Video
