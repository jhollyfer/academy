# Playbook: portar um frontend para o padrão de um projeto de referência

> Registro de como a migração de `frontend-old/` (SPA Next.js) para `frontend-old/`
> (TanStack Start, no padrão de `../simple-hub/frontend`) foi conduzida neste
> repositório, escrito para ser reusado no próximo porte.
>
> Números finais: **150 commits**, **116 tasks** em 3 ciclos, **359 arquivos**
> em `src/`, **250 testes em 19 arquivos** (eram zero), três verificações
> independentes PASS e uma auditoria de conformidade arquivo por arquivo.
>
> O que mais vale aqui não são os acertos — são os **erros e as armadilhas**,
> na §7 e na §8. Um porte novo que só leia essas duas seções já sai na frente.

---

## 1. A premissa que sustenta tudo

**A referência é a régua, e o código dela vence a documentação sobre ela.**

Antes de escrever uma linha, existiam dois artefatos:

- `SIMPLE_HUB_FRONTEND_MAP.md` — mapa do projeto de referência, 8 seções, cada
  convenção com `file:line` de evidência.
- O próprio `../simple-hub/frontend/`, no disco, legível.

A regra que foi para o prompt de **todo** worker, sempre no topo, em caixa alta:

> **REGRA ZERO** — estrutura, organização, nomes, ordem de import, estilo e
> densidade de comentário saem da referência. Antes de escrever qualquer
> arquivo, ABRIR o equivalente na referência e ler inteiro. Se o `tasks.md`
> divergir da referência, **a referência vence** — e a divergência é anotada no
> commit.

Isso pagou três vezes. Em três ocasiões o `tasks.md` que **eu** escrevi pedia
uma coisa e a referência fazia outra; nas três, o worker seguiu a referência e
anotou. A mais cara: o `tasks.md` pedia busca com *debounce* na vitrine, e a
referência recusa debounce por escrito — "a busca da vitrine é navegação, e cada
tecla virando entrada no histórico torna o botão voltar inútil".

**Corolário que só ficou claro no fim:** o mapa também erra. Duas afirmações do
`SIMPLE_HUB_FRONTEND_MAP.md` não batiam com o código da própria referência (§7).
Quando mapa e código divergem, **o código manda, e o mapa se corrige**.

---

## 2. Fatiar em ciclos, não em um spec só

O porte tinha ~40 telas. Um spec único seria inexecutável. Ficou em três
ciclos, cada um com `spec.md` → `design.md` → `tasks.md` → execução →
verificação independente:

| Ciclo | Escopo | Tasks |
|---|---|---|
| 1 | Fundação inteira **+ um recurso completo de ponta a ponta** | 44 |
| 2 | Os outros recursos do painel, copiando o molde | 46 |
| 3 | A vitrine pública | 26 |

**A decisão que mais rendeu foi o Ciclo 1 terminar com um recurso vertical
completo**, e não só com infraestrutura. `testimonials` foi escolhido por ser o
mais enxuto que ainda exercita o padrão inteiro: listagem com filtro e
ordenação, criação, edição, detalhe, os três verbos de soft delete, um upload de
imagem, um select e um número com limite.

Com o molde pronto e **verificado**, os seis recursos do Ciclo 2 viraram cópia
com chaves trocadas. O relatório do primeiro deles diz literalmente: *"rotas,
colunas, table, row-actions, detail, form-create/edit são cópia com chaves
trocadas. Nada precisou de estrutura nova."*

**Escolha do recurso-molde:** o mais enxuto que exercita o padrão **inteiro**.
Não o mais rico (caro demais para o primeiro ciclo, e erro nele se multiplica) e
não o mais simples (deixa buraco que só aparece no quinto recurso).

---

## 3. Orquestração por sub-agentes

Cada ciclo foi executado por workers em lotes sequenciais, um lote por conjunto
de fases (~6 a 12 tasks). O que funcionou:

**Um commit atômico por task**, com a mensagem já escrita no `tasks.md`. Quando
um worker morreu no meio (queda de conexão, fim de processo), **nada se perdeu**
— as tasks commitadas estavam no histórico e a seguinte retomou do ponto exato.
Isso aconteceu **três vezes** e em nenhuma houve retrabalho.

**O prompt do worker carrega o estado, não só a tarefa.** Cada lote recebia:

