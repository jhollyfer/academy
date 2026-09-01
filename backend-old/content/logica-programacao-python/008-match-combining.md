---
slug: "match-combining"
modulo: "Módulo 3 — Estruturas de Controle"
título: "Match/Case e Condições Combinadas"
subtitulo: "Pattern matching e valores falsy em Python"
descricao: "Use match/case (Python 3.10+), combine condições e entenda valores falsy e truthy."
ordem: 8
proximosPassos:
  - título: "Loop For com Range"
    descricao: "Repetições controladas com for e range()"
  - título: "For em Sequências, Break e Continue"
    descricao: "Percorra listas, strings e controle o loop"
quiz:
  - pergunta: "Qual é o equivalente do 'default' do switch em match/case?"
    opcoes: ["default:", "else:", "case _:", "case default:"]
    correta: 2
    explicacao: "case _: (underscore) captura qualquer valor. É o 'default' do match/case."
    explicacaoErrada: "O curinga é case _: (underscore). Captura tudo que não bateu com os outros cases."
  - pergunta: "Quais valores são falsy em Python?"
    opcoes: ["1, 'texto', [1, 2]", "0, '', [], None, False", "'0', '[]', 'False'", "Apenas None é False"]
    correta: 1
    explicacao: "Falsy: 0, 0.0, '' (vazio), [] (vazio), {}, None, False. '0' e 'False' são truthy!"
    explicacaoErrada: "Falsy: 0, '', [], {}, None, False. Strings com conteúdo (mesmo '0') são truthy."
  - pergunta: "Como combinar padrões em um case?"
    opcoes: ["case 1 and 2:", "case 1, 2:", "case 1 | 2:", "case 1 or 2:"]
    correta: 2
    explicacao: "Use | (pipe): case 1 | 2 | 3: significa 'se for 1, 2 ou 3'."
    explicacaoErrada: "Para combinar padrões use | (pipe). Não confundir com or."
  - pergunta: "A partir de qual versão do Python existe match/case?"
    opcoes: ["Python 2.7", "Python 3.8", "Python 3.10", "Python 3.12"]
    correta: 2
    explicacao: "match/case foi introduzido no Python 3.10."
    explicacaoErrada: "match/case é do Python 3.10. Versões anteriores usam if/elif/else."
---

## O que é match/case?

O `match/case` é o "cardápio de opções" do Python. Você passa um valor é ele encontra o caso que combina. Pense nele como um `if/elif/else` mais elegante quando você tem muitas opções fixas.

Disponivel a partir do Python 3.10.

> [!info]
> `case _:` é o curinga -- funciona como o "default" do switch em outras linguagens. Captura tudo que não bateu com os outros cases.

## Match/case básico

A estrutura é simples: `match valor:` seguido de vários `case padrão:`:

```python
comando = input("Comando: ").lower()

match comando:
    case "iniciar":
        print("Iniciando...")
    case "pausar":
        print("Pausado.")
    case "parar":
        print("Encerrando...")
    case _:
        print(f"'{comando}' não reconhecido.")
```

Cada `case` testa um valor. O `case _:` no final pega qualquer coisa que não bateu com os anteriores.

## Combinando padrões com |

Use `|` (pipe) para agrupar vários valores num único case:

```python
dia = 6

match dia:
    case 1 | 2 | 3 | 4 | 5:
        tipo = "Dia útil"
    case 6 | 7:
        tipo = "Fim de semana"
    case _:
        tipo = "Dia inválido"

print(tipo)  # → Fim de semana
```

> [!alerta]
> Use `|` (pipe) para combinar padrões, não `or`. Dentro do `case`, `or` não funciona como você espera.

## Match com guardas (if extra)

Você pode adicionar uma condição extra depois do padrão usando `if`:

```python
nota = 8.5

match nota:
    case n if n >= 9:
        conceito = "Excelente"
    case n if n >= 7:
        conceito = "Bom"
    case n if n >= 5:
        conceito = "Regular"
    case _:
        conceito = "Insuficiente"

print(f"Nota {nota}: {conceito}")  # → Nota 8.5: Bom
```

O `n` captura o valor é o `if` testa a condição. É como ter `elif` dentro do `match`.

## Valores falsy e truthy

Além do `match/case`, Python tem um conceito importante: qualquer valor pode ser tratado como verdadeiro ou falso. Isso permite escrever condições mais limpas.

```python
# Falsy -- tratados como False
print(bool(0))       # → False
print(bool(0.0))     # → False
print(bool(""))      # → False (string vazia)
print(bool([]))      # → False (lista vazia)
print(bool({}))      # → False (dict vazio)
print(bool(None))    # → False
```

```python
# Truthy -- tratados como True
print(bool(1))         # → True
print(bool(-5))        # → True
print(bool("texto"))   # → True
print(bool("0"))       # → True (não é vazio!)
print(bool([1, 2]))    # → True
```

| Valor | Falsy ou Truthy |
|-------|-----------------|
| `0`, `0.0` | Falsy |
| `""` (string vazia) | Falsy |
| `[]`, `{}`, `set()` | Falsy |
| `None` | Falsy |
| `False` | Falsy |
| Qualquer outro valor | Truthy |

> [!alerta]
> `"0"` e `"False"` são **truthy** porque não são strings vazias. Só `""` e falsy.

## Uso prático de falsy/truthy

Saber isso permite escrever condições mais curtas e Pythonicas:

```python
nome = input("Seu nome: ")

# Em vez de: if nome != ""
if nome:
    print(f"Olá, {nome}!")
else:
    print("Não digitou nada.")

# Lista vazia?
itens = []
if not itens:
    print("Lista vazia!")  # → Lista vazia!

# Verificando None antes de usar
resultado = None
if resultado is not None:
    print(resultado.upper())
else:
    print("Sem resultado")  # → Sem resultado
```

> [!sucesso]
> Use `if lista:` para verificar se uma lista tem itens e `if valor is not None:` para checar None. Código mais limpo e Pythonico.

## Exemplo prático: menu interativo

```python
print("=== Sistema ===")
print("1 - Novo cadastro")
print("2 - Consultar")
print("3 - Sair")

opção = input("Escolha: ")

match opção:
    case "1":
        nome = input("Nome: ")
        if nome:
            print(f"Cadastrado: {nome}")
        else:
            print("Nome não pode ser vazio!")
    case "2":
        print("Consultando...")
    case "3":
        print("Até logo!")
    case _:
        print(f"Opção '{opção}' inválida.")
```

O `match` cuida da navegação do menu. Dentro do case `"1"`, o `if nome:` usa truthy/falsy para validar a entrada sem precisar de `!= ""`.

## Referências

- [match Statements](https://docs.python.org/3/tutorial/controlflow.html#match-statements) -- documentação oficial do match/case
- [Structural Pattern Matching](https://realpython.com/python310-new-features/#structural-pattern-matching) -- artigo no Real Python
- [Truth Value Testing](https://docs.python.org/3/library/stdtypes.html#truth-value-testing) -- documentação oficial sobre truthy/falsy
