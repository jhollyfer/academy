---
slug: "for-sequences-break-continue"
modulo: "Módulo 3 — Estruturas de Controle"
título: "For em Sequências, Break e Continue"
subtitulo: "Percorrendo listas, strings e controlando o loop"
descricao: "Percorra listas e strings com for, use enumerate() para índice + valor, e controle o fluxo com break, continue e else."
ordem: 10
proximosPassos:
  - título: "Listas e Tuplas"
    descricao: "Crie e manipule coleções de dados"
  - título: "Funções"
    descricao: "Organize código em blocos reutilizáveis com def"
quiz:
  - pergunta: "O que enumerate() retorna?"
    opcoes: ["Apenas os valores", "Apenas os índices", "Tuplas com (índice, valor)", "Um dicionário"]
    correta: 2
    explicacao: "enumerate() dá pares (índice, valor) a cada volta do loop."
    explicacaoErrada: "enumerate() gera tuplas (índice, valor). Ex: enumerate(['a', 'b']) dá (0, 'a'), (1, 'b')."
  - pergunta: "Qual a diferença entre break e continue?"
    opcoes: ["São a mesma coisa", "break pausa e continue retoma", "break sai do loop, continue pula para a próxima iteração", "break pula uma iteração, continue sai do loop"]
    correta: 2
    explicacao: "break sai do loop inteiro. continue pula o resto da volta atual e vai para próxima."
    explicacaoErrada: "break = sair do loop. continue = pular para próxima volta."
  - pergunta: "Quando o else de um for executa?"
    opcoes: ["Sempre", "Nunca", "Quando o loop termina SEM break", "Quando o loop termina COM break"]
    correta: 2
    explicacao: "else do loop executa só se o loop terminou sem break."
    explicacaoErrada: "O else executa quando o loop termina normalmente (sem break). Se teve break, o else é pulado."
  - pergunta: "Como percorrer uma string caractere por caractere?"
    opcoes: ["for char in string.split():", "for char in string:", "for char in list(string):", "Não é possível"]
    correta: 1
    explicacao: "Strings são iteráveis. for char in 'Python': percorre P, y, t, h, o, n."
    explicacaoErrada: "Basta usar for char in string:. Strings são sequências em Python."
---

## O que é o for em sequências?

O `for` não serve só com `range()`. Você pode percorrer qualquer sequência: listas, strings, tuplas. Com `enumerate()` você pega o índice é o valor ao mesmo tempo.

Para controlar o fluxo dentro do loop, use `break` para sair na hora e `continue` para pular para a próxima volta. Python ainda tem um recurso exclusivo: o `else` no loop, que roda quando o loop termina sem `break`.

> [!info]
> `enumerate()` evita aquele padrão feio de `for i in range(len(lista))`. Use sempre que precisar do índice e do valor.

## Percorrendo listas e strings

Qualquer sequência funciona direto no `for`. Listas entregam cada item, strings entregam cada caractere:

```python
frutas: list[str] = ["maçã", "banana", "laranja"]

for fruta in frutas:
    print(f"Eu gosto de {fruta}")
# → Eu gosto de maçã
# → Eu gosto de banana
# → Eu gosto de laranja
```

```python
# Strings também são sequências
for letra in "Python":
    print(letra, end=" ")
# → P y t h o n
```

## enumerate -- índice + valor

Quando você precisa saber a posição de cada item, `enumerate()` é o caminho:

```python
frutas: list[str] = ["maçã", "banana", "laranja"]

for i, fruta in enumerate(frutas):
    print(f"{i}: {fruta}")
# → 0: maçã
# → 1: banana
# → 2: laranja
```

Dá para começar de outro número com `start`:

```python
alunos: list[str] = ["Ana", "Carlos", "Maria"]

for num, aluno in enumerate(alunos, start=1):
    print(f"Aluno {num}: {aluno}")
# → Aluno 1: Ana
# → Aluno 2: Carlos
# → Aluno 3: Maria
```

## break -- saindo do loop

O `break` encerra o loop imediatamente. Útil para buscas -- achou o que queria, sai fora:

```python
números: list[int] = [10, 25, 37, 42, 58, 63]

for num in números:
    if num == 42:
        print(f"Achei o {num}!")
        break
    print(f"Verificando {num}...")
# → Verificando 10...
# → Verificando 25...
# → Verificando 37...
# → Achei o 42!
```

## continue -- pulando para a próxima volta

O `continue` pula o resto da volta atual e vai direto para próxima iteração:

```python
# Só números pares
for i in range(1, 11):
    if i % 2 != 0:
        continue
    print(i, end=" ")
# → 2 4 6 8 10
```

## break vs continue lado a lado

Visualizando a diferença:

```python
print("--- break ---")
for i in range(1, 6):
    if i == 3:
        break       # SAI do loop
    print(i)
# → 1
# → 2

print("--- continue ---")
for i in range(1, 6):
    if i == 3:
        continue    # PULA o 3
    print(i)
# → 1
# → 2
# → 4
# → 5
```

## else no loop -- recurso exclusivo do Python

O `else` no final de um `for` roda quando o loop termina **sem** `break`:

```python
# Sem break → else executa
for i in range(5):
    print(i, end=" ")
else:
    print("\nTerminou normalmente!")
# → 0 1 2 3 4
# → Terminou normalmente!
```

```python
# Com break → else NÃO executa
for i in range(5):
    if i == 3:
        break
    print(i, end=" ")
else:
    print("\nTerminou normalmente!")  # não aparece!
# → 0 1 2
```

O uso perfeito do `else` e em buscas:

```python
# Verificar se é primo
número: int = 17

for divisor in range(2, número):
    if número % divisor == 0:
        print(f"{número} NÃO é primo (divisivel por {divisor})")
        break
else:
    print(f"{número} E primo!")
# → 17 E primo!
```

> [!alerta]
> O `else` do loop pode confundir no início. Lembre: ele roda quando o loop termina **sem** `break`. Se houve `break`, o `else` é pulado.

## Exercício prático

Dada uma lista de nomes, use `for` com `enumerate` e `break`/`continue` para:

1. Numerar cada nome a partir de 1
2. Pular nomes com menos de 4 letras (use `continue`)
3. Parar ao encontrar um nome específico (use `break`)

```python
nomes: list[str] = ["Ana", "Bruno", "Carlos", "Ed", "Diana", "Fabio"]

# 1. enumerate com start=1

# 2. if len(nome) < 4: continue

# 3. if nome == "Diana": break
```

> [!sucesso]
> Se você consegue combinar `enumerate`, `break` e `continue` no mesmo loop, já tem controle total sobre o `for`.

## Referências

- [for Statements](https://docs.python.org/3/tutorial/controlflow.html#for-statements) -- documentação oficial
- [enumerate()](https://docs.python.org/3/library/functions.html#enumerate) -- documentação oficial do enumerate
- [Curso Python #09 - Estruturas de Repeticao (for)](https://www.youtube.com/watch?v=cL4YDtFnCt4) -- Curso em Video
