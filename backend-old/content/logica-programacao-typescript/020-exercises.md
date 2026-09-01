---
slug: "exercises"
modulo: "Módulo 5 — Prática"
título: "Caderno de Exercícios"
subtitulo: "37 desafios do iniciante ao intermediário"
descricao: "Exercícios de lógica com TypeScript: variáveis, operadores, decisão, repetição, arrays e funções — com exemplos de entrada/saída é dicas."
ordem: 20
proximosPassos:
  - título: "Revisitar aulas anteriores"
    descricao: "Volte às lições quando precisar relembrar a teoria"
  - título: "Criar seus próprios testes"
    descricao: "Invente casos extremos: zero, negativo, vazio, valores grandes"
quiz:
  - pergunta: "Qual é a melhor estratégia antes de começar a escrever código para resolver um desafio?"
    opcoes: ["Copiar código de exemplos prontos", "Esboçar o algoritmo em português (pseudocódigo) antes de codar", "Escrever tudo de uma vez e torcer para funcionar", "Começar pelo desafio mais difícil"]
    correta: 1
    explicacao: "✓ Planejar em pseudocódigo ajuda a organizar a lógica antes de pensar na sintaxe."
    explicacaoErrada: "✗ Esboçar em português primeiro separa o raciocínio da sintaxe, evitando retrabalho."
  - pergunta: "Por que é importante testar com 'casos extremos' como zero, valores negativos ou strings vazias?"
    opcoes: ["Porque o professor exige", "Porque esses casos revelam bugs que entradas normais não mostram", "Porque o TypeScript obriga", "Não é importante, basta testar com um exemplo"]
    correta: 1
    explicacao: "✓ Casos extremos expõem falhas que entradas comuns escondem, como divisão por zero ou array vazio."
    explicacaoErrada: "✗ Zero, negativo, vazio — testam os limites da sua lógica e revelam bugs escondidos."
---

Cada desafio tem: **enunciado**, **exemplo de entrada/saída** e **dica**.
Tente resolver antes de buscar qualquer solução. Errar faz parte.

---

## Módulo 1 — Variáveis e Tipos de Dados

### Desafio 1.1 — Ficha de Aluno

Declare variáveis de um aluno: nome, idade, matrícula, nota média e se está ativo. Exiba tudo com template literal.

```
// Saída esperada:
// Aluno: Marcos Rodrigues | Matrícula: 2024001 | Idade: 22 anos
// Nota Média: 8.5 | Status: Ativo
```

> **Dica:** use `const` para dados fixos é o tipo certo para cada info.

---

### Desafio 1.2 — Conversor de Temperatura

Converta uma temperatura de Celsius para Fahrenheit e Kelvin.

```
// Entrada: 100 (Celsius)
// Saída:
// Celsius:    100°C
// Fahrenheit: 212°F
// Kelvin:     373.15K
```

> **Fórmulas:** `F = C * 9/5 + 32` | `K = C + 273.15`

---

### Desafio 1.3 — Troca de Valores

Troque os valores de `a` e `b` **sem variável auxiliar**.

```
// Antes: a = 10, b = 25
// Depois: a = 25, b = 10
```

> **Dica:** pesquise destructuring assignment.

---

### Desafio 1.4 — Detector de Tipo em Runtime

Use `typeof` para detectar e exibir o tipo de variáveis diferentes.

```
// Saída esperada:
// "Marcos" → tipo: string
// 42       → tipo: number
// true     → tipo: boolean
```

---

### Desafio 1.5 — Calculadora de IMC

Calcule o IMC com peso e altura. Exiba com 2 casas decimais.

```
// Entrada: peso = 75, altura = 1.78
// Saída: IMC: 23.67
```

> **Fórmula:** `IMC = peso / (altura * altura)`

---

### Desafio 1.6 — Informações de Produto

Declare dados de um produto, calcule o valor total em estoque é exiba formatado.

```
// Saída esperada:
// Produto: Notebook | Preço: R$ 3.500,00
// Estoque: 12 unidades | Total: R$ 42.000,00 | Disponível: Sim
```

