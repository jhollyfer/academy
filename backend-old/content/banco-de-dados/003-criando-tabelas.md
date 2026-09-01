---
slug: "criando-tabelas"
modulo: "Modulo 1 -- Fundamentos"
titulo: "Criando Tabelas"
subtitulo: "CREATE TABLE, PRIMARY KEY, NOT NULL e constraints"
descricao: "Aprenda a criar tabelas com CREATE TABLE, definir chaves primarias, auto incremento e restricoes como NOT NULL, UNIQUE e DEFAULT."
ordem: 3
proximosPassos:
  - titulo: "Inserindo Dados"
    descricao: "Use INSERT INTO para adicionar registros nas tabelas"
  - titulo: "Buscando Dados"
    descricao: "Consulte registros com SELECT"
quiz:
  - pergunta: "Qual constraint garante que uma coluna nunca fique vazia?"
    opcoes: ["UNIQUE", "DEFAULT", "NOT NULL", "PRIMARY KEY"]
    correta: 2
    explicacao: "NOT NULL impede que a coluna aceite valores vazios (NULL). Toda insercao precisa informar um valor."
    explicacaoErrada: "NOT NULL e a constraint que impede valores vazios. UNIQUE impede repeticoes, DEFAULT define valor padrao."
  - pergunta: "O que AUTO_INCREMENT faz?"
    opcoes: ["Aumenta o tamanho da coluna automaticamente", "Gera um numero sequencial para cada novo registro", "Incrementa o valor de qualquer coluna numerica", "Cria um indice automaticamente"]
    correta: 1
    explicacao: "AUTO_INCREMENT gera numeros sequenciais automaticamente (1, 2, 3...) para cada novo registro inserido."
    explicacaoErrada: "AUTO_INCREMENT gera IDs automaticos: 1, 2, 3... Voce nao precisa informar o valor ao inserir."
  - pergunta: "O que acontece se voce tentar inserir um email duplicado numa coluna UNIQUE?"
    opcoes: ["O banco sobrescreve o registro anterior", "O banco aceita normalmente", "O banco retorna um erro", "O banco ignora silenciosamente"]
    correta: 2
    explicacao: "UNIQUE impede valores duplicados. O banco retorna um erro e nao insere o registro."
    explicacaoErrada: "Colunas UNIQUE rejeitam duplicatas com um erro. O registro nao e inserido."
  - pergunta: "Qual a sintaxe correta para definir um valor padrao?"
    opcoes: ["nome VARCHAR(100) SET 'Sem nome'", "nome VARCHAR(100) DEFAULT 'Sem nome'", "nome VARCHAR(100) = 'Sem nome'", "nome VARCHAR(100) VALUE 'Sem nome'"]
    correta: 1
    explicacao: "DEFAULT define o valor padrao que sera usado quando nenhum valor for informado na insercao."
    explicacaoErrada: "A sintaxe correta e DEFAULT 'valor'. As outras opcoes nao existem no SQL."
  - pergunta: "Quantas PRIMARY KEYs uma tabela pode ter?"
    opcoes: ["Quantas quiser", "Apenas uma", "No maximo duas", "Depende do banco de dados"]
    correta: 1
    explicacao: "Cada tabela pode ter apenas uma PRIMARY KEY, mas ela pode ser composta por varias colunas."
    explicacaoErrada: "So pode ter uma PRIMARY KEY por tabela, mas ela pode combinar varias colunas (chave composta)."
---

## CREATE TABLE -- a base de tudo

O comando `CREATE TABLE` define a estrutura de uma tabela: quais colunas ela tem, o tipo de cada uma e as restricoes (constraints).

```sql
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    idade INT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Vamos entender cada parte.

## PRIMARY KEY -- identidade unica

A chave primaria identifica cada registro de forma unica. Normalmente usamos uma coluna `id` com `AUTO_INCREMENT`:

```sql
id INT AUTO_INCREMENT PRIMARY KEY
```

Isso significa:
- `INT` -- tipo numerico inteiro
- `AUTO_INCREMENT` -- o banco gera o valor automaticamente (1, 2, 3...)
- `PRIMARY KEY` -- e o identificador unico da tabela

```sql
INSERT INTO alunos (nome, email) VALUES ('Ana', 'ana@email.com');
-- → id = 1 (automatico)

INSERT INTO alunos (nome, email) VALUES ('Carlos', 'carlos@email.com');
-- → id = 2 (automatico)
```

> [!info]
> Voce nao precisa informar o `id` ao inserir. O `AUTO_INCREMENT` cuida disso. Se deletar o registro 2 e inserir outro, o proximo sera 3 (nao reutiliza numeros).

## NOT NULL -- campo obrigatorio

`NOT NULL` impede que a coluna aceite valores vazios.

```sql
nome VARCHAR(100) NOT NULL
```

Se voce tentar inserir sem o nome:

```sql
INSERT INTO alunos (email) VALUES ('teste@email.com');
-- → ERRO! A coluna 'nome' nao pode ser NULL
```

Quando usar:
- **Use NOT NULL** em campos obrigatorios: nome, email, senha
- **Deixe sem NOT NULL** em campos opcionais: telefone, bio, foto

## UNIQUE -- sem repeticoes

`UNIQUE` garante que nenhum valor se repita naquela coluna.

```sql
email VARCHAR(255) UNIQUE NOT NULL
```

```sql
INSERT INTO alunos (nome, email) VALUES ('Ana', 'ana@email.com');
-- → OK!

