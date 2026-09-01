---
slug: "tipos-de-dados"
modulo: "Modulo 1 -- Fundamentos"
titulo: "Tipos de Dados"
subtitulo: "INT, VARCHAR, BOOLEAN e outros tipos essenciais"
descricao: "Conheca os principais tipos de dados do SQL: numeros, textos, booleanos e datas. Saiba quando usar cada um."
ordem: 2
proximosPassos:
  - titulo: "Criando Tabelas"
    descricao: "Use CREATE TABLE com os tipos certos para cada coluna"
  - titulo: "Inserindo Dados"
    descricao: "Adicione registros nas suas tabelas com INSERT INTO"
quiz:
  - pergunta: "Qual tipo de dado e mais adequado para armazenar a idade de uma pessoa?"
    opcoes: ["VARCHAR(3)", "INT", "DECIMAL(10,2)", "TEXT"]
    correta: 1
    explicacao: "INT e o tipo ideal para numeros inteiros como idade. Nao precisa de casas decimais nem de texto."
    explicacaoErrada: "Idade e um numero inteiro, entao usamos INT. VARCHAR e TEXT sao para textos, DECIMAL para valores com casas decimais."
  - pergunta: "Qual a diferenca entre VARCHAR e TEXT?"
    opcoes: ["VARCHAR aceita numeros e TEXT nao", "VARCHAR tem limite de caracteres e TEXT nao tem limite pratico", "TEXT e mais rapido que VARCHAR", "Nao existe diferenca"]
    correta: 1
    explicacao: "VARCHAR exige que voce defina um tamanho maximo (ex: VARCHAR(100)). TEXT armazena textos grandes sem limite pratico."
    explicacaoErrada: "A principal diferenca e que VARCHAR tem limite definido e TEXT e para textos longos."
  - pergunta: "Qual tipo usar para armazenar o preco de um produto?"
    opcoes: ["INT", "VARCHAR(10)", "DECIMAL(10,2)", "BOOLEAN"]
    correta: 2
    explicacao: "DECIMAL(10,2) armazena valores com precisao exata de 2 casas decimais -- perfeito para dinheiro."
    explicacaoErrada: "Para valores monetarios, use DECIMAL(10,2). INT nao tem casas decimais, VARCHAR e texto, BOOLEAN e verdadeiro/falso."
  - pergunta: "Como o MySQL armazena BOOLEAN internamente?"
    opcoes: ["Como texto 'true' ou 'false'", "Como TINYINT (0 ou 1)", "Como BIT", "Como ENUM('sim','nao')"]
    correta: 1
    explicacao: "No MySQL, BOOLEAN e um alias para TINYINT(1). Armazena 0 para falso e 1 para verdadeiro."
    explicacaoErrada: "MySQL trata BOOLEAN como TINYINT(1) internamente: 0 = falso, 1 = verdadeiro."
  - pergunta: "Qual tipo de dado registra data E hora juntos?"
    opcoes: ["DATE", "TIME", "TIMESTAMP", "YEAR"]
    correta: 2
    explicacao: "TIMESTAMP armazena data e hora juntos, como '2024-03-15 14:30:00'."
    explicacaoErrada: "DATE so guarda a data, TIME so a hora, YEAR so o ano. TIMESTAMP guarda data + hora."
---

## Por que tipos de dados importam?

Quando voce cria uma tabela, precisa dizer ao banco qual **tipo de dado** cada coluna vai armazenar. Isso serve para:

- **Economizar espaco**: um INT ocupa menos espaco que um TEXT
- **Validar dados**: o banco rejeita texto numa coluna INT
- **Melhorar performance**: buscas em colunas tipadas corretamente sao mais rapidas

> [!info]
> Escolher o tipo certo desde o inicio evita muita dor de cabeca depois. Alterar o tipo de uma coluna com milhoes de registros pode ser lento e arriscado.

## Tipos Numericos

### INT -- numeros inteiros

Para qualquer numero sem casa decimal: idade, quantidade, ano.

```sql
CREATE TABLE produtos (
    id INT,
    quantidade_estoque INT,
    ano_lancamento INT
);
```

Variacoes de tamanho:

| Tipo | Faixa | Bytes |
|------|-------|-------|
| TINYINT | -128 a 127 | 1 |
| SMALLINT | -32.768 a 32.767 | 2 |
| INT | -2 bilhoes a 2 bilhoes | 4 |
| BIGINT | -9 quintilhoes a 9 quintilhoes | 8 |

> [!info]
> Use `UNSIGNED` se o valor nunca sera negativo. Exemplo: `INT UNSIGNED` vai de 0 a 4 bilhoes.

### DECIMAL -- numeros com casas decimais

Para valores que precisam de **precisao exata**, como dinheiro.

```sql
CREATE TABLE produtos (
    preco DECIMAL(10, 2)
    -- 10 digitos no total, 2 depois da virgula
    -- Ex: 12345678.99
);
```

A sintaxe e `DECIMAL(precisao, escala)`:
- **Precisao**: total de digitos
- **Escala**: digitos depois do ponto decimal

```sql
DECIMAL(5, 2)   -- aceita de -999.99 a 999.99
DECIMAL(10, 2)  -- aceita de -99999999.99 a 99999999.99
```