---

## Módulo 2 — Operadores

### Desafio 2.1 — Calculadora Básica

Dados `a` e `b`, mostre o resultado das 5 operações: `+`, `-`, `*`, `/`, `%`.

```
// Entrada: a = 17, b = 5
// Saída:
// 17 + 5 = 22
// 17 - 5 = 12
// 17 * 5 = 85
// 17 / 5 = 3.4
// 17 % 5 = 2
```

---

### Desafio 2.2 — Verificador de Acesso

Dados idade, cadastro e plano premium, use **só operadores lógicos** (sem if/else) para responder:

- Acesso básico? (ter cadastro)
- Acesso premium? (cadastro E premium)
- Bloqueado? (sem cadastro E menor de 18)

```
// Entrada: idade = 17, temCadastro = true, premium = false
// Saída:
// Acesso básico:   true
// Acesso premium:  false
// Bloqueado:       false
```

---

### Desafio 2.3 — Tabela Verdade do AND

Gere as 4 combinações do `&&` e exiba cada resultado.

```
// Saída:
// true  && true  = true
// true  && false = false
// false && true  = false
// false && false = false
```

---

### Desafio 2.4 — Calculadora de Troco

Dados valor da compra e valor pago, calcule o troco.

```
// Entrada: compra = 47.50, pago = 50.00
// Saída:
// Valor da compra: R$ 47.50
// Valor pago:      R$ 50.00
// Troco:           R$ 2.50
// Pagamento exato: false
```

---

### Desafio 2.5 — Verificador de Divisibilidade

Use `%` para checar se um número é divisível por 2, 3, 5 e 10.

```
// Entrada: 60
// Saída:
// Divisível por 2:  true
// Divisível por 3:  true
// Divisível por 5:  true
// Divisível por 10: true
```

---

### Desafio 2.6 — Comparador de Senhas

Verifique se duas senhas são iguais, se têm mais de 8 caracteres e se o cadastro pode ser liberado.

```
// Entrada: senha = "minhasenha123", confirmação = "minhasenha123"
// Saída:
// Senhas iguais:        true
// Tamanho suficiente:   true
// Cadastro liberado:    true
```

---

## Módulo 3 — Estruturas de Decisão

### Desafio 3.1 — Classificador de Notas

Classifique uma nota (0-10): Excelente (>=9), Aprovado (>=7), Recuperação (>=5) ou Reprovado (<5).

```
// Entrada: 6.5
// Saída: Situação: Recuperação
```

---

### Desafio 3.2 — Calculadora com Operação Escolhida

Use `switch` para calcular com base no símbolo (`+`, `-`, `*`, `/`). Trate divisão por zero.

```
// Entrada: 10, "/", 0
// Saída: Erro: divisão por zero não permitida

// Entrada: 10, "*", 4
// Saída: 10 * 4 = 40
```

---

### Desafio 3.3 — Classificador de Triângulo

Dados 3 lados, verifique se forma triângulo. Se sim: Equilátero, Isósceles ou Escaleno.

```
// Entrada: a = 5, b = 5, c = 8
// Saída: Triângulo Isósceles

// Entrada: a = 1, b = 2, c = 10
// Saída: Não forma um triângulo
```

> **Dica:** cada lado deve ser menor que a soma dos outros dois.

---

### Desafio 3.4 — Calculadora de Frete

Calcule o frete pelo peso. Mesmo estado = 20% de desconto.

- Até 1kg: R$ 15
- 1-5kg: R$ 30
- Acima de 5kg: R$ 50

```
// Entrada: peso = 3, destino = "AM", origem = "AM"
// Saída: Frete: R$ 24.00 (com desconto de 20%)

// Entrada: peso = 3, destino = "SP", origem = "AM"
// Saída: Frete: R$ 30.00
```

---

### Desafio 3.5 — Verificador de Ano Bissexto

Regra: divisível por 4, **exceto** por 100, **a menos que** por 400.

