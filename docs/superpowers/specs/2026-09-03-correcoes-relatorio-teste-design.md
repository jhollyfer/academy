# Correções do relatório de teste — fluxo de matrícula e painel

## Contexto

Matheus testou `academy.maiyu.com.br` em 03/09/2026 e levantou 9 achados: um de
comunicação na landing, seis no formulário de matrícula pública, dois no painel.
A exploração do código confirmou seis, refinou dois e derrubou um.

**O que a leitura do código mudou em relação ao relatório:**

| Achado | Veredito da leitura |
| --- | --- |
| 2.2 data futura | Confirmado, com causa diferente da suposta. `withinRange` (`frontend/src/lib/date-field.ts:86`) compara `yyyy-MM` — mês, não dia. Com `BIRTH_RANGE.end = new Date()`, todo dia do mês corrente passa. O `Calendar` recebe só `startMonth`/`endMonth`, sem matcher por dia. Por isso 30/09/2026 entrou em 03/09/2026. |
| 2.5 matrícula sem responsável | **Não reproduzível pelo código.** `backend/app/features/storefront/enrollments/create.use-case.ts:66-89` recusa menor sem responsável, e `backend/tests/functional/storefront-enrollments.spec.ts:55-72` cobre exatamente isso (422 com erro nos três campos). 2.5 e 2.6 são provavelmente o mesmo evento: percorreu as quatro etapas, tomou o 422, voltou para a etapa 3. Confirmar com o protocolo da matrícula de teste. A correção do 2.6 elimina o cenário nas duas leituras. |
| 3.2 / 3.3 tema ausente | **Falso positivo.** `ThemeToggle` mora em `frontend/src/routes/_private/layout.tsx:118`, no `<header>` compartilhado, que é irmão da área rolável e não some com o scroll. Cursos, Usuários e Matrículas herdam o mesmo cabeçalho — não há diferença entre telas. O que sobra é discoverability: um ícone fantasma que um testador real não achou. |

