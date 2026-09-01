---
slug: "logical-ternary-operators"
modulo: "Módulo 2 — Fundamentos da Linguagem"
título: "Operadores Lógicos e Ternário"
subtitulo: "Combinando condições com and, or, not e ternário"
descricao: "Combine condições com and, or, not, entenda curto-circuito e use o operador ternário."
ordem: 6
proximosPassos:
  - título: "Estruturas Condicionais"
    descricao: "Tome decisões com if, elif e else"
  - título: "Match/Case e Condições Combinadas"
    descricao: "Pattern matching e valores falsy em Python"
quiz:
  - pergunta: "Qual é o operador lógico E em Python?"
    opcoes: ["&&", "AND", "and", "&"]
    correta: 2
    explicacao: "Python usa and (minúsculo). Diferente de JavaScript que usa &&."
    explicacaoErrada: "Em Python os operadores lógicos são palavras: and, or, not. Não &&, || ou !."
  - pergunta: "Qual é o resultado de not True?"
    opcoes: ["0", "None", "False", "true"]
    correta: 2
    explicacao: "not inverte o booleano. not True = False."
    explicacaoErrada: "not inverte: not True = False, not False = True."
  - pergunta: "Qual é a sintaxe do operador ternário em Python?"
    opcoes: ["condition ? a : b", "a if condition else b", "if condition then a else b", "condition && a || b"]
    correta: 1
    explicacao: "Em Python: valor_verdadeiro if condição else valor_falso."
    explicacaoErrada: "A sintaxe é: valor_verdadeiro if condição else valor_falso. Não usa ? : como JavaScript."
  - pergunta: "O que True and False or True retorna?"
    opcoes: ["True", "False", "None", "Erro"]
    correta: 0
    explicacao: "and tem prioridade. True and False = False. Depois: False or True = True."
    explicacaoErrada: "Precedência: and primeiro, or depois. True and False = False, depois False or True = True."
---

## O que são operadores lógicos?

Operadores lógicos combinam condições. Em vez de símbolos como `&&` e `||`, Python usa palavras: `and`, `or` e `not`. Mais fácil de ler, mais fácil de entender.

> [!info]
> Precedencia dos operadores lógicos: `not` primeiro, depois `and`, depois `or`. Na duvida, use parênteses.

## and -- os dois precisam ser True

`and` só retorna `True` se **ambas** as condições forem verdadeiras:

```python
print(True and True)    # → True
print(True and False)   # → False
print(False and True)   # → False
print(False and False)  # → False
```

Na prática:

```python
idade = 25
tem_carteira = True

pode_alugar = idade >= 21 and tem_carteira
print(f"Pode alugar: {pode_alugar}")  # → Pode alugar: True
```

## or -- pelo menos um precisa ser True

`or` retorna `True` se **qualquer uma** das condições for verdadeira:

```python
print(True or False)    # → True
print(False or True)    # → True
print(False or False)   # → False
```

Na prática:

```python
idade = 25
tem_desconto = idade < 18 or idade >= 65
print(f"Desconto: {tem_desconto}")  # → Desconto: False
```

## not -- inverte o valor

`not` simplesmente inverte: `True` vira `False` e vice-versa.

```python
print(not True)   # → False
print(not False)  # → True

saldo = 1500.0
no_verde = not (saldo < 0)
print(f"No verde: {no_verde}")  # → No verde: True
```

## Curto-circuito

Python é esperto: se já sabe o resultado, ele **para de avaliar** o resto da expressao. Isso se chama curto-circuito.

```python
# and para no primeiro False
divisor = 0
if divisor != 0 and 10 / divisor > 2:
    print("OK")
# divisor != 0 já é False, então 10/divisor NÃO é avaliado (evita erro!)

# or para no primeiro True
nome = "" or "Anonimo"
print(nome)  # → Anonimo

nome = "Carlos" or "Anonimo"
print(nome)  # → Carlos
```

Detalhe importante: `and` e `or` retornam o **valor real**, não só `True`/`False`:

```python
print(1 and 2 and 3)     # → 3
print(1 and 0 and 3)     # → 0
print(0 or "" or "Olá")  # → Olá
```

> [!sucesso]
> Use `valor or "padrão"` como um valor padrão rápido. Se `valor` for falsy (vazio, zero, None), o padrão entra no lugar.

## Operador ternário

O ternário é um atalho para escrever um `if/else` em uma linha só. A sintaxe e: `valor_se_true if condição else valor_se_false`.

```python
idade = 20
status = "maior" if idade >= 18 else "menor"
print(status)  # → maior

nota = 7.5
resultado = "Aprovado" if nota >= 7 else "Reprovado"
print(resultado)  # → Aprovado
```

Funciona dentro de f-strings também:

```python
saldo = -50
print(f"Status: {'positivo' if saldo >= 0 else 'negativo'}")
# → Status: negativo

# Singular/plural
qtd = 1
print(f"{qtd} item" if qtd == 1 else f"{qtd} itens")
# → 1 item
```

> [!alerta]
> Se o ternário ficar confuso ou longo demais, use `if/elif/else` normal. Legibilidade vem primeiro.

## Tabela resumo

| Operador | O que faz | Exemplo | Resultado |
|----------|-----------|---------|-----------|
| `and` | Ambos True | `True and False` | `False` |
| `or` | Pelo menos um True | `True or False` | `True` |
| `not` | Inverte | `not True` | `False` |
| ternário | if inline | `"sim" if True else "não"` | `"sim"` |

## Exemplo prático: validação de formulário

```python
nome = input("Nome: ")
idade_str = input("Idade: ")
email = input("Email: ")

nome_valido = len(nome) >= 2
idade_valida = idade_str.isdigit() and int(idade_str) >= 18
email_valido = "@" in email and "." in email

tudo_ok = nome_valido and idade_valida and email_valido

status = "Cadastro aprovado!" if tudo_ok else "Dados inválidos."
print(status)
```

Cada validação é uma condição simples. O `and` combina todas no final. O ternário decide a mensagem.

## Referências

- [Boolean Operations](https://docs.python.org/3/library/stdtypes.html#boolean-operations-and-or-not) -- documentação oficial
- [Conditional Expressions](https://docs.python.org/3/reference/expressions.html#conditional-expressions) -- operador ternário na doc oficial
- [Curso Python #10 - Condicoes](https://www.youtube.com/watch?v=K10u3XIf1-Q) -- Curso em Video, PT-BR