```
// 2000 → Bissexto (divisível por 400)
// 1900 → Não bissexto (divisível por 100, mas não por 400)
// 2024 → Bissexto (divisível por 4 e não por 100)
// 2023 → Não bissexto
```

---

### Desafio 3.6 — Semáforo Inteligente

Use switch para exibir instrução e próximo estado do semáforo.

```
// Entrada: "verde"
// Saída:
// Instrução: Siga em frente
// Próximo estado: amarelo
```

---

## Módulo 4 — Estruturas de Repetição

### Desafio 4.1 — Tabuada Completa

Exiba a tabuada de 1 a 10 de um número usando `for`.

```
// Entrada: 7
// Saída:
// 7 x  1 =   7
// 7 x  2 =  14
// ...
// 7 x 10 =  70
```

---

### Desafio 4.2 — Contagem Regressiva

Use `while` para contar de N até 0. No final: "Lançamento!".

```
// Entrada: 5
// Saída:
// 5...
// 4...
// 3...
// 2...
// 1...
// Lançamento!
```

---

### Desafio 4.3 — Soma de Dígitos

Some todos os dígitos de um número inteiro.

```
// Entrada: 4523
// Saída: Soma dos dígitos de 4523 = 14  (4+5+2+3)
```

> **Dica:** use `%` e `Math.floor()` ou converta para string.

---

### Desafio 4.4 — Sequência de Fibonacci

Gere os primeiros N termos (cada número = soma dos 2 anteriores).

```
// Entrada: 10
// Saída: 0 1 1 2 3 5 8 13 21 34
```

---

### Desafio 4.5 — Números Primos até N

Liste todos os primos de 2 até N.

```
// Entrada: 30
// Saída: 2 3 5 7 11 13 17 19 23 29
```

> **Dica:** teste divisores só até `Math.sqrt(N)`.

---

### Desafio 4.6 — Validador com Tentativas

Simule login com 3 tentativas. Acertou = "Acesso concedido". Esgotou = "Conta bloqueada".

```
// Senha correta: "ts2024"
// Tentativa 1: "errada"  → "Senha incorreta. 2 tentativas restantes."
// Tentativa 2: "errada"  → "Senha incorreta. 1 tentativa restante."
// Tentativa 3: "ts2024"  → "Acesso concedido!"
```

> **Dica:** use um array de tentativas e `for` com `break`.

---

### Desafio 4.7 — Padrão de Asteriscos

Use loops aninhados para imprimir um triângulo.

```
// Entrada: 5
// Saída:
// *
// **
// ***
// ****
// *****
```

> **Extra:** inverta o triângulo.

---

## Módulo 5 — Arrays

### Desafio 5.1 — Estatísticas de Notas

Dado um array de notas: maior, menor, média e quantos aprovados (>= 7).

```
// Entrada: [8.5, 6.0, 9.5, 5.0, 7.0, 4.5, 10.0]
// Saída:
// Maior nota:   10.0
// Menor nota:   4.5
// Média:        7.21
// Aprovados:    4 de 7
```

---

### Desafio 5.2 — Remover Duplicatas

Retorne um array só com valores únicos, na ordem original.

```
// Entrada: [1, 2, 2, 3, 4, 3, 5, 1]
// Saída:   [1, 2, 3, 4, 5]
```

> **Dica:** use `includes()` para checar se já foi adicionado.

---

### Desafio 5.3 — Inverter Array

Inverta **sem usar `.reverse()`**.

```
// Entrada: ["a", "b", "c", "d", "e"]
// Saída:   ["e", "d", "c", "b", "a"]
```

> **Dica:** percorra de trás para frente com `for`.

---

### Desafio 5.4 — Segundo Maior Valor

Ache o segundo maior **sem `.sort()`**.

```
// Entrada: [3, 1, 7, 4, 7, 2, 5]
// Saída:   Segundo maior: 5
```

---

### Desafio 5.5 — Alunos com Todas as Notas Acima de 6

Retorne os nomes dos alunos que têm **todas** as notas > 6.

