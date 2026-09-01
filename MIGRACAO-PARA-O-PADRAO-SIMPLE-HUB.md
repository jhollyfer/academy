# Migrar um backend AdonisJS para o padrão simple-hub

Registro executável da migração do `backend-old` do adacaibs (AdonisJS v6, Clean
Architecture por camadas de tipo) para o `backend` atual (AdonisJS v7, vertical
slice no molde de `simple-hub/backend`).

Não é um relato do que aconteceu — é a receita para repetir. Cada seção diz o
que fazer, em que ordem, e o que custou caro descobrir na primeira vez.

**Resultado de referência:** 101 commits, 307 testes funcionais, 74 operações
OpenAPI geradas do AST, 48/48 rotas do projeto antigo cobertas, nenhuma coluna
nem índice perdido.

---

## 1. Quando usar isto

O ponto de partida típico é um AdonisJS v6 em camadas por tipo — `app/core`,
`app/domain`, `app/infra` —, onde **um endpoint mora em quatro diretórios** e a
regra de query acaba duplicada entre repositórios. O destino é a arquitetura
vertical slice, onde um endpoint é **um par de arquivos**.

Se o projeto de destino já tem uma referência viva (aqui, `simple-hub/backend`),
ela é a fonte de verdade — mais confiável que qualquer documento que a descreva.
Foi o erro mais caro da nossa primeira tentativa: planejamos em cima do mapa de
arquitetura e erramos verbo, código de status, forma do update e esquema de
variáveis de ambiente. **Leia o código.**

---

## 2. Antes de escrever qualquer linha

### 2.1 Levante o inventário do projeto antigo

Números que você vai precisar para saber quando terminou:

```bash
# rotas
grep -hcE "router\.(get|post|put|patch|delete)\(" app/infra/http/routes/*.ts | paste -sd+ | bc

# domínios, use-cases, validators, migrations
ls app/domain/ && ls app/infra/http/validators/ && ls database/migrations/ | wc -l
```

No adacaibs: 48 rotas, 10 domínios, 15 migrations, 29 specs unitários, 0
funcionais.

### 2.2 Catalogue os bugs conhecidos

Migração é a chance de não portá-los — mas só se estiverem escritos antes, senão
alguém "corrige" de volta por fidelidade. Os do adacaibs:

| Bug | Onde |
|---|---|
| `show` não checa `isLeft()` — responde 200 com um `Error` serializado | controllers |
| `console.log` da senha no sign-in | `authentication` |
| `paginate` filtrando coluna inexistente | `podcast/repository.ts:49` |
| FK de anexo `ON DELETE CASCADE` — apagar a imagem apaga o dono | migrations |
| `OR` de busca fora de subquery — escapa do `AND status = PUBLISHED` | repositórios |
| Zero RBAC | rotas |

### 2.3 Decida antes, não durante

Estas decisões mudam o plano inteiro. Feche todas na largada:

| Decisão | O que escolhemos |
|---|---|
| Base do novo projeto | Zerar e copiar o esqueleto da referência |
| Banco | Migrations do zero, sem passo de migração de dado |
| Papéis | Dois (`ADMINISTRATOR`, `EDITOR`); o admin acumula o purge |
| Upload | Presigned multipart puro, sem processamento no servidor |
| Testes | Só suíte funcional; specs unitários antigos **não** são portados |
| Agrupamento de rotas | Por papel (`/storefront`, `/administrator`), não por recurso |
| Gerenciador | pnpm |

---

## 3. A arquitetura de destino

### 3.1 Os quatro pilares

Se algum destes não se sustenta no código, a migração falhou, mesmo com os
diretórios no lugar certo:

1. **`Either` como retorno, não exceção.** Zero `throw` dentro de use-case.
   Verificação: `grep -rn "throw" app/features/**/*.use-case.ts` deve vir vazio.
2. **Escopo vem da sessão, nunca do payload.** `context.auth.user!.id`, jamais
   um `userId` que o cliente mandou.
3. **Fora de escopo responde 404, não 403.** O 403 é só para papel errado.
   Verificação: o único `HTTPException.Forbidden` da aplicação deve estar no
   `role_middleware`.
4. **Arquivar ≠ apagar ≠ despublicar.** Três operações distintas em todo recurso.