> [!alerta]
> Nunca use FLOAT ou DOUBLE para dinheiro! Eles tem erros de arredondamento. Exemplo: `0.1 + 0.2` pode dar `0.30000000000000004`. Use sempre DECIMAL para valores monetarios.

## Tipos de Texto

### VARCHAR -- texto com limite

Para textos curtos e de tamanho previsivel: nome, email, telefone.

```sql
CREATE TABLE alunos (
    nome VARCHAR(100),      -- ate 100 caracteres
    email VARCHAR(255),     -- ate 255 caracteres
    telefone VARCHAR(20)    -- ate 20 caracteres
);
```

O numero entre parenteses e o **maximo** de caracteres. Se o aluno tiver nome com 10 letras, o banco so armazena 10 (nao desperidca espaco).

### TEXT -- texto longo

Para textos grandes sem limite pratico: descricoes, biografias, conteudo de artigos.

```sql
CREATE TABLE postagens (
    titulo VARCHAR(200),
    conteudo TEXT          -- texto longo, sem limite pratico
);
```

| Tipo | Limite | Quando usar |
|------|--------|------------|
| VARCHAR(n) | ate 65.535 caracteres | Nomes, emails, telefones |
| TEXT | ~65 mil caracteres | Descricoes, comentarios |
| MEDIUMTEXT | ~16 milhoes de caracteres | Artigos, conteudo grande |
| LONGTEXT | ~4 bilhoes de caracteres | Raramente necessario |

> [!info]
> Na duvida entre VARCHAR e TEXT, pense: "eu sei o tamanho maximo?" Se sim, use VARCHAR. Se nao, use TEXT.

## BOOLEAN -- verdadeiro ou falso

Para valores binarios: ativo/inativo, sim/nao, publicado/rascunho.

```sql
CREATE TABLE usuarios (
    nome VARCHAR(100),
    ativo BOOLEAN           -- TRUE ou FALSE
);

INSERT INTO usuarios (nome, ativo) VALUES ('Ana', TRUE);
INSERT INTO usuarios (nome, ativo) VALUES ('Carlos', FALSE);

SELECT * FROM usuarios WHERE ativo = TRUE;
-- → Retorna apenas Ana
```

> [!info]
> No MySQL, `BOOLEAN` e um alias para `TINYINT(1)`. Internamente, `TRUE = 1` e `FALSE = 0`. Voce pode usar tanto `TRUE`/`FALSE` quanto `1`/`0`.

## Tipos de Data e Hora

### DATE -- apenas data

```sql
CREATE TABLE eventos (
    data_evento DATE       -- formato: 'YYYY-MM-DD'
);

INSERT INTO eventos (data_evento) VALUES ('2024-03-15');
```

### TIMESTAMP -- data e hora

```sql
CREATE TABLE logs (
    acao VARCHAR(100),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- Preenche automaticamente com a data/hora atual
);

INSERT INTO logs (acao) VALUES ('Usuario logou');
-- criado_em → '2024-03-15 14:30:00' (automatico)
```

| Tipo | Formato | Exemplo |
|------|---------|---------|
| DATE | YYYY-MM-DD | 2024-03-15 |
| TIME | HH:MM:SS | 14:30:00 |
| DATETIME | YYYY-MM-DD HH:MM:SS | 2024-03-15 14:30:00 |
| TIMESTAMP | YYYY-MM-DD HH:MM:SS | 2024-03-15 14:30:00 |
| YEAR | YYYY | 2024 |

> [!info]
> A diferenca entre DATETIME e TIMESTAMP: TIMESTAMP converte para UTC ao salvar e converte de volta ao consultar. DATETIME salva exatamente o que voce passou.

## Tabela Resumo -- Quando Usar Cada Tipo

| Dado | Tipo Recomendado | Exemplo |
|------|-----------------|---------|
| ID / contador | INT (ou BIGINT) | 1, 2, 3... |
| Nome / email | VARCHAR(255) | "Ana Silva" |
| Descricao longa | TEXT | Biografia do aluno |
| Preco / salario | DECIMAL(10,2) | 1499.90 |
| Idade / quantidade | INT | 25 |
| Ativo / publicado | BOOLEAN | TRUE / FALSE |
| Data de nascimento | DATE | 2000-05-20 |
| Data de criacao | TIMESTAMP | 2024-03-15 14:30:00 |

## Exercicios

1. Para cada campo abaixo, escolha o tipo de dado mais adequado e justifique:
   - CPF
   - Salario mensal
   - Numero de filhos
   - Biografia do funcionario
   - Data de admissao
   - Status ativo/inativo

2. Crie uma tabela `funcionarios` com pelo menos 6 colunas usando tipos diferentes (INT, VARCHAR, DECIMAL, BOOLEAN, DATE, TIMESTAMP).

3. Pesquise: qual a diferenca entre CHAR(10) e VARCHAR(10)?

4. Por que nao devemos usar FLOAT para armazenar valores monetarios? Faca um teste: calcule `0.1 + 0.2` em alguma linguagem de programacao e veja o resultado.

## Referencias

- [MySQL Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [W3Schools SQL Data Types](https://www.w3schools.com/sql/sql_datatypes.asp)