```typescript
// Entrada:
const turma = [
  { nome: "Ana", notas: [7, 8, 9] },
  { nome: "Bruno", notas: [5, 8, 7] },
  { nome: "Carol", notas: [9, 8, 10] },
];

// Saída: ["Ana", "Carol"]
```

> **Dica:** `.filter()` + `.every()`.

---

### Desafio 5.6 — Contador de Ocorrências

Conte quantas vezes cada elemento aparece num array.

```
// Entrada: ["maçã", "banana", "maçã", "laranja", "banana", "maçã"]
// Saída:
// maçã:    3 vez(es)
// banana:  2 vez(es)
// laranja: 1 vez(es)
```

> **Dica:** use um objeto como dicionário `{ [fruta]: contagem }`.

---

### Desafio 5.7 — Mesclar e Ordenar Arrays

Mescle dois arrays ordenados em um só, também ordenado, **sem `.sort()`**.

```
// Entrada: [1, 3, 5, 7] e [2, 4, 6, 8]
// Saída:   [1, 2, 3, 4, 5, 6, 7, 8]
```

---

## Módulo 6 — Funções

### Desafio 6.1 — Funções Matemáticas

Crie: `somar`, `subtrair`, `multiplicar`, `dividir` e `potência`. `dividir` deve dar erro se divisor for zero.

```typescript
function somar(a: number, b: number): number;
function dividir(a: number, b: number): number; // erro se b === 0
```

---

### Desafio 6.2 — Validação de CPF (formato)

Valide se o CPF está no formato `"000.000.000-00"`. Retorne `true` ou `false`.

```
// "123.456.789-09" → true
// "12345678909"    → false
// "123.456.789-0"  → false
```

> **Dica:** cheque `length`, posição dos pontos e do traço.

---

### Desafio 6.3 — Fábrica de Saudações

Crie `criarSaudacao` que recebe o turno e retorna **outra função** que recebe o nome.

```typescript
const saudacaoManha = criarSaudacao("manhã");
console.log(saudacaoManha("Marcos")); // → "Bom dia, Marcos!"
console.log(saudacaoManha("Ana")); // → "Bom dia, Ana!"

const saudacaoNoite = criarSaudacao("noite");
console.log(saudacaoNoite("Bruno")); // → "Boa noite, Bruno!"
```

> **Conceito:** isso é uma **closure** — a função "lembra" do turno.

---

### Desafio 6.4 — Calculadora de Desconto

Receba valor, percentual é uma função de arredondamento opcional (padrão: `Math.floor`).

```typescript
aplicarDesconto(100, 15); // → 85
aplicarDesconto(100, 15, Math.ceil); // → 85
aplicarDesconto(99.9, 10, Math.round); // → 90
```

---

### Desafio 6.5 — Pipeline de Transformação

Receba um valor é um array de funções. Aplique cada uma em sequência.

```typescript
const resultado = pipeline(5, [
  (n: number) => n * 2, // 10
  (n: number) => n + 3, // 13
  (n: number) => n ** 2, // 169
]);
console.log(resultado); // → 169
```

> **Dica:** use `.reduce()`.

---

### Desafio 6.6 — Fatorial Recursivo

Calcule `n!` sem nenhum loop.

```
// fatorial(0) → 1
// fatorial(1) → 1
// fatorial(5) → 120
// fatorial(10) → 3628800
```

> **Regra:** a função chama a si mesma com valor menor e tem um caso base que para.

---

### Desafio 6.7 — Memoização

Crie `memoizar` que retorna uma versão com cache da função — se já foi chamada com os mesmos argumentos, retorna do cache.

```typescript
const fatorialMemo = memoizar(fatorial);

fatorialMemo(10); // calcula e guarda
fatorialMemo(10); // retorna do cache
```

> **Dica:** use um objeto como cache `{ [args]: resultado }`.

---

## Módulo 7 — Prática com Problemas Reais

### Desafio 7.1 — Sistema de Estoque