### 3.2 O layout

```
app/
  core/          either.ts, entity.ts, validator.ts, response.ts, openapi/
  exceptions/    http.exception.ts, handler.ts
  features/      <papel>/<recurso>/<ação>.{controller,use-case}.ts
  guards/        cookie-access-tokens.guard.ts
  middleware/    role_middleware.ts
  models/        um por tabela, estendendo a classe gerada
  services/      *.service.ts
```

Fontes únicas, e o motivo de cada uma:

- **`core/entity.ts`** — enums como lookup `as const` + tipo derivado + array de
  valores. Um enum novo entra num lugar e aparece no validator, no model, na
  migration e no OpenAPI.
- **`core/validator.ts`** — todos os schemas VineJS. Regras compartilhadas são
  **funções** (`paginationFields()`, `trashedField()`, `sortFields(columns)`), não
  nós reaproveitados — reaproveitar um nó compartilha opções entre validators.
  E são separadas de propósito: a vitrine não deve anunciar filtro que ignora.
- **`core/response.ts`** — `RESPONSES` chaveado pelo **diretório da feature**,
  com as relações que o `preload` do use-case realmente traz.

### 3.3 Codegen — a peça que sustenta o resto

```ts
// adonisrc.ts
hooks: {
  init: [
    indexEntities({
      transformers: { enabled: true },
      controllers: { source: 'app/features', glob: ['**/*.controller.ts'], importAlias: '#features' },
    }),
    generateRegistry(),
  ],
},
directories: { httpControllers: 'app/features' },
```

Consequências práticas:

- Rotas referenciam `#generated/controllers`, **nunca** string mágica.
- `.adonisjs/` é **versionado** (o `package.json` exporta `./registry` de lá).
- O hook **não** roda em `list:routes` nem em `test`. Depois de criar controller:
  `node ace codegen`.
- `database/schema.ts` é **gerado** por `migration:run` contra o banco vivo e
  **commitado**. Os models estendem `*Schema` e nunca declaram coluna.

---

## 4. O template que se repete

Fixe isto numa fase-piloto. As fases seguintes viram repetição mecânica.

### 4.1 Os 14 arquivos do slice

`app/features/<papel>/<recurso>/` com `paginate`, `show`, `create`, `update`,
`archive`, `unarchive`, `delete`, cada um em `.controller.ts` + `.use-case.ts`.

Por recurso, fora do slice: um bloco em `validator.ts`, um `ModelResource` +
entrada em `RESPONSES`, e o par de subgrupos em `routes.ts`.

### 4.2 Controller

Valida, injeta, converte `Either` em resposta. Nada mais.

```ts
@inject()
export default class CategoryArchiveController {
  static docs = defineDocs({
    summary: 'Arquivar categoria',
    description: 'Envia para a lixeira: grava `deletedAt`. …',
  })

  constructor(private readonly useCase: CategoryArchiveUseCase) {}

  async handle(context: HttpContext) {
    const payload = await IdentifierValidator.validate(context.params)
    const result = await this.useCase.execute(payload)
    if (result.isLeft()) throw result.value
    return context.response.noContent()
  }
}
```

### 4.3 Use-case

Dois aliases de tipo no topo, `try/catch` que loga e devolve `InternalServerError`.

```ts
type Payload = IdentifierPayload
type Response = Either<HTTPException, Category>

@inject()
export default class CategoryArchiveUseCase {
  async execute(payload: Payload): Promise<Response> {
    try {
      const category = await Category.query().where('id', payload.id).whereNull('deletedAt').first()
      if (!category)
        return left(HTTPException.NotFound('Categoria não encontrada', 'CATEGORY_NOT_FOUND'))
      category.deletedAt = DateTime.now()
      await category.save()
      return right(category)
    } catch (error) {
      logger.error({ err: error }, '[categories > archive][error]')
      return left(HTTPException.InternalServerError('Erro interno do servidor', 'CATEGORY_ARCHIVE_ERROR'))
    }
  }
}
```

### 4.4 Verbos e status