1. A REGRA ZERO.
2. O estado atual (o que existe, quais gates estão verdes, quantos testes).
3. **Os avisos herdados do lote anterior** — a parte mais valiosa. Exemplo real
   passado adiante: *"`useResourceForm` não infere os genéricos quando `defaults`
   é `DefaultValues<>`: passe os três explícitos"*. Sem isso, cada worker
   redescobriria o mesmo tropeço.
4. O contrato do backend para aquela fatia (campos, códigos de erro, chaves de
   ordenação aceitas — chave errada vira `422` em produção).
5. As armadilhas operacionais já mapeadas (§8).
6. O relatório final pedido em formato fixo, incluindo **divergências e erros
   literais de pé**.

**O relatório do worker é o insumo do próximo prompt.** Ler o relatório e
destilar os avisos foi metade do trabalho de orquestração.

**Dois workers em paralelo funciona; três começa a doer.** Painel e vitrine
correm independentes porque tocam árvores diferentes. Mais que isso e a
contenção de git e do banco de teste (§8) come o ganho.

---

## 4. Verificação: autor ≠ verificador, evidência ou zero

Ao fim de cada ciclo, um agente **que não escreveu o código** verifica, com três
instrumentos:

**Checagem ancorada no spec.** Cada critério de aceite recebe PASS / PARCIAL /
FAIL com `file:line`. Onde há teste, confirma-se que o **valor asserido** bate
com o resultado que o spec define — não que o teste apenas exista.

**Sensor de discriminação.** Injeta falhas de comportamento num scratch isolado
(cópia de arquivo ou `git worktree add --detach` — **nunca `git stash`**),
confirma que a suíte as mata, descarta o scratch e confere que o
`git status --porcelain` voltou ao estado anterior. Mutante que sobrevive é
buraco de cobertura.

Resultado real:

| Ciclo | Mutantes | Mortos de imediato | Depois da correção |
|---|---|---|---|
| 1 | 19 | 16 | 19 |
| 2 | 23 | 12 | 21 |
| 3 | 9 | 9 | 9 |

**Os sobreviventes valeram o custo inteiro do método.** No Ciclo 1, três
mutantes viveram em `use-resource-form.ts` — remover `invalidateQueries`,
remover `router.navigate`, remover o `retry` do `onError` passavam batido. É o
hook que carrega três critérios de aceite para **todos** os formulários do
painel. No Ciclo 2, nove viveram porque `lib/validator.ts` cresceu 742 linhas
sem uma linha de teste — inclusive **remover o `passwordConfirmation`**, que era
a correção de maior risco do ciclo.

**O verificador corrige apenas testes.** Defeito em código de produção ele
**reporta**; a correção é uma task com autor.

---

## 5. A verificação de ciclo não substitui auditoria de conformidade

Este foi o aprendizado mais caro, e vem de o usuário ter perguntado **quatro
vezes** se a migração seguira mesmo o padrão. Cada pergunta rendeu.

Os verificadores comparam o código com o **spec do ciclo**, e amostram 6 a 8
arquivos para fidelidade à referência. **Nenhum varre a árvore inteira.** Foi
assim que passaram:

- sete `form-fields.tsx` colocados um nível acima do correto;
- cinco peças de vitrine em `components/common/`, que a referência reserva para
  mecanismo agnóstico de domínio;
- um `CopyIdMenuItem` ausente, que a referência usa em 25 de 25 menus de linha;
- um `.vscode/settings.json` mandando o editor formatar com uma ferramenta
  removida do projeto;
- um `.env.production` ausente, fazendo o build de produção embutir
  `localhost:3333` **em silêncio**;
- um `check-chunk-cycles.mjs` portado e nunca invocado;
- `components/ui/` **re-gerado de um snapshot diferente do shadcn** em vez de
  copiado, deixando `'use client'` incoerente nos dois sentidos.

**Faça a auditoria mecânica, não por amostra.** O método que finalmente fechou:

```bash
# 1. Inventário: o que existe nos dois lados, só num, só no outro.
comm -12 <(cd $REF && find . -type f | LC_ALL=C sort) \
         <(cd $NOVO && find . -type f | LC_ALL=C sort) > ambos.txt

# 2. Dos que existem nos dois: quantos são idênticos byte a byte.
while read -r f; do diff -q "$REF/$f" "$NOVO/$f" >/dev/null || echo "$f"; done < ambos.txt

# 3. Ranquear os diferentes por tamanho de diff.
while read -r f; do echo "$(diff "$REF/$f" "$NOVO/$f" | grep -c '^[<>]') $f"; done < diferentes.txt | sort -rn
```