Crie: `adicionarProduto`, `removerProduto`, `buscarProduto`, `listarEstoque` e `calcularValorTotal`.

```typescript
type Produto = { nome: string; preco: number; quantidade: number };
```

---

### Desafio 7.2 — Jogo de Adivinhação

O computador "sorteia" um número (1-100). O jogador tem 7 tentativas. A cada palpite: "maior", "menor" ou "acertou".

```
// Número secreto: 42
// Tentativa 1: 50 → "Menor! 6 tentativas restantes."
// Tentativa 2: 25 → "Maior! 5 tentativas restantes."
// Tentativa 3: 42 → "Acertou em 3 tentativas!"
```

> **Dica:** use um array com tentativas pré-definidas para testar.

---

### Desafio 7.3 — Analisador de Texto

Dada uma string, retorne: total de palavras, caracteres (sem espaços), palavra mais longa, vogais e 3 palavras mais frequentes.

```
// Entrada: "o rato roeu a roupa do rei de roma"
// Saída:
// Palavras:         9
// Caracteres:       29
// Palavra mais longa: "roupa"
// Vogais:           14
// Mais frequentes:  ["o", "de", "rato"]
```

---

### Desafio 7.4 — Conversor de Bases Numéricas

Converta entre decimal, binário, octal e hexadecimal. **Sem** `parseInt()` ou `.toString(base)`.

```
// decimalParaBinario(10)  → "1010"
// decimalParaOctal(255)   → "377"
// binarioParaDecimal("1010") → 10
```

---

### Desafio 7.5 — Mini Banco de Dados

CRUD completo de usuários com array como banco.

```typescript
type Usuario = { id: number; nome: string; email: string; ativo: boolean };

// criar({ nome: "Ana", email: "ana@email.com" }) → { id: 1, nome: "Ana", ... }
// ler(1) → { id: 1, nome: "Ana", ... }
// atualizar(1, { nome: "Ana Lima" }) → { id: 1, nome: "Ana Lima", ... }
// deletar(1) → true
// listar() → [...]
```

---

### Desafio 7.6 — Calculadora de Parcelamentos

Dado valor, parcelas e juros mensal, calcule cada parcela é o total com juros.

```
// Entrada: valor = 1000, parcelas = 3, jurosMensal = 2%
// Saída:
// Parcela 1: R$ 346.75 | Saldo restante: R$ 673.25
// Parcela 2: R$ 346.75 | Saldo restante: R$ 340.07
// Parcela 3: R$ 346.75 | Saldo restante: R$ 0.00
// Total pago: R$ 1.040.25 | Juros: R$ 40.25
```

> **Fórmula:** `P = PV * (i * (1+i)^n) / ((1+i)^n - 1)`

---

### Desafio 7.7 — Validador de Formulário

Crie funções de validação e `validarFormulario` que retorna os erros encontrados.

```typescript
type FormularioCadastro = {
  nome: string;
  email: string;
  senha: string;
  idade: number;
};

// Regras:
// nome: mínimo 3 caracteres, sem números
// email: precisa ter "@" e "."
// senha: mínimo 8 caracteres, pelo menos 1 número
// idade: entre 18 e 120

// validarFormulario({ nome: "Al", email: "sem-arroba", senha: "abc", idade: 15 })
// → {
//     nome:  "Nome deve ter no mínimo 3 caracteres",
//     email: "Email inválido",
//     senha: "Senha deve ter no mínimo 8 caracteres e conter um número",
//     idade: "Idade mínima é 18 anos"
//   }
```

## Referências

- [JavaScript - MDN Web Docs](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript) — referência completa de JavaScript/TypeScript com guias, tutoriais e documentação de todas as APIs
- [JavaScript Exercises - W3Schools](https://www.w3schools.com/js/js_exercises.asp) — exercícios interativos de JavaScript organizados por tema e nível de dificuldade
- [Exercícios de Lógica de Programação - Curso em Vídeo](https://www.youtube.com/watch?v=8mei6uVttho) — lista de desafios de lógica resolvidos passo a passo em português
