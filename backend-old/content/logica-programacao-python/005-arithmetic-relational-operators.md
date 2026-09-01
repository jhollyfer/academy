---
slug: "arithmetic-relational-operators"
modulo: "Módulo 2 — Fundamentos da Linguagem"
título: "Operadores Aritméticos e Relacionais"
subtitulo: "Cálculos e comparações em Python"
descricao: "Use operadores aritméticos (+, -, *, /, //, %, **), relacionais (==, !=, >, <) e de atribuição composta."
ordem: 5
proximosPassos:
  - título: "Operadores Lógicos e Ternário"
    descricao: "Combine condições com and, or, not e ternário"
  - título: "Estruturas Condicionais"
    descricao: "Tome decisões com if, elif e else"
quiz:
  - pergunta: "Qual é a diferença entre / e // em Python?"
    opcoes: ["/ é divisão e // é comentário", "/ retorna float e // retorna divisão inteira (truncada)", "São a mesma coisa", "// é divisão e / é módulo"]
    correta: 1
    explicacao: "/ sempre retorna float (7/2 = 3.5). // faz divisão inteira (7//2 = 3)."
    explicacaoErrada: "/ é divisão real (float), // é divisão inteira (trunca as casas)."
  - pergunta: "O que 10 % 3 retorna?"
    opcoes: ["3", "1", "0.33", "10"]
    correta: 1
    explicacao: "% retorna o resto da divisão. 10 ÷ 3 = 3 com resto 1."
    explicacaoErrada: "% é o módulo (resto). 10 ÷ 3 = 3 com resto 1."
  - pergunta: "Qual é o resultado de 2 ** 10?"
    opcoes: ["20", "1024", "100", "210"]
    correta: 1
    explicacao: "** é potência. 2 ** 10 = 2 elevado a 10 = 1024."
    explicacaoErrada: "** é potenciação. 2 ** 10 = 2¹⁰ = 1024."
  - pergunta: "A expressão 1 <= x <= 10 é válida em Python?"
    opcoes: ["Não, causa erro de sintaxe", "Sim, mas sempre retorna True", "Sim, e verifica se x está entre 1 e 10", "Precisa usar parênteses: (1 <= x) and (x <= 10)"]
    correta: 2
    explicacao: "Python permite comparações encadeadas! 1 <= x <= 10 verifica se x está no intervalo."
    explicacaoErrada: "Python suporta isso nativamente. É o mesmo que (1 <= x) and (x <= 10)."
---

## Para que servem operadores?

Python tem operadores para fazer contas e para comparar valores. Os aritméticos resolvem cálculos matemáticos. Os relacionais comparam dois valores e devolvem `True` ou `False`.

Saber a diferença entre `/` e `//`, entender o `%` e usar comparacoes encadeadas vai facilitar muito sua vida nos próximos programas.

> [!info]
> Python segue a mesma ordem da matemática: potência primeiro, depois multiplicação/divisão, depois soma/subtração. Na duvida, use parênteses.

## Operadores aritméticos

Os básicos você já conhece. A novidade são `//` (divisão inteira), `%` (resto) e `**` (potência):

```python
print(15 + 27)   # → 42
print(100 - 37)  # → 63
print(6 * 7)     # → 42
```

| Operador | O que faz | Exemplo | Resultado |
|----------|-----------|---------|-----------|
| `+` | Soma | `15 + 27` | `42` |
| `-` | Subtração | `100 - 37` | `63` |
| `*` | Multiplicação | `6 * 7` | `42` |
| `/` | Divisão (float) | `7 / 2` | `3.5` |
| `//` | Divisão inteira | `7 // 2` | `3` |
| `%` | Resto (módulo) | `10 % 3` | `1` |
| `**` | Potência | `2 ** 3` | `8` |

## / vs // -- divisão real e inteira

Essa é uma das maiores fontes de confusao. A barra simples **sempre** retorna float. A barra dupla corta as casas decimais:

```python
# / sempre retorna float
print(10 / 2)    # → 5.0
print(7 / 2)     # → 3.5

# // corta as casas decimais (divisão inteira)
print(10 // 2)   # → 5
print(7 // 2)    # → 3
```

> [!alerta]
> `//` com negativos arredonda para baixo, não para zero: `-7 // 2` da `-4`, não `-3`.

## % -- resto da divisão

O operador `%` (módulo) retorna o **resto** da divisão. Super útil para saber se um número é par ou impar:

```python
print(10 % 3)    # → 1
print(15 % 5)    # → 0

# Truque: par ou impar
número = 42
if número % 2 == 0:
    print(f"{número} é par")   # → 42 é par
else:
    print(f"{número} é ímpar")
```

## ** -- potência e raiz

`**` e a potenciação. É também serve para raiz quadrada (potência de `0.5`):

```python
print(2 ** 3)    # → 8
print(9 ** 0.5)  # → 3.0 (raiz quadrada)
print(2 ** 10)   # → 1024
```

## Operadores relacionais

Relacionais comparam dois valores e devolvem `True` ou `False`:

```python
idade = 18
print(idade == 18)   # → True
print(idade != 18)   # → False
print(idade > 17)    # → True
print(idade < 21)    # → True
print(idade >= 18)   # → True
print(idade <= 17)   # → False
```

| Operador | Significado | Exemplo | Resultado |
|----------|-------------|---------|-----------|
| `==` | Igual a | `5 == 5` | `True` |
| `!=` | Diferente de | `5 != 3` | `True` |
| `>` | Maior que | `10 > 5` | `True` |
| `<` | Menor que | `3 < 7` | `True` |
| `>=` | Maior ou igual | `5 >= 5` | `True` |
| `<=` | Menor ou igual | `4 <= 3` | `False` |

## Comparacoes encadeadas

Isso e exclusivo do Python! Você pode encadear comparacoes de forma natural:

```python
x = 15
print(10 <= x <= 20)  # → True
print(1 <= x <= 10)   # → False

# Strings comparam pela ordem alfabetica
print("abc" == "abc")   # → True
print("abc" == "ABC")   # → False
print("a" < "b")        # → True
```

> [!sucesso]
> `1 <= x <= 10` é o mesmo que `(1 <= x) and (x <= 10)`, só que muito mais legivel. Usa isso!

## Atribuicao composta

Atalhos para modificar o valor de uma variável:

```python
x = 10
x += 5    # x = x + 5  → 15
x -= 3    # x = x - 3  → 12
x *= 2    # x = x * 2  → 24
x //= 5   # x = x // 5 → 4
x **= 3   # x = x ** 3 → 64
x %= 10   # x = x % 10 → 4
print(x)  # → 4
```

> [!alerta]
> Python não tem `++` nem `--`. Use `x += 1` e `x -= 1`.

## Ordem das operações

Mesma regra da matemática. Parenteses sempre ganham:

```python
print(2 + 3 * 4)    # → 14 (multiplicação primeiro)
print((2 + 3) * 4)  # → 20 (parênteses primeiro)
```

## Exemplo prático: calculadora de IMC

```python
peso = float(input("Peso (kg): "))
altura = float(input("Altura (m): "))

imc = peso / altura ** 2

print(f"Seu IMC: {imc:.1f}")
# Peso (kg): 70
# Altura (m): 1.75
# → Seu IMC: 22.9
```

Aqui `**` tem prioridade sobre `/`, então `altura ** 2` é calculado primeiro. Depois o `peso` e dividido pelo resultado.

## Referências

- [Expressions -- Python docs](https://docs.python.org/3/reference/expressions.html) -- referência oficial sobre operadores
- [Operators and Expressions in Python](https://realpython.com/python-operators-expressions/) -- guia detalhado no Real Python
- [Curso Python #09 - Operadores Aritmeticos](https://www.youtube.com/watch?v=Yrp-EEqkaok) -- Curso em Video, PT-BR