Neste porte: **185 arquivos nos dois lados, 89 idênticos byte a byte, 96 com
diferença**.

**O tamanho do diff prediz a natureza do achado**, e por isso a classificação se
divide em dois lotes:

- **Diff grande é domínio.** `validator.ts` diferia em 2606 linhas porque copia o
  schema do backend *deste* projeto. Ali não se audita conteúdo, se audita
  **forma**: seções, ordem, convenções de export, densidade de JSDoc.
- **Diff pequeno é onde mora a deriva.** Um arquivo que deveria ser cópia e
  difere em duas linhas geralmente perdeu um comentário ou uma diretiva. Dos 56
  com diff ≤ 20 linhas, **13 eram deriva**.

Classifique cada diferença em: **domínio** (legítimo), **correção** (o port
melhorou a referência — vale destacar), **deriva** (achado) ou **divergência
deliberada** (o motivo está escrito no arquivo; julgue se se sustenta).

---

## 6. O que o código tem de carregar

**JSDoc explicando o *porquê*, não o *quê*.** É o padrão mais forte da
referência e o mais fácil de perder num port. Um comentário que diz o que a
função faz é ruído; um que diz qual sintoma ela evita é o que impede o próximo
refactor de reintroduzir o bug. Exemplo real, preservado no port:

> `runBulk` usa `Promise.allSettled` e não `Promise.all`: com `all` a primeira
> falha aborta e a pessoa fica com metade arquivada sem saber qual metade.

**Divergência deliberada se registra no código, não só no commit.** Toda vez que
o port precisou divergir, o motivo foi para o JSDoc do arquivo. Quem lê daqui a
um ano vê a decisão, não o resultado dela.

**Comentário que descreve o sintoma sem apontar o remédio é dívida.** Um JSDoc
aqui dizia que campo sem rótulo "passa despercebido" — e a frase da referência
que nomeava o teste responsável por pegá-lo tinha sido apagada junto com o
teste. O comentário admitia o problema e não apontava saída.

---

## 7. Erros cometidos, e o que custaram

Registrados porque são o que mais economiza tempo no próximo porte.

**Escrevi uma Test Coverage Matrix errada.** Afirmei que a referência só testa
`src/lib/`. Falso — `use-resource-form.test.ts` existe lá, com 202 linhas. A
premissa errada deixou `src/hooks/` fora da matriz, e foram os três mutantes
sobreviventes do Ciclo 1. **Verifique a afirmação sobre a referência olhando a
referência**, não a memória.

**Meu `git add` engoliu trabalho de outro worker, duas vezes.** Eu vinha
avisando cada worker a usar `git commit -- <paths>` e caí na própria armadilha:
`git add <arquivos>` seguido de `git commit` sem pathspec commita **tudo que
está no índice**, inclusive o que outro agente acabou de preparar. O trabalho
voltou intacto com `reset --soft`, mas o histórico ficou com nove renames num
commit que não era deles.

**Quase "consertei" um bug que não existia.** Um verificador classificou como
grave o reenvio nunca oferecido no `409`. Fui conferir a referência antes de
mexer: `retry` é o reenvio **do 5xx**, e o `409` é a condição que torna esse
reenvio seguro na criação — se o backend recusa duplicata, um 5xx reenviado leva
`409` em vez de gravar duas vezes. **O erro era do meu spec.** Reenviar após um
`409` daria `409` de novo. **Antes de corrigir código que a auditoria acusou,
confirme na referência de quem é o erro.**

**Mandei extrair um componente para o lugar errado.** Ao corrigir uma
duplicata, instruí `components/common/`; o worker conferiu a referência e
apontou `administrator/-components/` — as duas rotas são da mesma área, e o
ancestral comum é ela. Na referência, a peça equivalente só sobe mais porque lá
são três áreas. **A regra de colocação mede o ancestral comum dos consumidores,
não o nível hierárquico.**

**Portei um verificador e não o liguei.** `check-chunk-cycles.mjs` entrou no
repositório e nada o invocava — nem script, nem CI. Ficou decorativo até a
auditoria seguinte. **Artefato de CI portado sem a CI é enfeite.**

**Deixei um mecanismo temporário virar permanente.** Itens de menu apareciam
desabilitados enquanto os recursos não existiam. Quando todos passaram a
existir, o mecanismo ficou — com ramos inalcançáveis e um JSDoc que afirmava o
contrário do que o código fazia. **Andaime tem data de remoção.**

---

## 8. Armadilhas operacionais mapeadas