| Ação | Verbo | Status |
|---|---|---|
| listar | `GET /` | 200 `{ meta, data }` |
| criar | `POST /` | 201, objeto **nu** |
| ler | `GET :id` | 200 |
| atualizar | **`PUT :id`** | 200 |
| arquivar | `PATCH :id/archive` | 204 |
| restaurar | `PATCH :id/unarchive` | 204 |
| apagar | `DELETE :id` | 204 |

`PUT`, não `PATCH` — e com corpo parcial. O projeto antigo usava `PATCH` com
validator exigindo todos os campos: verbo e schema se contradiziam.

### 4.5 As invariantes

- **`update` valida corpo e params separados** e funde: `{ ...body, ...params }`.
  É parcial: campo ausente é "não mexer"; `null` explícito é que limpa.
- **`create` ressuscita a linha arquivada de mesmo slug** —
  `merge({ ...payload, slug, deletedAt: null })`. É isso que dispensa guarda de
  colisão no `unarchive`. Slug duplicado de registro **vivo** → 409.
- **`delete` conta referências antes de apagar** e só aceita registro já
  arquivado (`409 X_NOT_ARCHIVED`). A busca dele **não** filtra `deletedAt`,
  senão vivo e inexistente cairiam no mesmo 404.
- **`archive` busca só o vivo; `unarchive` só o arquivado.** 404 no caso oposto.
- **`paginate`**: `const PAGE = 1` / `const PER_PAGE = 20` no topo;
  `if (!payload.trashed) whereNull('deletedAt')`; `TrashedModes.ONLY →
  whereNotNull`; **busca `OR` dentro de subquery**; `orderBy(...sortOrder(...))`;
  `{ meta: p.getMeta(), data: p.all() }`.
- `?sort` fora da tupla fechada → **422 apontando o campo**, nunca 500 do banco.
- Códigos de erro em SCREAMING_SNAKE; tag de log `'[recurso > ação][error]'`.
- Anexos conferidos **em uma chamada por campo**, para o 422 nomear o certo.
- Comentários explicando o **porquê**, não o quê.

### 4.6 Rotas

`role([...])` aplicado **no grupo, nunca no endpoint** — rota nova nasce
protegida pelo módulo onde foi colocada. Duas exceções:

```ts
router.group(() => {
  router.patch(':id/archive', [controllers.administrator.products.Archive]).as('archive')
  router.patch(':id/unarchive', [controllers.administrator.products.Unarchive]).as('unarchive')
  router.delete(':id', [controllers.administrator.products.Delete]).as('purge')
    .use(middleware.role(['ADMINISTRATOR']))
}).prefix('products').as('products')
// tudo isso dentro de um subgrupo .as('lifecycle'), senão o nome colide entre recursos
```

E `auth()` **antes** de `role()`. Invertido, um anônimo recebe 403 em vez de
401 — e fica sabendo que o módulo existe.

---

## 5. O plano de fases

A ordem não é gosto: cada fase depende de um artefato gerado pela anterior.

| # | Fase | Por que aqui |
|---|---|---|
| 0 | Fundação: package.json, aliases, adonisrc, codegen, `core/`, exceptions, guard, config | Nada compila antes |
| 1 | Migrations + models | **Postgres antes de qualquer model** — `schema.ts` é regerado contra a conexão viva |
| 2 | `authentication/` + `account/` | A suíte precisa de sessão real para todo o resto |
| 3 | `storages/` | Todo recurso de conteúdo referencia anexo |
| 4 | **Piloto** — um recurso completo | Fixa o template; erre aqui, não em seis lugares |
| 5–8 | Os demais recursos | Repetição mecânica do piloto |
| 9 | `storefront/` | Precisa dos recursos existindo |
| 10 | OpenAPI | Deriva do AST dos controllers, que já têm de existir |
| 11 | Testes, seeders, ferramental, docs | Fecha |

### 5.1 Escolha bem o piloto

O melhor piloto é o recurso **mais completo** — no adacaibs, notícias: tem slug,
galeria, capa, status e categoria. Um recurso pobre não exercita o template e
deixa a descoberta para a fase 6.

### 5.2 O que costuma dobrar o template

Nem todo recurso tem tudo. Documente a subtração no lugar onde ela dói:

- **Sem coluna única** → `create` não ressuscita arquivado e não tem 409: título
  repetido cria um segundo registro. Escreva isso no `defineDocs` e no topo do
  use-case.