INSERT INTO alunos (nome, email) VALUES ('Ana Maria', 'ana@email.com');
-- → ERRO! Duplicate entry 'ana@email.com' for key 'email'
```

> [!info]
> `PRIMARY KEY` ja inclui `UNIQUE` automaticamente. Voce nao precisa colocar `UNIQUE` na coluna que e chave primaria.

## DEFAULT -- valor padrao

`DEFAULT` define um valor automatico quando nenhum e informado.

```sql
ativo BOOLEAN DEFAULT TRUE,
criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

```sql
INSERT INTO alunos (nome, email) VALUES ('Ana', 'ana@email.com');
-- → ativo = TRUE (automatico)
-- → criado_em = '2024-03-15 14:30:00' (automatico)
```

Exemplos uteis de DEFAULT:

```sql
role VARCHAR(20) DEFAULT 'aluno',
tentativas INT DEFAULT 0,
pais VARCHAR(50) DEFAULT 'Brasil'
```

## Combinando Constraints

Voce pode combinar varias constraints numa mesma coluna:

```sql
email VARCHAR(255) UNIQUE NOT NULL
-- Obrigatorio + sem repeticoes

nome VARCHAR(100) NOT NULL DEFAULT 'Sem nome'
-- Obrigatorio + valor padrao (se o campo for omitido)
```

> [!alerta]
> `NOT NULL DEFAULT 'valor'` parece contraditorio, mas faz sentido: se o campo for omitido no INSERT, usa o DEFAULT. Mas se alguem tentar explicitamente inserir NULL, o NOT NULL bloqueia.

## Exemplo Completo -- Sistema de Escola

Vamos criar um mini sistema com 3 tabelas relacionadas:

```sql
CREATE DATABASE escola;
USE escola;

-- Tabela de alunos
CREATE TABLE alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    data_nascimento DATE,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cursos
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    carga_horaria INT NOT NULL,
    preco DECIMAL(10, 2) NOT NULL
);

-- Tabela de matriculas (conecta alunos e cursos)
CREATE TABLE matriculas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    curso_id INT NOT NULL,
    data_matricula DATE DEFAULT (CURRENT_DATE),
    status VARCHAR(20) DEFAULT 'ativa',
    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);
```

A tabela `matriculas` usa **FOREIGN KEY** para se conectar as tabelas `alunos` e `cursos`:

```
alunos.id ←── matriculas.aluno_id
cursos.id ←── matriculas.curso_id
```

## Verificando a Estrutura

Depois de criar, voce pode ver a estrutura da tabela:

```sql
DESCRIBE alunos;
-- → Mostra todas as colunas, tipos e constraints
```

```sql
SHOW CREATE TABLE alunos;
-- → Mostra o comando CREATE TABLE completo
```

E para listar todas as tabelas do banco:

```sql
SHOW TABLES;
-- → alunos, cursos, matriculas
```

## Alterando Tabelas (ALTER TABLE)

Criou a tabela e esqueceu uma coluna? Use `ALTER TABLE`:

```sql
-- Adicionar coluna
ALTER TABLE alunos ADD telefone VARCHAR(20);

-- Remover coluna
ALTER TABLE alunos DROP COLUMN telefone;

-- Mudar o tipo de uma coluna
ALTER TABLE alunos MODIFY nome VARCHAR(200) NOT NULL;

-- Renomear coluna
ALTER TABLE alunos RENAME COLUMN nome TO nome_completo;
```

## Deletando Tabelas (DROP TABLE)

```sql
DROP TABLE matriculas;
-- → Apaga a tabela e TODOS os dados

DROP TABLE IF EXISTS matriculas;
-- → So apaga se existir (evita erro)
```

> [!alerta]
> `DROP TABLE` e irreversivel. Sempre tenha backup antes. A ordem de exclusao importa: delete primeiro as tabelas que tem FOREIGN KEY apontando para outras.

## Exercicios

1. Crie uma tabela `professores` com as colunas: id (PK), nome (obrigatorio), email (unico e obrigatorio), especialidade, salario e data_contratacao.

2. Crie uma tabela `turmas` com: id (PK), nome, professor_id (FK para professores), horario e sala. Use constraints adequadas.

3. Adicione uma coluna `telefone` na tabela `professores` usando `ALTER TABLE`.

4. Tente inserir dois professores com o mesmo email e observe o erro.

5. Crie um mini sistema de biblioteca com as tabelas: `livros`, `leitores` e `emprestimos`. Defina chaves primarias, estrangeiras e constraints.

## Referencias

- [MySQL CREATE TABLE](https://dev.mysql.com/doc/refman/8.0/en/create-table.html)
- [SQL Constraints (W3Schools)](https://www.w3schools.com/sql/sql_constraints.asp)
- [ALTER TABLE (W3Schools)](https://www.w3schools.com/sql/sql_alter.asp)