**Achado novo, que o relatório não viu:** `courses.minimumAge` já existe na
tabela e no validator (`backend/app/core/validator.ts:115`, rótulo "a idade
mínima") e **nunca é consultado** no fluxo de matrícula.

**Decisões do dono:** CPF do aluno obrigatório e único **por turma**; idade
mínima = `course.minimumAge` com **14 como piso**; landing mantém o dado mas
perde o destaque; escopo é tudo, em três ondas.

---

## Onda 1 — regras da matrícula (crítico e alto)

Regra que vale nos dois lados entra em **dois arquivos**: `backend/app/core/validator.ts`
e `frontend/src/lib/validator.ts` são cópias literais por decisão registrada
(`frontend/src/lib/validator.ts:24-37`). O mesmo para
`backend/start/validator.ts` ↔ `frontend/src/lib/validator-messages.ts`.

### 1.1 Campo de data com precisão de dia — resolve 2.2

- `frontend/src/lib/date-field.ts:81-92` — `withinRange` passa a comparar
  `yyyy-MM-dd`. Renomear os parâmetros para `minDate`/`maxDate`: o nome atual
  (`startMonth`) é o que induziu a granularidade errada.
- `frontend/src/components/common/date-picker.tsx` — props viram
  `minDate`/`maxDate`. O componente deriva `startMonth`/`endMonth` a partir
  delas (o `captionLayout="dropdown"` do react-day-picker precisa dos meses para
  listar os anos) e passa `disabled={{ before: minDate, after: maxDate }}` ao
  `Calendar`, que é o que barra o dia. Atualizar o JSDoc das props (linhas
  38-53), que hoje documenta a semântica de mês.
- Consumidor de turmas não passa nenhuma das duas — segue funcionando.
- Testes: `frontend/src/lib/date-field.test.ts` ganha o caso de borda que hoje
  falharia (dia posterior a hoje dentro do mês corrente).

### 1.2 Idade mínima por curso, com piso — resolve 2.2 (metade da idade)

- `backend/app/core/entity.ts` — `MINIMUM_ENROLLMENT_AGE = 14` ao lado de
  `LEGAL_AGE` (linha 246), com JSDoc dizendo por que é piso e não regra: curso
  cadastrado sem `minimumAge` não pode abrir a porta para criança.
  Espelhar em `frontend/src/lib/entity.ts`.
- Idade efetiva = `Math.max(MINIMUM_ENROLLMENT_AGE, course.minimumAge ?? 0)`.
- Wizard (`frontend/src/routes/_public/enrollment/index.lazy.tsx:104-107`):
  `BIRTH_RANGE` deixa de ser constante de módulo e passa a derivar do curso
  escolhido na etapa 1 — `maxDate = hoje menos idade efetiva`,
  `minDate = hoje menos 100 anos` (o `1920` fixo de hoje envelhece sozinho).
- **Verificar antes de implementar:** se `minimumAge` chega no payload de
  `GET /storefront/courses`. Se não chegar, incluí-lo é parte desta onda
  (controller + `openapi.json` regenerado no mesmo commit).

### 1.3 Data futura e idade no servidor — resolve 2.2 (o lado que importa)

- **Data futura vai para o validator** (não depende de outro campo):
  `studentBirthDate: vine.date({ formats: ['iso8601'] }).beforeOrEqual('today')`,
  nos dois arquivos de validator. Mensagem nova nos dois mapas.
- **Idade mínima vai para o use-case** (depende da turma escolhida):
  `create.use-case.ts`, logo após a resolução da turma e antes da checagem de
  responsável. Erro por campo em `studentBirthDate`, no mesmo formato do
  `GUARDIAN_REQUIRED` das linhas 66-89 — o comentário de
  `backend/app/core/validator.ts:616-629` explica por que regra de objeto do
  VineJS não serve: reportaria em `meta` e não marcaria o input.
  Código: `AGE_BELOW_MINIMUM`.

### 1.4 Nome sem dígitos — resolve 2.1

- Helper `personName()` nos dois validators, ao lado de `cpf()` e `phone()`:
  `trim().minLength(2).maxLength(160)` mais regex que aceita letras com acento,
  espaço, apóstrofo, hífen e ponto, e recusa dígito.
- **Não exigir duas palavras.** A escola atende o Alto Solimões, e nome
  indígena de palavra única é comum — exigir sobrenome barraria aluno real para
  resolver um problema que não existe. Isso vai para o JSDoc do helper: é
  exatamente o tipo de decisão que o comentário precisa registrar.
- Aplicar em `studentName` e `guardianName`.
- Mensagem `name.regex` nos dois mapas + a chave entra na lista `obrigatorias`
  de `backend/tests/functional/mensagens.spec.ts:23-51`.

### 1.5 CPF do aluno obrigatório e único por turma — resolve 2.3

- Validator: `studentDocument: cpf()` (perde `.nullable().optional()`), nos dois
  arquivos. A validação de dígito verificador já existe
  (`backend/app/core/validator.ts:64-117`) e continua valendo.
- Migration nova alterando `enrollments`: `student_document` para `NOT NULL` e
  índice `unique(['class_id', 'student_document'])`. Por turma, não global:
  permite cursar robótica e web, e repetir no semestre seguinte.
- Use-case: capturar a violação do unique e devolver 422 `DUPLICATE_ENROLLMENT`
  com o erro no campo `studentDocument`.
- **Ressalva registrada no JSDoc do use-case:** a rota é escrita anônima, então
  o 409/422 confirma para qualquer visitante se um CPF já está naquela turma.
  A defesa é o teto que já existe — `enrollmentThrottle`, 10 por hora por IP
  (`backend/start/limiter.ts`) — que inviabiliza varredura mas não consulta
  pontual. Decisão do dono, tomada com a ressalva à vista.
- **Passo de deploy manual:** a coluna tem linhas com `NULL` em produção. O dono
  confirmou que são só dados de teste e que está resetando, então o caminho é
  `node ace migration:fresh --seed` em produção — não o `migration:run --force`
  do pré-deploy, que falharia no `NOT NULL`. Isso apaga as matrículas atuais e
  precisa de aval explícito na hora.
- Regenerar `database/schema.ts` e `openapi.json` no mesmo commit.

### 1.6 CPF do responsável ≠ CPF do aluno — resolve 2.4

- Checagem no `create.use-case.ts`, junto do bloco de responsável (depende de
  dois campos, logo não cabe no validator). Erro em `guardianDocument`, código
  `GUARDIAN_SAME_DOCUMENT`.

### 1.7 Bloquear o avanço da etapa 3 — resolve 2.6 (e mata o cenário do 2.5)

- `index.lazy.tsx`, função `next()` (linhas 460-491). Os campos do responsável
  são `.optional()` no schema por decisão registrada
  (`frontend/src/lib/validator.ts:663-671`), então `form.trigger` passa.
- Seguir o padrão que o arquivo **já usa** para a etapa `curso` (linhas 465-470,
  checagem manual porque `courseId` não é campo do RHF): quando
  `step === 'responsavel'` e `isMinor`, marcar os três campos vazios com
  `form.setError` e não avançar. Sem duplicar o schema.
- As mensagens têm que ser as mesmas que o backend devolve — extrair para
  constante espelhada, para as duas não divergirem em silêncio.

### Testes da onda 1

`backend/tests/functional/storefront-enrollments.spec.ts` ganha: data futura;
idade abaixo do mínimo do curso; idade abaixo do piso de 14 com curso sem
`minimumAge`; CPF ausente; CPF duplicado na mesma turma (recusa); mesmo CPF em
turma diferente (aceita — é a prova do escopo escolhido); CPF do responsável
igual ao do aluno; nome com dígito. `validator.spec.ts` e `mensagens.spec.ts`
passam sozinhos se os rótulos e mensagens entrarem.
Frontend: `validator.test.ts`, `validator-messages.test.ts`, `date-field.test.ts`.

---

## Onda 2 — landing (médio) — resolve 1.1

`frontend/src/routes/_public/-components/market.tsx`:

- Tirar o destaque tipográfico dos quatro valores (`CARDS`, linhas 38-59). O
  dado fica; o tamanho de manchete sai.
- Reescrever o parágrafo das linhas 124-138, que hoje justapõe o preço da
  inscrição à média do júnior. É essa justaposição que se lê como promessa —
  a comparação some, o valor da inscrição continua onde precisa estar.
- Subir a nota de metodologia (linhas 157-163) para junto dos cards. Hoje ela
  está dois parágrafos abaixo, depois do parágrafo regional.
- A abertura da seção (linhas 91-99, "Não é o que a escola promete") já faz o
  trabalho certo e fica como está.

---

## Onda 3 — painel (médio e baixo)

### 3.1 Tema (3.2 / 3.3) — não é defeito

Responder ao Matheus com a evidência: `_private/layout.tsx:118`, cabeçalho
compartilhado pelas três telas. Correção barata e legítima, já que um testador
real não achou o botão: dar `Tooltip` ao `ThemeToggle`
(`frontend/src/components/common/theme-toggle.tsx:34`) — ele tem `aria-label`,
mas nada visível.

### 3.2 Responsividade em notebook (3.4)

Os números medidos explicam o relato. Em 1280px, menos a sidebar expandida
(256px) e o `p-4` do conteúdo, sobram ~1000px — e a soma fixa das colunas é
1186px em Cursos, 1176px em Usuários, 1086px em Matrículas
(`size` obrigatório por causa do `table-layout: fixed`,
`components/common/table/table-grid.tsx:154-167`). A tabela nunca cabe.

- Colapsar a sidebar para o modo ícone (48px, contra 256px) abaixo de ~1280px.
  Hoje ela só vira `Sheet` abaixo de 768px (`frontend/src/hooks/use-mobile.ts:3`)
  e no meio do caminho não responde a nada. Devolve 208px de largura útil.
- Revisar os `size` das colunas de Cursos e Usuários, que são os dois piores
  casos, e/ou esconder coluna secundária na faixa estreita.
- Manter a rolagem horizontal como rede — ela funciona
  (`table-grid.tsx:130-151`), o problema é depender dela sempre.

---

## Ordem, commits e verificação

Três commits, um por onda, em Conventional Commits pt-BR com escopo de domínio
(`fix(matricula):`, `fix(vitrine):`, `fix(painel):`). Artefatos gerados
(`openapi.json`, `database/schema.ts`, `routeTree.gen.ts`) entram no **mesmo**
commit da mudança que os produz — o CI roda `--check`.

Antes de implementar, gravar esta análise em
`docs/superpowers/specs/2026-09-03-correcoes-relatorio-teste-design.md`.

**Verificação de ponta a ponta:**

1. `cd backend && docker compose up -d && node ace migration:fresh --seed`
2. `node ace test` — a suíte funcional roda contra Postgres e MinIO reais
3. `node ace openapi:generate` e conferir que o diff está no commit
4. `pnpm check:backend` e `pnpm check:frontend`
5. `cd frontend && pnpm build && pnpm check-cycles` (o `check-cycles` lê
   `.output/`, então vem depois do build)
6. Manual, em `/enrollment`: aluno de 13 anos é recusado; data de amanhã não é
   selecionável nem digitável; nome com dígito não passa; etapa 3 não avança
   vazia para menor; segundo envio com o mesmo CPF na mesma turma é recusado, e
   na outra turma é aceito
7. Painel em 1280×800: sidebar nasce colapsada e a tabela cabe

**Ponto em aberto que precisa do Matheus:** o protocolo da matrícula de teste do
achado 2.5, para confirmar se foi aluno maior de idade (leitura provável) ou se
existe um caminho que a suíte não cobre.