Custaram tempo real. Passe-as no prompt de todo worker.

| Sintoma | Causa e saída |
|---|---|
| `git add -A` leva arquivos de outro agente | **Sempre `git commit -- <pathspec>`.** Nunca `add` abrangente com workers em paralelo |
| `fatal: cannot lock ref 'HEAD'` / `index.lock` | Dois agentes commitando. Laço de espera de alguns segundos e repete |
| Hook de pre-commit falha com `deadlock detected`, FK em `auth_access_tokens`, `db:seed failed` ou `EADDRINUSE` | Dois workers rodando a suíte do backend contra o **mesmo banco de teste**. Repetir resolve; isolado passa. `--no-verify` só como último recurso, com o motivo no corpo |
| `pnpm format` sobrescreve arquivos alheios | O repositório tem arquivos commitados fora do padrão do Prettier. Use `pnpm lint` e formate só o arquivo em mão |
| `typecheck` falha em rota recém-criada com `TS2820`/`TS2345` | `pnpm build` regenera o `routeTree.gen.ts`. **Rode o build primeiro** e inclua o `routeTree.gen.ts` no commit da task de rotas |
| `TS2307` apontando para `-components/` no meio de uma fase | Esperado: as rotas nascem antes dos componentes. Fecha na última task da fase. **Reporte o estado, não declare verde** |
| `something prevents Vite server from exiting` no vitest | Ruído conhecido, exit code 0. Não conserte |
| `mkdir: unexpected argument '-c'` | Um hook reescreve o comando. Use `/bin/mkdir` |
| `git commit -- <path>` falha em arquivo novo | `git add <path>` antes |

---

## 9. Checklist para o próximo porte

**Antes de escrever código**

- [ ] Existe um mapa da referência com `file:line`? Se não, faça — foi o que
      tornou a REGRA ZERO verificável.
- [ ] O contrato do backend está levantado? Campos por recurso, **chaves de
      ordenação aceitas** (chave errada vira `422`), códigos de erro, formato do
      envelope de erro, fluxo de upload.
- [ ] O escopo está fatiado em ciclos, e o primeiro termina com **um recurso
      vertical completo**?
- [ ] A Test Coverage Matrix foi escrita **olhando os testes da referência**, e
      não de memória?

**Durante**

- [ ] Todo worker recebe REGRA ZERO, estado atual, avisos herdados, contrato e
      armadilhas.
- [ ] Um commit atômico por task, com a mensagem já no `tasks.md`.
- [ ] Todo `git commit` com pathspec explícito.
- [ ] Divergência da referência vai para o JSDoc do arquivo, não só para o
      commit.
- [ ] Andaime (item desabilitado, mock, placeholder) nasce com data de remoção.

**Ao fim de cada ciclo**

- [ ] Verificador independente, com sensor de discriminação em scratch isolado
      (**nunca `git stash`**).
- [ ] Mutante sobrevivente vira teste; defeito de produção vira task.

**Ao fim de tudo — e não pule esta**

- [ ] Auditoria mecânica: inventário completo, contagem de idênticos, os
      diferentes ranqueados por tamanho de diff e classificados um a um.
- [ ] Verificar o que **nenhuma** camada cobre: `.vscode/`, `.env.production`,
      `README.md`, `.cta.json`, `public/`, CI, scripts de verificação.
- [ ] `grep` do que não pode existir: a ferramenta de lint antiga, a lib de
      ícones antiga, o cliente HTTP antigo, `forwardRef`, dados de exemplo.
- [ ] Dependência sem consumidor: `for d in $(deps); do grep -rl "$d" src/; done`.
- [ ] O build de produção aponta para o endereço certo? Confira **no bundle**,
      não no arquivo de ambiente.
- [ ] O mapa da referência ainda descreve a referência? Onde divergir, corrija o
      mapa.

---

## 10. O que ficou pendente aqui

Registrado para não parecer que o método fecha tudo:

- **O roteiro manual nunca foi executado** — não havia navegador em nenhum
  ciclo. Toda verificação foi estática, de tipo, de teste e de leitura. O item
  de maior risco é a criação de usuário ponta a ponta.
- **Duas telas sem backend** (contato e inscrição em evento) foram portadas com
  a UI atual e sem envio real, por decisão registrada. O texto de confirmação
  ainda promete o que não acontece.
- **Uma rota curinga** responde `200` em endereço de painel inexistente, em vez
  de `404`. Medido, classificado como menor, registrado.