- **Sem galeria** → o helper de pivô não entra e o `create` fica com uma escrita
  só dentro da transação — e aí a transação sai (veja §7).
- **Dois anexos** → duas chamadas de `assertExist`, não uma lista junta.

---

## 6. Processo de execução

### 6.1 Spec-driven, uma task por commit

`.specs/features/<nome>/{spec.md,design.md,tasks.md,validation.md}` +
`.specs/STATE.md`. Validadores determinísticos antes de cada passo; uma task =
um commit atômico, com a marcação em `tasks.md` no mesmo commit.

O `STATE.md` guarda as decisões numeradas (`AD-001`, `AD-002`, …) com o
**porquê**. Elas são o que impede um agente futuro de "corrigir" uma escolha
deliberada.

### 6.2 Delegação em lotes sequenciais

Lotes de ~7 tasks, **fases inteiras, nunca partidas**, um worker por lote,
**sequenciais**. Dois workers escrevendo no mesmo diretório se atropelam no
índice do git — e um auditor lendo enquanto outro escreve reporta divergência
que não existe.

Peça a cada worker que relate **o que conferiu e considerou improcedente**. Foi
assim que apareceram os erros das próprias auditorias (§8).

### 6.3 Gates

| Nível | Comando |
|---|---|
| Build | `pnpm lint && pnpm typecheck` |
| Full | `+ node ace test` |
| Docs | `+ node ace openapi:generate --check` |

O gate decide, não a autoavaliação do worker. Nunca enfraquecer, pular ou apagar
teste para passar.

Pre-commit rodando o conjunto inteiro. Comprove que ele **recusa** de verdade:
corrompa o `openapi.json`, tente commitar, confirme que nenhum commit nasceu.

---

## 7. Armadilhas que custaram caro

Cada uma custou pelo menos um retrabalho.

**`requestChecksumCalculation: 'WHEN_REQUIRED'`** é obrigatório no `S3Client`.
O default quebra URLs presigned — o checksum é calculado sobre zero bytes.

**`testUtils.db().truncate()` devolve o teardown, não trunca na chamada.**
Guarde o retorno.

**`setup: [() => testUtils.db().migrate()]` no `bootstrap.ts`.** Sem isso o
schema só nasce como efeito colateral do truncate, e spec que não o chama roda
sem tabela.

**Validator renomeado some do OpenAPI em silêncio.** O `loadValidator` engole a
falha; `lint` e `typecheck` ficam **verdes** e a operação desaparece do
documento. O `--check` é a única guarda. Comprove armando a armadilha.

**Coluna `date` como `varchar`** ordena lexicograficamente. Passa despercebido
enquanto o valor for `YYYY-MM-DD`; `2026-9-10` desmonta. Teste com dois valores
onde alfabético e cronológico **discordam**.

**Instância recém-salva não tem `@computed` resolvido** por hook de leitura. Se
o schema de resposta declara o campo obrigatório, corrija a **declaração**, não
o endpoint.

**`@column.date()` e `@column.dateTime()` serializam diferente.** O gerador
precisa distinguir por `column.meta.type`, senão documenta `date-time` para um
campo que responde `2026-09-10`.

**Transação só com duas ou mais tabelas.** Sobre escrita única é ruído.

**Exceção extraída para helper cega o gerador OpenAPI**, que coleta
`HTTPException.Fábrica('msg','CODE')` por AST do use-case irmão. Mantenha inline.

**`create` deve sincronizar galeria mesmo com lista vazia** — senão linha
ressuscitada herda a galeria de quando foi arquivada. No `update` a distinção se
mantém: `[]` esvazia, ausente preserva.

**Portas.** Se o projeto de referência roda na mesma máquina, dê portas próprias
ao novo (5433, 9002/9003) em vez de derrubar container alheio.

---

## 8. Auditoria final — a parte que não pode faltar

Terminar as tasks não é terminar a migração. Rode **três** verificações
independentes, cada uma com um agente fresco que não escreveu o código.

### 8.1 Ancorada no spec + sensor de discriminação

Para cada critério de aceitação, evidência `arquivo:linha`. Critério sem
evidência localizável é FAIL, não PASS por presunção.

Depois, **mutantes**: quebre o código de propósito e confirme que a suíte falha.

| Mutante | O que prova |
|---|---|
| tirar `whereNull('deletedAt')` do paginate | lixeira não vaza |
| tirar `role` do DELETE | editor não apaga |
| inverter `auth()` e `role()` | anônimo recebe 401, não 403 |
| tirar o filtro `PUBLISHED` da vitrine | rascunho não vaza |
| `update` sobrescrevendo campo ausente | update é parcial |
| tirar a subquery do `OR` | busca não escapa do `AND` |
| `delete` aceitando não arquivado | ciclo de vida é real |
| tirar `serializeAs: null` da senha | senha não vaza |

**Mutante que sobrevive é buraco de cobertura**, não teste aprovado. No adacaibs
um sobreviveu: nove testes de busca montavam o cenário de modo que o registro a
excluir casava pela **primeira** coluna do `OR` — os dois mundos davam o mesmo
resultado e o teste não media nada.

### 8.2 Fidelidade à referência

Compare o **corpo** dos arquivos, não só nomes e diretórios: tag de log, código
de erro, uso de transação, até linha em branco no `handle()`. Classifique em
três baldes: **DIVERGE**, **FALTA**, **OK-DOMÍNIO**.

No adacaibs: 103 convenções conferidas, 85 limpas, 18 desvios — 3 mudando
comportamento (allowlist de CORS morta, ausência de guarda de auto-trancamento,
suíte sem `migrate()`).

### 8.3 Cobertura do projeto antigo

Cruze rota a rota, campo a campo, coluna a coluna, relação a relação. É a única
que pega o que **sumiu**.

Achados nossos: duas rotas de storage nunca portadas (duas telas sem backend),
`currentPassword` perdido no update de conta (**sessão sequestrada trocava a
senha sem provar a atual**), ordem padrão da vitrine virando alfabética, coluna
de busca perdida, default de servidor perdido.

### 8.4 Desconfie das auditorias

As nossas erraram números mais de uma vez: "13 arquivos" quando eram 7; "72
controllers" quando 5 deles eram byte a byte idênticos à referência e compactá-los
**criaria** o desvio; uma seção obsoleta de documentação que já havia sido
reescrita. Uma delas reverteu a própria recomendação depois de contar direito.

Peça sempre evidência `arquivo:linha` **dos dois lados**, e mande o worker
conferir antes de corrigir.

---

## 9. Checklist de encerramento

- [ ] `docker compose up` + `migration:run` + `db:seed` sobem do zero
- [ ] `migration:fresh` regera `schema.ts` **sem diff**
- [ ] `db:seed` duas vezes é idempotente
- [ ] `openapi:generate --check` sai 0; `--strict` sai 0
- [ ] Toda rota casa com **exatamente uma** regra de tag
- [ ] Fluxo ponta a ponta manual: sign-in 204 + `Set-Cookie` → conta 200 → plano
      de upload → `PUT` da parte no bucket → complete → criar com `coverId` →
      vitrine listando só publicado
- [ ] RBAC: editor recebe 403 no DELETE e nas rotas de usuário, 201 no conteúdo
- [ ] Regressões do projeto antigo: arquivado → 404 (não 200 com erro no corpo);
      DELETE sem arquivar → 409; `POST` com slug arquivado ressuscita
- [ ] Todo mutante do §8.1 morre
- [ ] Pre-commit **recusa** commit com documento desatualizado — comprovado
- [ ] `CLAUDE.md` reescrito e cada caminho conferido contra a árvore
- [ ] `.env` fora do versionamento e chave rotacionada

---

## 10. Calibração

Da experiência do adacaibs, para dimensionar a próxima:

| | |
|---|---|
| Tasks planejadas | 76 em 12 fases |
| Lotes | 12 sequenciais, ~7 tasks cada |
| Tempo por lote | 12–25 min |
| Commits finais | 101 |
| Testes funcionais | 307 |
| Operações OpenAPI | 74 |
| Correções pós-auditoria | 22, em 3 ondas |

**A distribuição importa mais que o total:** as 76 tasks planejadas deixaram
passar 22 problemas que só três auditorias independentes encontraram — duas
rotas ausentes, uma falha de segurança, uma allowlist morta, 18 desvios de
fidelidade. Reserve orçamento para essa fase. Ela não é polimento.
