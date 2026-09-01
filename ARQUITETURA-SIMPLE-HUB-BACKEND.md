# simple-hub / backend — Mapeamento completo de estrutura e arquitetura

> Documento gerado a partir da leitura direta do código em `/home/jhollyfer/Desktop/simple-hub/backend`.
> Cobre camada a camada, diretório a diretório, arquivo por arquivo.
> Todo arquivo-fonte do repositório aparece aqui.

**Números do repositório**

| Métrica | Valor |
|---|---|
| Arquivos `.ts` em `app/` | 551 (31.699 linhas) |
| Arquivos em `app/features/` | 490 (22.093 linhas) |
| Rotas HTTP registradas | **238** |
| Models Lucid | 27 |
| Services | 12 |
| Migrations | 35 |
| Specs funcionais | 16 |
| Comandos ace próprios | 3 |
| Middlewares | 5 (+1 guard custom) |

---

## Sumário

1. [Visão geral](#1-visão-geral) · [Achados da leitura](#achados-da-leitura)
2. [Mapa de diretórios](#2-mapa-de-diretórios)
3. [Arquitetura em camadas](#3-arquitetura-em-camadas)
4. [Convenções](#4-convenções)
5. [Raiz do projeto](#5-raiz-do-projeto)
6. [`start/`](#6-start)
7. [`config/`](#7-config)
8. [`app/core/`](#8-appcore) · [anatomia dos arquivos grandes](#anatomia-dos-arquivos-grandes-de-appcore)
9. [`app/models/`](#9-appmodels)
10. [`app/services/`](#10-appservices)
11. [`app/middleware/`, `app/guards/`, `app/exceptions/`](#11-appmiddleware-appguards-appexceptions)
12. [`app/features/`](#12-appfeatures)
13. [`database/`](#13-database) · [anatomia do `demo_seeder`](#anatomia-de-databaseseedersdemo_seederts--2003-linhas)
14. [`commands/`, `providers/`, `infra/`, `bin/`](#14-commands-providers-infra-bin)
15. [`tests/`](#15-tests)
16. [`.adonisjs/` — codegen](#16-adonisjs--codegen)
17. [Artefatos gerados](#17-artefatos-gerados)
18. [Índice completo de rotas](#18-índice-completo-de-rotas)

---

## 1. Visão geral

### O que é

Marketplace de artesanato amazônico com **rastreabilidade de origem** e **prestação de contas de impacto socioambiental**. A API serve cinco superfícies distintas, separadas por papel de usuário:

| Superfície | Papel | Natureza |
|---|---|---|
| `/storefront` | — (público, sem sessão) | Vitrine somente leitura |
| `/administrator` | `OWNER`, `ADMINISTRATOR` | Painel da plataforma |
| `/company` | `COMPANY` | Painel da empresa vendedora |
| `/producer` | `PRODUCER` | Painel do artesão |
| `/customer` | `CUSTOMER` | Área do comprador |

Domínios centrais: produto/catálogo, pedido/checkout, origem (território → comunidade → organização → produtor → matéria-prima → técnica), certificação, impacto (projeto → alocação → relatório), passaporte público da peça com QR, upload multipart presigned.

### Stack

| Camada | Tecnologia |
|---|---|
| Framework | AdonisJS `^7.3.3` (ESM puro, `"type": "module"`) |
| Runtime | Node `>=24`, TypeScript `~6.0.3` |
| ORM | Lucid `^22.4.2` + PostgreSQL (`pg`) |
| Auth | `@adonisjs/auth ^10.1.0` — access tokens em cookie `httpOnly` (guard próprio) |
| Validação | VineJS |
| Storage | `@adonisjs/drive ^4.0.0` + `@aws-sdk/client-s3` (S3-compatível: MinIO em dev, R2 em produção) |
| Documentação | OpenAPI gerado do AST dos controllers + Scalar em `/documentation` |
| Cliente tipado | Tuyau (`@tuyau/core`) — registry gerado em `.adonisjs/client/` |
| Testes | Japa (`@japa/runner ^5.3.0`) |
| Gerenciador | pnpm `11.21.0` |

### Comandos

```bash
pnpm dev         # node ace serve --hmr
pnpm build       # node ace build
pnpm start       # node bin/server.js
pnpm test        # node ace test
pnpm lint        # eslint .
pnpm format      # prettier --write .
pnpm typecheck   # tsc --noEmit

node ace openapi:generate            # regenera openapi.json
node ace openapi:generate --check    # falha se o arquivo em disco divergir
node ace storages:prune              # limpa uploads PENDING abandonados
node ace certifications:expire       # expira concessões de selo vencidas
node ace list:routes                 # inventário de rotas
node ace migration:run               # migra e regenera database/schema.ts
```

Infra local: `docker compose up` sobe PostgreSQL 16 + MinIO + bootstrap dos buckets.


### Achados da leitura

Três coisas encontradas ao ler o código arquivo por arquivo. Estão registradas aqui e repetidas no lugar em que aparecem.

**1. `customer/reviews/` existe e não está roteado.** Os quatro controllers (`create`, `update`, `delete`, `paginate`) compilam, estão no `.adonisjs/server/controllers.ts` gerado, e **nenhuma linha de `start/routes.ts` aponta para eles**. A escrita de avaliação pelo comprador está implementada e não exposta — as regras estão lá (só avalia quem tem o produto num pedido `DELIVERED`, uma por produto, remoção lógica). A leitura pública continua em `GET /storefront/reviews` e a moderação em `GET/DELETE /administrator/reviews`. Ver [§12 · `customer/reviews/`](#customerreviews).

**2. `administrator/certifications/delete` consulta uma tabela que não existe.** A guarda de "selo em uso" faz `db.from('product_certifications')`, mas essa tabela foi **substituída por `certification_grants`** — o próprio comentário no topo de `1785920000000_create_certification_grants.ts` diz "Substitui `product_certifications`, e não convive com ela", e nenhuma migration a cria. A consulta lança `relation does not exist`, o `catch` do use-case a converte em **`500`**, e o `delete()` nunca é alcançado: nem para selo em uso (que deveria ser `409 CERTIFICATION_HAS_PRODUCTS`) nem para selo livre. Na prática `DELETE /administrator/certifications/:id` não apaga nada. Os `delete` equivalentes de materiais, técnicas, territórios, comunidades e organizações consultam as tabelas certas.

**3. A arquitetura não é a que o nome dos diretórios sugere.** Não há camada por tipo: é *vertical slice* por papel + recurso + ação, e os módulos **não se importam entre si** por decisão explícita (AD-019). É por isso que `categories/paginate` existe quatro vezes quase idêntico (painel, empresa, produtor, vitrine): o do painel enxerga a lixeira e os outros nunca, e amarrar os quatro faria uma mudança em um vazar para os demais sem ninguém notar.

---

## 2. Mapa de diretórios

```
backend/
├── .adonisjs/              # CODEGEN — controllers, rotas tipadas, registry Tuyau
│   ├── client/
│   │   ├── data.d.ts
│   │   ├── manifest.d.ts
│   │   └── registry/       # index.ts, schema.d.ts, tree.d.ts (Tuyau)
│   └── server/             # controllers.ts, routes.d.ts, events.ts, listeners.ts
├── app/
│   ├── core/               # Either, enums, validators, response, OpenAPI (6.365 l)
│   │   └── openapi/        # 7 arquivos: gerador do documento OpenAPI
│   ├── exceptions/         # HTTPException + handler global
│   ├── features/           # VERTICAL SLICES (22.093 l, 490 arquivos)
│   │   ├── _shared.*.ts    # 15 helpers de domínio compartilhados
│   │   ├── account/
│   │   ├── administrator/  # 18 recursos
│   │   ├── authentication/
│   │   ├── company/        # 19 recursos
│   │   ├── customer/       # orders, reviews
│   │   ├── lookup/         # cep, cnpj
│   │   ├── producer/       # 8 recursos
│   │   ├── storages/       # upload multipart
│   │   └── storefront/     # 12 recursos públicos
│   ├── guards/             # cookie-access-tokens.guard.ts
│   ├── middleware/         # 5 middlewares
│   ├── models/             # 27 models Lucid
│   └── services/           # 12 serviços
├── bin/                    # console.ts, server.ts, test.ts
├── commands/               # 3 comandos ace
├── config/                 # 12 arquivos de configuração
├── database/
│   ├── data/               # ticuna_catalog.ts (catálogo do seed)
│   ├── factories/          # 7 factories
│   ├── migrations/         # 35 migrations
│   ├── seeders/            # 3 seeders + products/base.md
│   ├── schema.ts           # GERADO por migration:run
│   └── schema_rules.ts
├── infra/                  # r2-cors.json
├── providers/              # api_provider.ts, storage_provider.ts
├── start/                  # env, kernel, routes, validator
├── tests/                  # bootstrap, helpers, functional/ (16 specs)
├── tmp/                    # artefatos de teste (db.sqlite3, storage-test/)
├── build/                  # ARTEFATO — saída de `node ace build`
├── openapi.json            # ARTEFATO — 4,8 MB, commitado
├── adonisrc.ts
├── package.json
├── tsconfig.json
├── eslint.config.js
├── docker-compose.yml
├── Dockerfile-production
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── ace.js
├── .env / .env.example / .env.test
└── .dockerignore / .editorconfig / .gitignore / .prettierignore
```

### Linhas por diretório

| Diretório | Linhas |
|---|---|
| `app/features/` | 22.093 |
| `app/core/` | 6.365 |
| `database/` | 5.965 |
| `tests/` | 2.672 |
| `app/services/` | 1.879 |
| `start/` | 1.681 |
| `config/` | 1.507 |
| `app/models/` | 959 |
| `commands/` | 261 |
| `app/exceptions/` | 206 |
| `providers/` | 111 |
| `app/guards/` | 99 |
| `app/middleware/` | 98 |

---

## 3. Arquitetura em camadas

**Não é Clean Architecture por camadas de tipo. É _vertical slice_ por papel + recurso + ação.**

Cada endpoint é um par de arquivos:

```
app/features/<papel>/<recurso>/<ação>.controller.ts
app/features/<papel>/<recurso>/<ação>.use-case.ts
```

### Fluxo de uma requisição

```
HTTP
 │
 ├─ server.use()      force_json_response → container_bindings → cors
 │
 ├─ router.use()      bodyparser → session → shield → initialize_auth → silent_auth
 │
 ├─ rota (start/routes.ts)
 │   └─ middleware nomeado do GRUPO: auth() → role([...])
 │        ordem importa: sem sessão o papel é desconhecido → 401 (auth), nunca 403
 │
 ├─ Controller  (app/features/.../x.controller.ts)
 │   ├─ static docs = defineDocs({ description })   ← alimenta o OpenAPI
 │   ├─ request.validateUsing(XValidator)           ← schema de #core/validator
 │   ├─ injeta o use-case por @inject()
 │   └─ result.isLeft() ? throw result.value : response.ok/created/noContent
 │
 ├─ Use-case  (app/features/.../x.use-case.ts)
 │   ├─ retorna SEMPRE Either<HTTPException, T>
 │   ├─ resolve o ESCOPO da sessão (companyOf / producerOf / _shared.scope.ts)
 │   ├─ valida invariantes que o banco não expressa (_shared.*.ts)
 │   ├─ db.transaction() quando escreve mais de uma tabela
 │   └─ try/catch → logger.error + HTTPException.InternalServerError
 │
 ├─ Model Lucid  (app/models/*.ts)  →  PostgreSQL
 │
 └─ Serialização: ApiSerializer (providers/api_provider.ts) envelopa listas em `data`
```

### Os quatro pilares

**1. `Either` como retorno, não exceção.**
`app/core/either.ts` define `Left` (erro) e `Right` (sucesso) com type guards. Todo use-case devolve `Either<HTTPException, T>`. O controller é quem converte `Left` em `throw`, e o `handler.ts` transforma em corpo JSON. Erro previsto nunca vira exceção lançada dentro do domínio.

**2. Escopo de posse vem da sessão, nunca do payload.**
`companyId`, `userId`, `organizationId` não existem nos payloads de escrita. Saem de `context.auth.user!.id`, e o use-case desce a cadeia `usuário → empresa → organização` por `_shared.organization.ts`. Enviar o campo é inócuo por construção.

**3. Fora do escopo responde `404`, não `403`.**
Recurso de outra empresa é indistinguível de inexistente. `403` só existe quando o **papel** está errado (`role_middleware`), porque aí já se sabe quem chama. Recorte de dados sempre 404.

**4. Arquivar ≠ apagar ≠ despublicar.**
Três operações distintas por recurso: `PATCH :id/archive` grava `deletedAt`; `PATCH :id/unarchive` zera; `DELETE :id` apaga a linha e **só aceita o que já está arquivado**. `status: ARCHIVED` de produto é outra coisa — estado de publicação, gravado por `PUT`.

---

## 4. Convenções

### Path aliases (`package.json` → `imports`)

| Alias | Destino |
|---|---|
| `#features/*` | `./app/features/*.js` |
| `#core/*` | `./app/core/*.js` |
| `#exceptions/*` | `./app/exceptions/*.js` |
| `#models/*` | `./app/models/*.js` |
| `#services/*` | `./app/services/*.js` |
| `#middleware/*` | `./app/middleware/*.js` |
| `#guards/*` | `./app/guards/*.js` |
| `#providers/*` | `./providers/*.js` |
| `#database/*` | `./database/*.js` |
| `#config/*` | `./config/*.js` |
| `#start/*` | `./start/*.js` |
| `#tests/*` | `./tests/*.js` |
| `#generated/*` | `./.adonisjs/server/*.js` |

### Nomenclatura de arquivos

| Padrão | Significado |
|---|---|
| `<ação>.controller.ts` | Entrada HTTP. Valida, injeta, converte `Either` em resposta. |
| `<ação>.use-case.ts` | Regra de negócio. Devolve `Either`. |
| `_shared.<assunto>.ts` (em `app/features/`) | Helper de domínio usado por mais de um papel |
| `_shared.scope.ts` (dentro de um recurso) | Recorte de posse daquele recurso |
| `*.service.ts` | Comportamento com estado/dependência externa (S3, HTTP, QR) |

Ações canônicas: `paginate`, `show`, `create`, `update`, `archive`, `unarchive`, `delete`. Ações específicas: `review`, `transition`, `publish`, `unpublish`, `generate`, `link`, `unlink`, `close`, `pay`, `cancel`, `checkout`, `complete`, `parts`, `download`, `refresh`, `sign-in`, `sign-out`, `sign-up*`.

### Fontes únicas

| Assunto | Arquivo | Por quê |
|---|---|---|
| Enums do domínio | `app/core/entity.ts` | Migration e validator leem o mesmo objeto — não podem divergir |
| Schemas de entrada | `app/core/validator.ts` (2.532 l) | Antes eram 15 `_shared.validator.ts`; um arquivo torna duplicação visível |
| Contrato de resposta | `app/core/response.ts` (884 l) | Antes eram ~60 `_shared.response.ts`; agora deriva do model Lucid |
| Colunas do banco | `database/schema.ts` | **Gerado** por `migration:run`; os models o estendem |
| Referência a controller | `.adonisjs/server/controllers.ts` | **Gerado**; `routes.ts` nunca usa string mágica |

### Regras transversais observadas no código

- **Dinheiro é inteiro em centavos.** `price`, `discountedPrice`, `unitPrice`, `amountInCents`.
- **Percentual é ponto-base.** `shareRate: 500` = 5%. `commissionRate` idem.
- **Toda listagem é paginada** com `?page`, `?perPage`, `?search`, `?sort`, `?direction`, `?trashed`. Padrão: página 1, 20 itens, ordenado por nome ascendente.
- **Documentação da API vem do código.** `static docs = defineDocs({...})` em cada controller; `#core/openapi/introspect` lê o AST para achar o validator e o schema de resposta.
- **Comentários em pt-BR explicam o _porquê_**, com referência a requisito (`RF-xx`, `RN-xx`, `UC-xx`, `RFC 002 §x`).

---

## 5. Raiz do projeto

| Arquivo | Tam. | O que é |
|---|---|---|
| `adonisrc.ts` | 3,8K | Manifesto da aplicação. Registra 12 providers (incl. `#providers/api_provider` e `#providers/storage_provider`), 3 preloads (`#start/routes`, `#start/kernel`, `#start/validator`), suite de teste `functional` com timeout 30s, `metaFiles: ['openapi.json']`. **`directories.httpControllers: 'app/features'`** e o hook `indexEntities` com `source: 'app/features'`, `glob: ['**/*.controller.ts']` — é o que gera `.adonisjs/server/controllers.ts`. `generateRegistry()` do Tuyau gera o registry do cliente. |
| `package.json` | 2,5K | Nome `backend`, ESM, Node ≥24, pnpm 11.21.0. Scripts, os 13 path aliases em `imports`, e `exports` apontando para o registry Tuyau (`./data`, `./registry`). |
| `tsconfig.json` | 149B | Estende `@adonisjs/tsconfig/tsconfig.app.json`. `rootDir: ./`, `outDir: ./build`. |
| `eslint.config.js` | 1,7K | `configApp` do Adonis. Ignora globalmente `database/schema.ts` (gerado). Desliga `@unicorn/filename-case`. Permite `_` inicial em variável não usada — idioma para descartar chave em destructuring (`const { role: _ignorado, ...dados }`). |
| `ace.js` | 802B | Bootstrap do CLI ace. |
| `docker-compose.yml` | 2,6K | Três serviços: **`database`** (postgres:16-alpine, healthcheck `pg_isready`), **`storage`** (MinIO com CORS liberado — o navegador faz `PUT` direto no bucket), **`storage-bootstrap`** (minio/mc: cria `$STORAGE_BUCKET` e `$STORAGE_BUCKET-test`, libera leitura anônima, sai). Volumes nomeados para dados e bucket. |
| `Dockerfile-production` | 3,2K | Multi-stage `node:24-alpine`. Build acontece **dentro** da imagem por causa de binário nativo (`@swc/core`) em multi-arch. Estágio builder roda `node ace build` com env placeholders (o `bin/console.ts` valida `start/env.ts` no boot). `pnpm-workspace.yaml` é copiado para dentro de `build/` — sem ele o pnpm sobe até `/app` e a imagem final sai sem `node_modules`. Runner: usuário `node`, `HEALTHCHECK` em `/health`, `CMD ["node","bin/server.js"]`. **Sem ENTRYPOINT de migration** — migrar é passo de pré-deploy da plataforma. |
| `pnpm-workspace.yaml` | 57B | `allowBuilds`: `@swc/core: true`, `better-sqlite3: false`. |
| `pnpm-lock.yaml` | 187,7K | Lockfile. |
| `openapi.json` | 4,8M | **Artefato commitado**, gerado por `node ace openapi:generate`. Lido do disco na primeira requisição a `GET /openapi.json` e mantido em memória. |
| `.env` / `.env.example` | 768B / 3,4K | Variáveis. Chaves: `TZ`, `PORT`, `HOST`, `NODE_ENV`, `LOG_LEVEL`, `APP_KEY`, `APP_URL`, `SESSION_DRIVER`, `DATABASE_URL`, `UPLOAD_MAX_SIZE`, `STORAGE_KEY`, `STORAGE_SECRET`, `STORAGE_BUCKET`, `STORAGE_ENDPOINT`, `STORAGE_FORCE_PATH_STYLE`. |
| `.env.test` | 1,1K | Sobrescreve para o ambiente de teste: `SESSION_DRIVER=memory`, banco `backend_test`, bucket `backend-test`, `UPLOAD_MAX_SIZE=16 GiB` (para exercitar tamanho acima do teto de `int4`). |
| `.dockerignore` | 260B | Exclui `node_modules`, `build`, `tmp` do contexto de build. |
| `.editorconfig` | 337B | Indentação/charset. |
| `.gitignore` | 318B | `node_modules`, `build`, `tmp`, `.env`. |
| `.prettierignore` | 185B | Exclui gerados. |

---

## 6. `start/`

| Arquivo | Linhas | O que faz |
|---|---|---|
| `env.ts` | 91 | `Env.create` com schema tipado. Valida no boot — **falta variável, a aplicação não sobe**. `UPLOAD_MAX_SIZE` é obrigatória de propósito: teto por arquivo é decisão de quem opera, e um default escondido é um limite que ninguém escolheu. Prefixo `STORAGE_` (não o nome de um fornecedor) porque o código depende do protocolo S3 — R2, Spaces, MinIO trocam mudando o endpoint. |
| `kernel.ts` | 50 | Pilha de middleware em três níveis. **`server.use`** (roda mesmo sem rota): `force_json_response`, `container_bindings`, `cors`. **`router.use`** (rota registrada): `bodyparser`, `session`, `shield`, `initialize_auth`, `silent_auth`. **`router.named`**: `auth`, `role`. Registra o error handler `#exceptions/handler`. |
| `routes.ts` | 1.215 | **Todas as 238 rotas.** Fortemente comentado com a justificativa de cada grupo. Estrutura: `/` → redirect para `/documentation`; `/health` (sonda simples, deliberadamente não o `@adonisjs/core/health`, que exige header secreto); `/openapi.json` (lê do disco, cacheia em memória); `/documentation` (página Scalar); grupo `storefront` (**sem middleware nenhum**, de propósito — quem limita é `StorefrontVisibilityService`); `authentication`; `lookup`; `account` (auth); `storages` (auth) + `storages/:id/download` fora do grupo; `administrator` (auth + role OWNER/ADMINISTRATOR, com subgrupo `lifecycle` onde cada `DELETE` leva `role(['OWNER'])` individual); `company` (role COMPANY); `customer` (role CUSTOMER); `producer` (role PRODUCER). |
| `validator.ts` | 325 | Mensagens de erro em português. `FIELD_LABELS` (rótulo de cada campo) e `RULE_MESSAGES` (mensagem de cada regra VineJS), instalados via `SimpleMessagesProvider`. Coberto por `tests/functional/mensagens.spec.ts` e `validator.spec.ts` — que verificam que nenhuma mensagem escapou em inglês e que não sobra rótulo de campo inexistente. |

---

## 7. `config/`

| Arquivo | Linhas | O que configura |
|---|---|---|
| `app.ts` | 76 | HTTP: `generateRequestId: true`, `allowMethodSpoofing: false`, cookie `httpOnly`, `maxAge: 2h`, `secure` só em produção, `sameSite: lax`. |
| `auth.ts` | 47 | Dois guards. **`api` (default) = `cookieAccessTokensGuard()`** — guard próprio de `#guards/cookie-access-tokens.guard`. `web` = `sessionGuard` com `sessionUserProvider` sobre `#models/user`. Declara os module augmentations `Authenticators` e `EventsList`. |
| `bodyparser.ts` | 78 | `allowedMethods: POST/PUT/PATCH/DELETE`. `convertEmptyStringsToNull` nos três parsers. Multipart com `limit: '20mb'` — **o binário grande não passa por aqui**, vai direto ao bucket por URL assinada. |
| `cors.ts` | 72 | Allowlist a partir de `CORS_ORIGIN` (CSV). Em dev, `origin: true`. `credentials: true` (obrigatório — a sessão é cookie). |
| `database.ts` | 141 | Conexão única `pg` via `DATABASE_URL`. SSL condicional a `DATABASE_SSL`. Migrations com `naturalSort: true` em `database/migrations`. `debug` em dev. |
| `drive.ts` | 80 | Exporta `bucket` e **`clientConfig`** (reaproveitado pelo `storage_provider` para o `S3Client` singleton). Disk `r2` = `services.s3(...)` com `visibility: 'public'` e `cdnUrl` opcional. `requestChecksumCalculation: 'WHEN_REQUIRED'`. |
| `encryption.ts` | 34 | AES-256-GCM com `APP_KEY`. |
| `hash.ts` | 75 | scrypt (`cost: 16384`, `blockSize: 8`, `maxMemory: 32 MiB`). |
| `logger.ts` | 57 | Pino, nome `simple-hub`, nível de `LOG_LEVEL`, destino síncrono fora de produção. |
| `openapi.ts` | 674 | **O maior config.** `SECURITY_SCHEME = 'cookieAuth'`, `SECURITY_COOKIE = 'access-token'`. Lista de `TagRule` (prefixo → nome, descrição, singular, plural) que dá título e texto a cada grupo de rotas no documento, além da lista de rotas ignoradas (`/openapi.json` e `/documentation` não se documentam). |
| `session.ts` | 78 | Cookie `adonis-session`, idade 2h, store de `SESSION_DRIVER` (cookie \| memory \| database). |
| `shield.ts` | 95 | CSP **desligado**, CSRF **desligado** (API consumida por SPA com token em cookie), `xFrame: DENY`, HSTS 180 dias, `contentTypeSniffing` ligado. |

---

## 8. `app/core/`

### Arquivos raiz

| Arquivo | Linhas | Conteúdo |
|---|---|---|
| `either.ts` | 51 | `class Left<L,R>` / `class Right<L,R>` com `isLeft()`/`isRight()` como **type guards** — dentro do `if`, o TS estreita o tipo de `value` sozinho. Helpers `left()` e `right()`. Tipo `Either<L,R> = Left \| Right`. |
| `entity.ts` | 549 | **Vocabulário do domínio.** Enums como lookup object `as const` + tipo derivado + array de valores. Consumido pelas duas pontas: a migration que grava e o validator que recusa. Também: `Merge<A,B>` (interseção achatada), `sortOrder()`, `TERRITORY_DEPTH`, `TRACEABILITY_RANK`, `CRAFTING_STAGES`, `ORDER_TRANSITIONS` (máquina de estados do pedido), `RichDocument`, `PaginationMeta`, `Paginated<T>`. |
| `validator.ts` | 2.532 | **Fonte única dos schemas VineJS.** Regras compartilhadas (`money()`, `productStatus()`, tetos de tamanho de array, CPF/CNPJ com dígito verificador, senha 8–32 com classe de caracteres) e um validator por endpoint (`CompanyProductCreateValidator`, etc.). O gerador de OpenAPI resolve o validator pelo especificador do import no controller. |
| `response.ts` | 884 | **Contrato de resposta de toda a API.** Não redescreve campos: declara o **model Lucid + as relações precarregadas**, e o nome/tipo/visibilidade de cada campo sai do próprio Lucid via `#core/openapi/model-schema`. O que não deriva de model (consultas do `lookup`, agregados de métricas, plano de upload) fica aqui em VineJS. |
| `aggregate.ts` | 55 | Três funções para ler `$extras` do Lucid sem ligar `serializeExtras`: `aggregate(extras, alias)` (resultado de `withCount`, com `Number()` porque `COUNT` do Postgres volta `bigint` em string), `pivotNumber(extras, col)` e `pivotText(extras, col)`. Distinguem `undefined` (não veio pela relação — some do JSON) de `null` (veio e está vazio). |
| `catalog-query.ts` | 98 | Filtros e ordenação compartilhados pelas duas listagens de produto (`administrator` e `company`). `EFFECTIVE_PRICE = COALESCE(discounted_price, price)` — filtro de faixa e ordenação por preço usam o **preço efetivamente cobrado**. Colunas qualificadas com `products.` porque a ordenação por categoria faz join e ambas as tabelas têm `name`/`status`/`created_at`. |

### `app/core/openapi/` — gerador do documento

| Arquivo | Linhas | Papel |
|---|---|---|
| `types.ts` | 189 | Tipos do gerador. `defineDocs()` (usado em todo controller), `list()`, `paginated()`, `isModelResource()`, `isListResource()`, `SchemaObject`, `OperationDocs`, `OpenAPIDocument`. |
| `introspect.ts` | 365 | **Lê o AST do controller** para descobrir qual validator ele usa e qual é o schema de resposta. `controllerPath()`, `loadResponseSchema()`, `introspect()`. Falha de import é engolida (a operação some do documento) — `openapi:generate --check` é o que pega isso. |
| `model-schema.ts` | 263 | Constrói o índice de tipos do projeto (`typeIndex`) e deriva o schema de um model + relações (`modelSchema`). |
| `schema.ts` | 340 | Conversão VineJS → JSON Schema (`toSchema`), merge, `applyFieldPatches`, `toParameters` (path/query), `PAGINATION_META_SCHEMA` e `paginatedSchema`. |
| `errors.ts` | 119 | Componentes de erro por status + códigos. `AUTOMATIC_CODES`, `errorComponentName`, `errorSchema`, `errorResponse`, `forbiddenDescription(roles)`. |
| `field-patches.ts` | 62 | `FIELD_PATCHES` — ajustes pontuais de campo (exemplo, formato) que o schema derivado não expressa. |
| `document.ts` | 807 | **Monta o documento inteiro.** `buildDocument()` percorre as rotas, casa com os controllers, aplica tags de `config/openapi.ts`, e devolve `{ document, warnings, documented, total }`. |
| `scalar.ts` | 51 | `scalarPage(specUrl, title)` — HTML da página de documentação servida em `GET /documentation`. |


### Anatomia dos arquivos grandes de `app/core/`

Os três maiores não cabem numa linha de tabela. Cada um é lido por seções internas marcadas com banners `// ---`.

#### `app/core/validator.ts` — 2.532 linhas, 106 validators

Estrutura em três blocos:

**1. Regras compartilhadas (linhas 41–692).** São **funções, não constantes** — reaproveitar o mesmo nó de schema em dois validators compartilharia as opções entre eles.

| Export | O que é |
|---|---|
| `LIST_LIMITS` | Teto de itens por lista. Os números são do domínio, não redondos por acaso: `SDGS` é 17 porque os ODS são dezessete. Dois doem mais que os outros — `variants` e `traceability` são percorridos com um `await` por elemento **dentro da transação de escrita**, e o teto é o que impede mil idas ao banco com a transação aberta. |
| `email()`, `password()` | `password()` espelha o schema do frontend com **um `regex` por classe de caractere**, para a mensagem apontar exatamente o que falta. `confirmed` lê `passwordConfirmation` do input cru — nenhum schema o declara, e é por isso que ele não aparece no payload validado nem precisa ser descartado no use-case. |
| `cnpj()`, `cpf()` | Dígito verificador conferido, máscara removida. `cnpj()` aceita a forma **alfanumérica** e normaliza para maiúscula. |
| `phone()`, `cep()`, `uf()`, `addressObject()` | Documentos e endereço, sempre sem máscara ao gravar. |
| `activeStatus()`, `manageableRole()` | Enums canônicos em inglês (o rótulo em português fica no frontend). `manageableRole()` **exclui `OWNER`** — o dono nasce só pelo seeder. |
| `paginationFields()`, `trashedField()`, `sortFields(columns)` | Os campos que toda listagem aceita. |
| `*_SORT_COLUMNS` (11 constantes) | As colunas ordenáveis de cada recurso: `CATALOG`, `USER`, `PRODUCT`, `STOREFRONT_PRODUCT`, `ADDRESS`, `ORDER`, `CERTIFICATION`, `TERRITORY`, `COMMUNITY`, `MATERIAL`, `TECHNIQUE`, `ORGANIZATION`, `PRODUCER`. São elas que os controllers interpolam na própria descrição do OpenAPI. |
| `money()`, `storyFields()`, `productVariantFields()`, `onchainFields()`, `traceabilityFields()` | Blocos compostos reaproveitados por produto, história e rastreabilidade. |

**2. Validators globais (693–716).** `IdentifierValidator`, `PaginationValidator`, `TrashablePaginationValidator`, `OrderPaginationValidator`, `ReviewPaginationValidator`, `SdgPaginationValidator`, `Scoped*PaginationValidator` (território, comunidade, matéria-prima, técnica), `OrderTransitionValidator`, `OrderPaymentValidator`.

**3. Um bloco por feature (717–2.532),** na mesma ordem dos módulos. Cada banner nomeia o recurso: `account`, `authentication`, `administrator/customers`, `storages`, `administrator/administrators`, `administrator/categories`, `administrator/subcategories`, `administrator/addresses`, `administrator/companies`, `administrator/products`, `company/addresses`, `company/products`, `producer/products`, `customer/orders`, `company|administrator/orders`, `storefront/companies`, `storefront/producers e communities`, `storefront/products`, `reviews`, `administrator/certifications`, `administrator/territories`, `administrator/communities`, `administrator/materials`, `administrator/techniques`, `administrator/organizations`, `producers`, `certification-grants`, `sdgs`, `impact-projects`, `impact-allocations`, `impact-reports`, `company/passports`, `storefront/passports`, `lookup`.

Distribuição dos 106 validators: **42** `Administrator*`, **27** `Company*`, **7** `Storefront*`, **5** `Customer*`, **4** `Producer*`, **4** `Authentication*`, 2 `Storage*`, 2 `Lookup*`, 1 `Account*`, e os globais.

> O gerador de OpenAPI resolve o validator pelo **especificador do import no controller** e reimporta o módulo. Renomear um export sem atualizar o controller **não quebra o build** — o `loadValidator` engole a falha e a operação some do documento. Quem pega isso é `node ace openapi:generate --check`.

#### `app/core/response.ts` — 884 linhas

Cinco seções:

| Seção | Linhas | Conteúdo |
|---|---|---|
| **Recursos reaproveitados** | 66–211 | 20 `ModelResource` nomeados: `STORAGE`, `STORY_BLOCK`, `TERRITORY`, `COMMUNITY`, `ORGANIZATION`, `USER`, `COMPANY_PROFILE`, `COMPANY`, `CATEGORY`, `SUBCATEGORY`, `MATERIAL`, `TECHNIQUE`, `SDG`, `CERTIFICATION`, `CERTIFICATION_GRANT`, `PRODUCER`, `IMPACT_PROJECT`, `IMPACT_ALLOCATION`, `PRODUCT`, `ORDER`, `REVIEW`. Cada um declara o **model** e as **relações**, não os campos — nome, tipo e visibilidade saem do Lucid via `#core/openapi/model-schema`. |
| **O que não deriva de model** | 213–281 | O pouco que precisa de VineJS: as duas consultas do `lookup`, os agregados de métricas e o plano de upload. |
| **Vitrine** | 283–654 | Os schemas reduzidos que `StorefrontShapeService` produz — `StorefrontProductResponse`, `StorefrontProducerResponse`, `StorefrontCommunityResponse`, `StorefrontOrganizationResponse`, `StorefrontCompanyResponse`, `StorefrontReviewResponse`, `StorefrontCategoryResponse`, `StorefrontCertificationResponse`, `StorefrontTerritoryResponse`, `StorefrontTechniqueFilterResponse`, `StorefrontPassportResponse`. Declarados à parte porque a vitrine **não** devolve o model inteiro. |
| **Lookup, métricas e upload** | 656–743 | Os envelopes que não são recurso. |
| **O registro** | 744–884 | `export const RESPONSES: Record<string, FeatureResponse>` — **a chave é o diretório da feature**, porque as cinco operações de um recurso devolvem a mesma coisa em envelopes que o gerador monta sozinho. Operação que foge disso (`lookup`, `storages`) declara `responses` no próprio controller. **As relações de cada entrada são as que o `preload` do use-case traz**: quando um `preload` novo entra num use-case, é aqui que ele vira contrato. |

#### `app/core/openapi/document.ts` — 807 linhas

Sete seções e uma função pública (`buildDocument`):

| Seção | Linhas | O que faz |
|---|---|---|
| **Resolução do controller** | 89–144 | `isController`, `isLazyController`, `controllerFile(handler)` e `resolveDocs(handler)` — descobrem o arquivo por trás do `() => import(...)` e leem o `static docs`. |
| **Caminho, nome e tag** | 145–267 | `toOpenAPIPath` (`:id` → `{id}`), `camelize`/`pascalize` (nome da operação e dos componentes), `requestContentType`, `resolveTagRule(path)` (casa o caminho contra os **67 prefixos** de `config/openapi.ts`) e `deriveSummary(action, rule)` — é o que transforma `paginate` + `{ plural: 'peças' }` num resumo legível sem ninguém escrevê-lo. |
| **Middleware** | 268–324 | `toRoles(args)` e `readProtection(middleware)` — lê a pilha real da rota e descobre se ela exige sessão e quais papéis, para gerar a resposta `403` com a lista certa. |
| **Contrato** | 325–428 | `impliedSuccess(method)` (o status por verbo) e `buildContract(docs, intro, verb, rule)` — cruza o que o controller declarou com o que `introspect` extraiu do AST. |
| **Respostas** | 429–559 | `isPaginated`, `bodySchema`, `buildSuccessResponses` e `buildErrorResponses` — os erros saem dos **códigos que o use-case irmão realmente lança**, não de uma lista fixa. |
| **Operação** | 560–671 | `buildParameters` (path + query, derivados do validator) e `buildOperation`. |
| **Documento** | 672–807 | `buildDocument()`: lê o `typeIndex` **uma vez** (31 classes geradas + 25 models), percorre `router.toJSON()`, pula o que está em `openapi.ignore` — comparando **as duas formas**, o caminho convertido e o padrão cru do Adonis —, descarta `HEAD` (gerado pelo framework a partir de cada `GET`, documentá-lo duplicaria toda leitura), monta cada operação e devolve `{ document, warnings, documented, total }`. `sortPaths` e `sortKeys` deixam a saída estável, que é o que faz o `--check` funcionar como diff. |

---

## 9. `app/models/`

**Padrão do repositório:** cada model estende uma classe `*Schema` de `#database/schema`, que é **gerada do banco** por `node ace migration:run`. O arquivo do model contém apenas relações, `@computed`, casts e overrides de tipo de enum — nunca a lista de colunas.

| Model | Estende | Relações | Computed / notas |
|---|---|---|---|
| `address.ts` | `AddressSchema` | — | Model vazio: só a herança. |
| `category.ts` | `CategorySchema` | `hasMany` Subcategory, Product | `productsCount` (de `withCount`) |
| `certification.ts` | `CertificationSchema` | `manyToMany` Product e Company (pivô `certification_grants`), `hasMany` CertificationGrant | `scope: CertificationScope`, `productsCount` |
| `certification-grant.ts` | `CertificationGrantSchema` | `belongsTo` Certification, Product, Company, Storage(`documentId` → `document`) | `status: CertificationGrantStatus` |
| `community.ts` | `CommunitySchema` | `belongsTo` Territory; `hasMany` Organization, StoryBlock | — |
| `company.ts` | `CompanySchema` | `hasMany` Product, ImpactProject, CertificationGrant; `belongsTo` User, Storage(`logoId`); `hasOne` Organization | `name` = `tradeName ?? legalName` |
| `impact-allocation.ts` | `ImpactAllocationSchema` | `belongsTo` ImpactProject(`project`), Company, Product | `basis: ImpactAllocationBasis` |
| `impact-project.ts` | `ImpactProjectSchema` | `belongsTo` Company, Community, Storage(`coverId`); `manyToMany` Sdg (`impact_project_sdgs`); `hasMany` ImpactAllocation, ImpactReport | `status: ImpactProjectStatus` |
| `impact-report.ts` | `ImpactReportSchema` | `belongsTo` ImpactProject(`project`), Storage(`evidenceId` → `evidence`) | — |
| `material.ts` | `MaterialSchema` | `manyToMany` Product (`product_materials`, pivô `share_rate`, `territory_id`) | `originType`, `productsCount`, `shareRate` (pivô), `territoryId` (pivô) |
| `onchain-record.ts` | `OnchainRecordSchema` | `belongsTo` Product | — |
| `order.ts` | `OrderSchema` | `belongsTo` User(`customerId` → `customer`), Company; `hasMany` OrderItem(`items`) | — |
| `order-item.ts` | `OrderItemSchema` | `belongsTo` Order, Product, ProductVariant(`variantId` → `variant`) | — |
| `organization.ts` | `OrganizationSchema` | `belongsTo` Company, Community; `hasMany` Producer, StoryBlock | `kind`, `stage`, `producersCount` |
| `producer.ts` | `ProducerSchema` | `belongsTo` User, Organization, Storage(`photoId` → `photo`); `manyToMany` Product (`product_producers`, pivô `role`); `hasMany` StoryBlock | `role` (pivô) |
| `product.ts` | `ProductSchema` (170 l — o maior) | `belongsTo` Company, Category, Territory; `manyToMany` Subcategory, Certification (pivô status/issued_at/expires_at/document_id), Producer (pivô role), Material (pivô share_rate/territory_id), Technique (pivô detail), Storage (`product_images`, pivô position → `images`); `hasMany` CertificationGrant, ImpactAllocation, ProductVariant, TraceabilityEvent, StoryBlock; `hasOne` ProductPassport, OnchainRecord | `features: string[]` com `prepare`/`consume` JSON; `effectivePrice = discountedPrice ?? price`; `available` (soma o estoque das variantes, ou `stock > 0` sem variante) |
| `product-passport.ts` | `ProductPassportSchema` | `belongsTo` Product, Storage(`qrStorageId` → `qrStorage`) | `url` = `passportUrl(publicCode)`; `qrUrl` = `qrStorage?.url` |
| `product-variant.ts` | `ProductVariantSchema` | `belongsTo` Product | — |
| `review.ts` | `ReviewSchema` | `belongsTo` Product, User(`customerId` → `customer`) | — |
| `sdg.ts` | `SdgSchema` | `manyToMany` ImpactProject (`impact_project_sdgs`) | — |
| `storage.ts` | `StorageSchema` | — | `status: UploadStatus`; `size` com `consume: Number` (bigint); **`@afterFind`/`@afterFetch` resolvem a URL pelo Drive** e guardam em `$extras.url`; `url` é `@computed` |
| `story-block.ts` | `StoryBlockSchema` | `belongsTo` Storage(`storageId` → `image`), Product, Organization, Producer, Community | `kind: StoryBlockKind`; `body: RichDocument` com cast JSON |
| `subcategory.ts` | `SubcategorySchema` | `belongsTo` Category | — |
| `technique.ts` | `TechniqueSchema` | `manyToMany` Product (`product_techniques`, pivô `detail`) | `productsCount`, `detail` (pivô) |
| `territory.ts` | `TerritorySchema` | `belongsTo` Territory(`parentId` → `parent`); `hasMany` Territory(`children`), Community | `kind: TerritoryKind` — auto-relação que monta BIOME > REGION > MUNICIPALITY |
| `traceability-event.ts` | `TraceabilityEventSchema` | `belongsTo` Product, Storage(`evidenceId`), User(`recordedBy` → `recorder`), TraceabilityEvent(`supersededById`) | Auto-relação: evento substituído aponta para o que o substituiu |
| `user.ts` | `compose(UserSchema, AuthFinder)` | `hasMany` Address; `hasOne` Company, Producer; `belongsTo` Storage(`avatarId` → `avatar`) | `withAuthFinder` com `hash.use('scrypt')`, uid `email`; `static accessTokens = DbAccessTokensProvider.forModel(User)` |

### Enums do domínio (`app/core/entity.ts`)

| Enum | Valores |
|---|---|
| `UserRoles` | `OWNER`, `ADMINISTRATOR`, `COMPANY`, `CUSTOMER`, `PRODUCER` |
| `ActiveStatuses` | `ACTIVE`, `INACTIVE` |
| `ProductStatuses` | `DRAFT`, `ACTIVE`, `ARCHIVED` |
| `UploadStatuses` | `PENDING`, `UPLOADED` |
| `TerritoryKinds` | `BIOME`, `REGION`, `MUNICIPALITY` |
| `OrganizationKinds` | `COOPERATIVE`, `ASSOCIATION`, `COLLECTIVE`, `FAMILY_BUSINESS`, `INDIVIDUAL` |
| `OrganizationStages` | `IN_FORMATION`, `FORMALIZED` |
| `StoryBlockKinds` | `TEXT`, `IMAGE`, `QUOTE`, `VIDEO` |
| `MaterialOriginTypes` | `WILD_HARVEST`, `MANAGED_FOREST`, `CULTIVATED`, `RECYCLED`, `PURCHASED` |
| `TraceabilityLevels` | `NONE`, `BASIC`, `TRACED`, `IMPACT` |
| `CertificationScopes` | `ORGANIZATION`, `PRODUCT`, `MATERIAL` |
| `CertificationGrantStatuses` | `PENDING`, `VALID`, `EXPIRED`, `REVOKED` |
| `ImpactProjectStatuses` | `DRAFT`, `UNDER_REVIEW`, `ACTIVE`, `PAUSED`, `FINISHED` |
| `ImpactAllocationBases` | `PRODUCT_SALE`, `COMPANY_REVENUE` |
| `OrderStatuses` | `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `PaymentStatuses` | `PENDING`, `PAID` |
| `TrashedModes` / `SortDirections` | filtro de lixeira / `asc`, `desc` |

`OWNER` não é gerenciável por endpoint nenhum — nasce só pelo seeder. `ORDER_TRANSITIONS` define quais destinos cada estado de pedido alcança. `TRACEABILITY_RANK` ordena os níveis para o `atLeast()` do `TraceabilityService`.

---

## 10. `app/services/`

Doze serviços. Regra observada: vai para `services/` o que tem **dependência externa ou estado** (S3, HTTP, geração de imagem); o que é só consulta fica em `_shared.*.ts` dentro de `features/`.

| Arquivo | Linhas | API pública | O que faz |
|---|---|---|---|
| `brasil-api.service.ts` | 237 | `cep(value)`, `cnpj(value)`; tipos `CepLookup`, `CnpjLookup` | Consulta BrasilAPI para endereço por CEP e empresa por CNPJ. Tem cache (coberto por `lookup.spec.ts`: "a segunda consulta ao mesmo CEP sai do cache"). Origem fora do ar → `503`, não `404`. |
| `catalog.service.ts` | 57 | `assertCoherentSubcategories(categoryId, ids)` | Recusa subcategoria que não pertence à categoria principal do produto (RN-38), devolvendo `Either` com `422` apontando o campo. |
| `cookie.service.ts` | 67 | `COOKIE_TOKEN`, `set(context, tokens)`, `clear(context)`, `issueSessionTokens(user)` | Emite e grava o par access/refresh em cookies `httpOnly`. `issueSessionTokens` é usado pelo guard e pelos use-cases de autenticação. |
| `multipart.service.ts` | 256 | `PART_SIZE = 10 MiB`, `PRESIGNED_BATCH = 100`, `countParts()`, `pendingParts()`, `initiate()`, `signParts()`, `signSingle()`, `listParts()`, `complete()`, `abort()` | Upload multipart presigned direto no bucket. Recebe o `S3Client` singleton por construtor. O binário **nunca** atravessa a aplicação. |
| `order.service.ts` | 65 | `applyFilters()`, `orderBy()`, `withItems()` | Filtros/ordenação/preload compartilhados pelas três listagens de pedido (administrador, empresa, comprador). |
| `order-transition.service.ts` | 123 | `apply({...})` | Máquina de estados do pedido. Consulta `ORDER_TRANSITIONS` de `#core/entity` e grava o timestamp correspondente (`confirmedAt`, `shippedAt`, `deliveredAt`, `cancelledAt`). Usado por `company/orders/transition` e `customer/orders/cancel`. |
| `qrcode.service.ts` | 68 | `toBuffer(url)`, `generate(url): Promise<Storage>` | Gera o PNG do QR. `toBuffer` serve a `GET /storefront/qrcode/:entity/:slug` (único endpoint binário da API); `generate` sobe o PNG para o bucket e devolve o `Storage` — usado ao gerar o passaporte. |
| `slug.service.ts` | 136 | `normalize(value)`, `forCompany(source, exceptUserId?)`, `forProducer(source, exceptId?)` | Normalização (remove pontuação, respeita o limite da coluna, não deixa hífen pendurado — coberto por `slug.spec.ts`) e deduplicação. |
| `storage.service.ts` | 244 | `key()`, `metadata()`, `discard()`, `references(storageId)`, `signedDownload()`, `contentDisposition()`, `remove()`, `url()`, `assertExist(field, ids)`, `gallery(ids)` | Ciclo de vida do anexo. `references()` é o que decide se um arquivo é **órfão** (o registro é neutro e compartilhado, então a posse não autoriza — quem manda é a referência viva). `gallery()` monta o payload de `sync` do pivô `product_images` com `position`. |
| `storefront-shape.service.ts` | 345 | `company()`, `companies()`, `producer()`, `producers()`, `community()`, `communities()`, `organization()`, `territory()`, `product(product, rating?)`, `products()` | **Redução deliberada** do que sai na vitrine: nunca CNPJ, anotações internas, e-mail. É a barreira coberta por `storefront-privacy.spec.ts`. |
| `storefront-visibility.service.ts` | 142 | `visibleProducts()`, `visibleCompanies()`, `visibleProducers()`, `visibleCommunities()`, `visibleOrganizations()` | **A regra de visibilidade num lugar só (RN-20).** Devolve query builders já recortados: produto `ACTIVE` não removido, de empresa ativa não removida; produtor só com consentimento de imagem; comunidade/organização só se chegam a uma peça visível. |
| `traceability.service.ts` | 139 | `levelFor(productId)`, `atLeast(level, minimum)`, `isCrafting(stage)` | Calcula o nível de rastreabilidade `NONE → BASIC → TRACED → IMPACT` **na hora, nunca de coluna gravada**. É o que gatilha a publicação do passaporte (exige ≥ `TRACED`). |

---

## 11. `app/middleware/`, `app/guards/`, `app/exceptions/`

### `app/middleware/` (98 linhas no total)

| Arquivo | Onde roda | O que faz |
|---|---|---|
| `force_json_response_middleware.ts` | `server.use` | Força `accept: application/json` em toda requisição — a API não negocia formato. |
| `container_bindings_middleware.ts` | `server.use` | Faz o bind de `HttpContext` e `Logger` no resolvedor do container da requisição, para o `@inject()` dos use-cases funcionar. |
| `silent_auth_middleware.ts` | `router.use` | `auth.check()` sem lançar — popula `auth.user` quando há sessão, segue adiante quando não há. É o que permite a vitrine responder para os dois casos. |
| `auth_middleware.ts` | nomeado (`middleware.auth()`) | `auth.authenticateUsing(guards)`. Falha → `401`. |
| `role_middleware.ts` | nomeado (`middleware.role([...])`) | Compara `user.role` com a lista permitida; recusa com `HTTPException.Forbidden('Acesso negado','ACCESS_DENIED')`. **Aplicado no grupo, nunca no endpoint** — rota nova nasce protegida pelo módulo em que foi colocada. Roda sempre depois de `auth`. |

### `app/guards/cookie-access-tokens.guard.ts` (99 linhas)

Guard próprio que implementa `GuardContract`. Em vez de ler o header `Authorization`, lê o access token do **cookie** `COOKIE_TOKEN.ACCESS`. Verifica com `User.accessTokens.verify(secret)`, confere que `accessToken.name` é o do cookie de acesso (não o de refresh), carrega o `User` e o anexa com `currentAccessToken`. É o guard `api`, o default de `config/auth.ts`.

### `app/exceptions/` (206 linhas)

| Arquivo | Conteúdo |
|---|---|
| `http.exception.ts` | `HTTPException extends Exception` com payload `{ message, status, code, errors? }` e `toResponse()`. Construtor protegido — instância só por factory estática: `Unauthorized` (401/`AUTHENTICATION_REQUIRED`), `Forbidden` (403/`ACCESS_DENIED`), `NotFound`, `Conflict`, `UnprocessableEntity`, `ServiceUnavailable`, `InternalServerError`. O campo `errors` mapeia campo → mensagem. |
| `handler.ts` | Handler global. Traduz `E_VALIDATION_ERROR` do VineJS em `422` com `code: 'VALIDATION_ERROR'` e `errors` achatado por campo (primeira mensagem por campo vence); traduz `E_UNAUTHORIZED_ACCESS` do auth em `401`; demais erros seguem o comportamento do `ExceptionHandler`, com `debug` ligado fora de produção. |

---

## 12. `app/features/`

**O miolo do sistema: 490 arquivos, 22.093 linhas.** Um par `controller` + `use-case` por endpoint, agrupado por `<papel>/<recurso>/`.

Como ler as tabelas abaixo:

- **Arquivo** — todo arquivo do diretório aparece, sem exceção.
- **Rota** — método e caminho reais, extraídos de `node ace list:routes`. Use-cases e helpers não têm rota (`—`): são alcançados pelo controller.
- **O que faz** — para controllers, o texto **integral** do `static docs = defineDocs({ description })` do próprio arquivo (é ele que alimenta o OpenAPI). Para use-cases e helpers, descrição escrita a partir da leitura do corpo de cada arquivo: o que valida, em que ordem, o que grava, em transação ou não, e por quê.

**Observação encontrada na leitura:** os quatro controllers de `customer/reviews/` (`create`, `update`, `delete`, `paginate`) **não estão registrados em `start/routes.ts`** — existem, compilam, são referenciados no `controllers.ts` gerado, e nenhuma rota aponta para eles. A escrita de avaliação pelo comprador está implementada e não exposta. A leitura pública continua servida por `GET /storefront/reviews`, e a moderação por `GET/DELETE /administrator/reviews`.

### Helpers de domínio — `app/features/_shared.*.ts`

Quinze arquivos na raiz de `features/`, usados por mais de um papel. Ficam aqui, e não em `services/`, porque são **consultas e invariantes**, não comportamento com dependência externa.

| Arquivo | Rota | O que faz |
|---|---|---|
| `_shared.certification.ts` | — | `scopedGrant` recorta a concessão pela empresa; `assertCertificationScope` recusa selo cujo escopo não casa com o assunto (selo de organização aplicado a uma peça, e vice-versa); `assertGrantPublishable` é o que o painel usa para aprovar — cobra documento anexado e prazo não vencido; `validGrants` filtra os selos que podem aparecer na vitrine. |
| `_shared.impact.ts` | — | `scopedProject` e `scopedProduct` recortam pela empresa da sessão; `assertProjectReady` cobra ao menos um ODS para sair de `DRAFT`; `assertShareFits` garante que a soma das alocações vigentes do mesmo assunto cabe no teto; `impactFor(productId, companyId)` monta o bloco de impacto que a vitrine e o passaporte mostram. |
| `_shared.metrics.ts` | — | `WINDOW_DAYS` (30), `orderMetrics(companyId?)` (receita, volume, fila de cobrança e série diária, com a janela anterior ao lado), `productMetrics(companyId?)`, `countUsers(role)`, `countCompanies()`. Fica aqui e não num service porque são **consultas**, e painel e empresa fazem a mesma pergunta com um `where` a mais — duas cópias divergiriam. |
| `_shared.organization.ts` | — | `companyOf(userId)` é o helper mais usado do sistema: **separa perfil ausente (invariante quebrada, 500) de empresa arquivada (estado previsto, 403)** — inline, as duas viravam a mesma coisa. `organizationOfCompany(userId)` desce mais um nível; `producerOf(userId)` e `companyOfProducer(producer)` fazem o caminho do artesão; `assertOrganizationCoherence(stage, companyId, communityId, exceptId?)` valida a combinação estágio × empresa × comunidade. |
| `_shared.origin.ts` | — | `assertTerritory`, `assertProducers(organizationId, list)` (a autoria só pode apontar para gente da própria organização — apontar para a cooperativa vizinha tornaria o selo inútil), `assertMaterials`, `assertTechniques` validam **antes** de escrever; `syncProducers`, `syncMaterials`, `syncTechniques` sincronizam as três pivôs com dado próprio (`role`; `share_rate`+`territory_id`; `detail`). |
| `_shared.passport.ts` | — | `generatePublicCode()` sorteia o código de 12 caracteres — **o alfabeto exclui `0`, `O`, `1`, `I` e `L`**, porque o código é digitado de uma etiqueta impressa, muitas vezes no celular numa feira, e um zero confundido com "ó" manda a pessoa para um 404 sem explicação. `passportUrl(code)` monta a URL pública. |
| `_shared.producer.ts` | — | `consented(query)` filtra quem tem `image_consent_at` preenchido; `resolveConsent(value)` distingue `undefined` (não mexer) de `null` (**revogar** — nome e foto saem da vitrine na leitura seguinte, sem rotina nenhuma no meio) de data (conceder); `assertPhoto` valida o anexo. |
| `_shared.product-preload.ts` | — | `loadProductRelations(product)` carrega exatamente as relações que `#core/response.ts` promete na resposta de produto. Um `load` a menos aqui vira campo prometido e não entregue — que o cliente tipado só descobre em produção. |
| `_shared.public-url.ts` | — | `isPublicEntity(value)` valida contra a lista fechada e `publicUrl(entity, slug)` monta o endereço. **Os segmentos são os do frontend, não os da API**: `producer` vira `/artesao/:slug` e `organization` vira `/organizacao/:slug` — quem lê o QR é um celular abrindo página, não um cliente HTTP. |
| `_shared.rating.ts` | — | `ratingFor(productId)` e `ratingsFor(ids)` agregam média e distribuição; `emptyRating` é o zero. **Consulta e não coluna**: `rating_average` gravado obrigaria toda escrita de avaliação a atualizar o produto na mesma transação, e um `UPDATE` esquecido deixaria a nota errada para sempre, do jeito mais silencioso possível. |
| `_shared.story.ts` | — | `assertStoryBlocks` valida os anexos dos blocos, `syncStoryBlocks(ownerColumn, ownerId, blocks, trx)` substitui a lista inteira, e `saveWithStory(model, ownerColumn, blocks)` faz as duas coisas numa transação. **Blocos não têm recurso próprio**: entram no `POST`/`PUT` do dono (produto, produtor, organização ou comunidade). |
| `_shared.territory-preload.ts` | — | `withLineage(query)` precarrega `parent.parent.parent` — três níveis, porque a hierarquia tem três, e é ela que sustenta a alegação de procedência: dizer "Benjamin Constant" sem dizer que fica no Alto Solimões, na Amazônia, não prova nada a quem lê do outro lado do mundo. |
| `_shared.territory.ts` | — | `assertHierarchy(kind, parentId, exceptId?)` cobra duas coisas que o banco não expressa: **o filho é mais profundo que o pai** (a FK aceita qualquer linha de `territories` como pai, inclusive um município acima de um bioma) e **a edição não pode criar ciclo**. |
| `_shared.traceability.ts` | — | `upsertOnchainRecord`, `appendTraceability(productId, events, userId, trx)` e `publishableEvents`. **Nada aqui ancora nada** — os campos guardam o que *foi* ancorado (rede, contrato, token, hash), preenchidos a partir do que a transação devolveu. Ancorar de verdade é integração com carteira e nó, que é outro escopo. |
| `_shared.variants.ts` | — | `syncVariants(productId, variants, trx)`: **upsert por `sku` e arquivamento do que sumiu** da lista. Casar por posição quebraria ao reordenar; casar por id obrigaria a tela a inventar um para a linha recém-criada. |


### `account/` — a própria conta

Sem identificador no caminho: o usuário vem sempre da sessão, seja qual for o papel. O perfil da empresa vem achatado no mesmo recurso; em conta que não é `COMPANY` esses campos saem nulos.

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /account | A própria conta, seja qual for o papel (RF-07, RF-11). O usuário vem sempre da sessão: não há identificador no caminho, e não teria como haver (RF-13). O perfil da empresa vem junto, achatado no mesmo recurso. Em conta que não é `COMPANY` os campos do perfil saem nulos - é o que faz esta rota responder sempre no mesmo formato, sem uma segunda chamada para descobrir o `slug` da própria loja. |
| `show.use-case.ts` | — | Lê o `User` da sessão com `avatar` e `company.logo` precarregados. Filtra `deletedAt` **também aqui**: o token de quem foi removido continua válido até expirar, e sem o filtro a conta seguiria legível. `404 USER_NOT_FOUND` quando não acha. |
| `update.controller.ts` | PUT /account | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar" - a exceção é `avatarId`, onde `null` é como se tira a foto sem trocá-la (RF-61). Trocar e-mail ou senha **revoga todas as sessões** (RN-15, RNF-04), inclusive a que fez esta requisição. A senha nova precisa ser diferente da atual. O papel não entra: ele é definido na criação e não muda, por ninguém (RF-02). |
| `update.use-case.ts` | — | Merge parcial no próprio usuário. Confere e-mail duplicado (`409`), existência do `avatarId` via `StorageService.assertExist`, e **recusa senha igual à atual** (`422 PASSWORD_SAME_AS_CURRENT`, comparada com `hash.verify`). Se e-mail ou senha mudaram, `User.accessTokens.deleteAll(user)` — todas as sessões caem. Recarrega `avatar` e `company.logo` antes de devolver. |


### `administrator/` — painel da plataforma

Guarda do grupo: `auth()` + `role([OWNER, ADMINISTRATOR])`. Visão irrestrita — sem escopo de sessão em recurso nenhum. O subgrupo `lifecycle` concentra archive/unarchive/delete de 12 recursos: o administrador **gerencia a lixeira**, e cada `DELETE` leva `role([OWNER])` individual porque só o dono apaga de vez.

O padrão de escrita se repete em todos os catálogos globais: **`create` ressuscita a linha arquivada de mesmo slug** em vez de inserir outra (é o que dispensa guarda de colisão no `unarchive`), e **`delete` conta as referências antes de apagar** porque as FKs são `RESTRICT` — sem a contagem o `DELETE` estouraria a constraint e viraria 500 em vez de `409`.

#### `administrator/addresses/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /administrator/addresses | Endereços de **todos** os usuários, somente leitura, para auditoria (RF-19, §10). `?userId` recorta os de um usuário e `?search` filtra por logradouro, bairro ou cidade. `?sort` aceita ADDRESS_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenado por data de criação crescente. O painel não escreve endereço (§9): `POST`, `PUT` e `DELETE` são ausentes de propósito neste caminho, e respondem `404`. Quem gerencia os próprios endereços é o dono deles, por `/company/addresses`. Arquivados não aparecem: este recurso não tem `?trashed`. |
| `paginate.use-case.ts` | — | Todos os endereços vivos, **sem escopo de sessão** — este módulo não escreve endereço, só audita. `?userId` recorta os de um usuário; `?search` casa `logradouro` OU `neighborhood` OU `city`. |
| `show.controller.ts` | GET /administrator/addresses/:id | Devolve o objeto nu, sem envelope. Leitura irrestrita: alcança endereço de qualquer usuário (RN-19). Endereço arquivado responde `404`. |
| `show.use-case.ts` | — | Endereço vivo por id, irrestrito. Arquivado é `404`. |

#### `administrator/administrators/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/administrators/:id/archive | Envia para a lixeira: grava `deletedAt` e revoga os tokens da conta, que deixa de autenticar na hora. Reversível por `PATCH /:id/unarchive`. Privilégio exclusivo do dono (RN-04). |
| `archive.use-case.ts` | — | Filtra `role: ADMINISTRATOR` + vivo, grava `deletedAt` e **revoga todos os tokens** (`accessTokens.deleteAll`) — o guard não conhece `deleted_at`, então sem revogar o token continuaria autenticando até vencer. |
| `create.controller.ts` | POST /administrator/administrators | Cria um administrador (RF-04, UC-03). O `role` é aceito pelo schema e **descartado** antes de gravar: quem decide o papel é o servidor, sempre (RN-02). `OWNER` nem sequer é um valor aceito - o dono nasce só pelo seeder (RF-03). E-mail já em uso por uma conta viva responde `409`. Se o e-mail pertencer a uma conta **arquivada**, o cadastro a reaproveita e a traz de volta com os dados novos - o `unique` vale para a tabela inteira, e recusar seria travar o e-mail para sempre. |
| `create.use-case.ts` | — | **Descarta `role` do payload** (`const { role: _ignoredRole, ...data }`) e força `ADMINISTRATOR` — quem decide o papel é o servidor. E-mail vivo já usado é `409`; e-mail de conta **arquivada** faz o registro ser **reativado** (`deletedAt: null`) em vez de duplicar. |
| `delete.controller.ts` | DELETE /administrator/administrators/:id | **Irreversível**: apaga a linha do banco, e endereços e tokens vão junto por cascata. Só aceita conta já arquivada. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Apaga a linha. Busca **sem filtrar `deletedAt`** para distinguir "não existe" de "ainda está viva" — viva é `409 USER_NOT_ARCHIVED`. Endereços e tokens vão por `CASCADE`; o avatar fica (`SET NULL`), porque limpeza de binário está fora de escopo. |
| `paginate.controller.ts` | GET /administrator/administrators | Listagem paginada. `?search` filtra por nome ou e-mail e `?trashed` alcança as arquivadas. `?sort` aceita USER_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. Enxerga **apenas** `ADMINISTRATOR`. O dono fica de fora porque nenhum endpoint o cria ou promove (RF-03), e listá-lo aqui abriria caminho para auto-remoção - ele cuida de si por `/account`. Empresas têm recurso próprio, com o perfil de `companies` junto. |
| `paginate.use-case.ts` | — | **Só `ADMINISTRATOR`.** O dono fica de fora porque nenhum endpoint o cria ou promove, e listá-lo aqui abriria caminho para auto-remoção — ele cuida de si por `/account`. `?trashed`; `?search` casa nome OU e-mail. |
| `show.controller.ts` | GET /administrator/administrators/:id | Devolve o objeto nu, sem envelope. O filtro de papel faz o `id` de uma empresa ou do dono responder o mesmo `404` de um id inexistente: fora do recurso é indistinguível de ausente (RN-17). Administrador arquivado também não é encontrado aqui - para alcançá-lo, liste com `?trashed`. |
| `show.use-case.ts` | — | Administrador vivo por id. O filtro de papel faz o id de uma empresa ou do dono cair no mesmo `404` de inexistente. |
| `unarchive.controller.ts` | PATCH /administrator/administrators/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só aceita conta arquivada - uma conta viva responde 404. Nenhum token é recriado: o restaurado entra de novo pelo sign-in. Privilégio exclusivo do dono (RN-04). |
| `unarchive.use-case.ts` | — | Busca só o arquivado e zera `deletedAt`. **Nenhum token é recriado**: o restaurado entra de novo pelo sign-in, que é onde `deletedAt` e `status` são conferidos. |
| `update.controller.ts` | PUT /administrator/administrators/:id | Todo campo é opcional: só o que vier no payload muda. O `role` é aceito pelo schema e descartado antes de gravar - o papel é imutável depois da criação (RF-02, RN-01), e trocá-lo orfanaria produtos e endereços. Trocar e-mail ou senha **revoga todas as sessões do alvo** (RN-15, RF-08). A senha nova precisa ser diferente da atual. O dono é intocável por este recurso e responde `403`, não o `404` dos demais (RN-06): aqui a regra é dizer que é proibido, não esconder a existência. Os acessos dele só o próprio dono altera, por `PUT /account`. |
| `update.use-case.ts` | — | **Guarda explícita: se o id é do `OWNER`, `403 OWNER_ACCESS_FORBIDDEN`** antes de qualquer coisa. Descarta `role` (papel é imutável — trocá-lo orfanaria produtos e endereços). E-mail duplicado é `409`; senha igual à atual é `422 PASSWORD_SAME_AS_CURRENT`. Trocar e-mail ou senha revoga todas as sessões. |

#### `administrator/categories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/categories/:id/archive | Envia para a lixeira: grava `deletedAt`. A categoria some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. Privilégio exclusivo do dono (RN-04). |
| `archive.use-case.ts` | — | Grava `deletedAt`. Já arquivada é indistinguível de inexistente (`404`), porque o filtro é o mesmo de toda leitura. |
| `create.controller.ts` | POST /administrator/categories | O `slug` é opcional: sem ele, sai do nome. Devolve 201 com a categoria criada, objeto nu e sem envelope. |
| `create.use-case.ts` | — | Normaliza o slug (`slug ?? name`) e busca por ele **sem filtrar removidos**. Se achou uma **arquivada, ressuscita** com os dados novos; se achou viva, `409` apontando `slug` ou `name` conforme o que o cliente mandou. `refresh()` depois de criar porque `status` vem de DEFAULT no banco e o INSERT só devolve a PK. |
| `delete.controller.ts` | DELETE /administrator/categories/:id | **Irreversível**: apaga a linha do banco, e as subcategorias vão junto por cascata. Só aceita categoria já arquivada, e recusa quando existe produto na categoria. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Busca sem filtrar `deletedAt` (para separar "viva" de "inexistente") — viva é `409 CATEGORY_NOT_ARCHIVED`. Depois **conta os produtos da categoria** e recusa com `409 CATEGORY_HAS_PRODUCTS`. Subcategorias vão por `CASCADE`. |
| `paginate.controller.ts` | GET /administrator/categories | Listagem paginada. `?search` filtra por nome e `?trashed` alcança as arquivadas. `?sort` aceita CATALOG_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. |
| `paginate.use-case.ts` | — | `withCount('products')` restrito aos não removidos. `?trashed`, `?status`, `?search` por nome. |
| `show.controller.ts` | GET /administrator/categories/:id | Devolve o objeto nu, sem envelope. Categoria arquivada não é encontrada aqui - para alcançá-la, liste com `?trashed`. |
| `show.use-case.ts` | — | Categoria viva por id. `404 CATEGORY_NOT_FOUND`. |
| `unarchive.controller.ts` | PATCH /administrator/categories/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só aceita categoria arquivada - uma categoria viva responde 404. Privilégio exclusivo do dono (RN-04). |
| `unarchive.use-case.ts` | — | Busca só a arquivada e zera. **Sem guarda de colisão de slug**: o `create` ressuscita a linha arquivada em vez de inserir outra, então não existe registro-sombra ocupando o `unique`. |
| `update.controller.ts` | PUT /administrator/categories/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". |
| `update.use-case.ts` | — | Merge parcial; slug recalculado de `slug ?? name` só quando muda, com `409` apontando o campo que o cliente enviou. |

#### `administrator/certification-grants/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /administrator/certification-grants | Todas as concessões, de todas as empresas (RF-32). `?status=PENDING` é a fila de aprovação (RF-714) - o que a empresa registrou e ainda espera o aval do painel. |
| `paginate.use-case.ts` | — | Todas as concessões, de todas as empresas, com `certification`, `document`, `company` e `product`. `?status=PENDING` é a fila de aprovação; `?companyId` e `?productId` recortam. |
| `review.controller.ts` | PATCH /administrator/certification-grants/:id/review | Aprova (`VALID`) ou revoga (`REVOKED`) uma concessão (RF-714). Aprovar exige **documento anexado** e prazo não vencido: sem prova é `422` apontando `documentId`, e com data passada é `422` apontando `expiresAt` - aprovar um selo vencido o colocaria na vitrine até o próximo `certifications:expire`. Revogar não apaga: o selo sai da vitrine e fica no histórico. |
| `review.use-case.ts` | — | **O único lugar do sistema em que um selo vira `VALID`** — a certificação é a alegação em que a plataforma repete a palavra de um terceiro, e quem repete precisa ter olhado o documento. `assertGrantPublishable` cobra documento anexado e prazo não vencido. **Revogar não apaga**: o selo sai da vitrine e fica no histórico, porque "esta peça já teve este selo e o perdeu" é informação. |
| `show.controller.ts` | GET /administrator/certification-grants/:id | A concessão com o documento anexado, a empresa e a peça. É a tela em que o painel confere a prova antes de aprovar. |
| `show.use-case.ts` | — | A concessão com selo, documento, empresa e peça — a tela em que o painel confere a prova antes de aprovar. |

#### `administrator/certifications/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/certifications/:id/archive | Envia para a lixeira: grava `deletedAt`. A certificação some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. Privilégio exclusivo do dono (RN-04). |
| `archive.use-case.ts` | — | Grava `deletedAt`; já arquivada é `404`. |
| `create.controller.ts` | POST /administrator/certifications | O `slug` é opcional: sem ele, sai do nome. Devolve 201 com a certificação criada, objeto nu e sem envelope. |
| `create.use-case.ts` | — | Mesma forma de `categories/create`: normaliza o slug, **ressuscita a arquivada** de mesmo slug, `409` se viva. |
| `delete.controller.ts` | DELETE /administrator/certifications/:id | **Irreversível**: apaga a linha do banco, e as subcertificaçãos vão junto por cascata. Só aceita certificação já arquivada, e recusa quando existe produto na certificação. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige arquivada (`409` se viva) e tenta contar o uso antes de apagar. ⚠️ **A contagem consulta `product_certifications`, tabela que não existe**: ela foi substituída por `certification_grants` (ver o comentário no topo da migration `1785920000000_create_certification_grants.ts`). A consulta lança `relation does not exist`, o `catch` a converte em **500**, e o `delete()` nunca é alcançado — nem para selo em uso (que deveria ser `409 CERTIFICATION_HAS_PRODUCTS`) nem para selo livre. Na prática o endpoint não apaga nada. |
| `paginate.controller.ts` | GET /administrator/certifications | Listagem paginada. `?search` filtra por nome e `?trashed` alcança as arquivadas. `?sort` aceita CATALOG_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. |
| `paginate.use-case.ts` | — | `withCount('products')` dos não removidos. `?trashed`, `?status`; `?search` casa nome OU emissor. |
| `show.controller.ts` | GET /administrator/certifications/:id | Devolve o objeto nu, sem envelope. Certificação arquivada não é encontrada aqui - para alcançá-la, liste com `?trashed`. |
| `show.use-case.ts` | — | Certificação viva por id. `404`. |
| `unarchive.controller.ts` | PATCH /administrator/certifications/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só aceita certificação arquivada - uma certificação viva responde 404. Privilégio exclusivo do dono (RN-04). |
| `unarchive.use-case.ts` | — | Busca só a arquivada e zera. Sem guarda de slug pelo mesmo motivo das categorias. |
| `update.controller.ts` | PUT /administrator/certifications/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". |
| `update.use-case.ts` | — | Merge parcial com slug reconferido quando muda (`409 CERTIFICATION_ALREADY_EXISTS`). |

#### `administrator/communities/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/communities/:id/archive | Envia para a lixeira: grava `deletedAt`. Some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. |
| `archive.use-case.ts` | — | Grava `deletedAt`; já arquivada é `404`. |
| `create.controller.ts` | POST /administrator/communities | O `slug` é opcional: sem ele, sai do nome. `territoryId` é obrigatório - comunidade solta não sobe até o bioma, e é essa subida que sustenta a alegação de origem. Território inexistente responde `422` apontando o campo (RN-39). Latitude e longitude são opcionais: comunidade ribeirinha nem sempre tem ponto declarado, e exigir um faria alguém inventar coordenada. Devolve 201 com a comunidade criada, objeto nu e sem envelope. |
| `create.use-case.ts` | — | **`territoryId` obrigatório e validado** (`422 TERRITORY_NOT_FOUND` — comunidade solta não sobe até o bioma, e é essa subida que sustenta a alegação de origem). Valida blocos de história, normaliza o slug, **ressuscita a arquivada** de mesmo slug, `409` se viva. Grava com `saveWithStory`. |
| `delete.controller.ts` | DELETE /administrator/communities/:id | **Irreversível**: apaga a linha do banco. Só aceita o que já está arquivada, e recusa com 409 quando alguma coisa ainda aponta para ele. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige arquivada e **conta as organizações que apontam para ela** (`409 COMMUNITY_HAS_ORGANIZATIONS`). A contagem existe porque as FKs são `RESTRICT` — sem ela o `DELETE` estouraria a constraint e viraria 500; e conta o arquivado também, porque a linha continua lá e é ela que a constraint enxerga. |
| `paginate.controller.ts` | GET /administrator/communities | Listagem paginada do catálogo global de comunidades, com o território precarregado. `?search` filtra por nome, `?territoryId` recorta por território e `?trashed` alcança as arquivadas. `?sort` aceita COMMUNITY_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. |
| `paginate.use-case.ts` | — | Comunidades com `territory` em linhagem. `?trashed`, `?territoryId`, `?search`. |
| `show.controller.ts` | GET /administrator/communities/:id | Devolve o objeto nu, sem envelope. Comunidade arquivada não é encontrada aqui - para alcançá-la, liste com `?trashed`. |
| `show.use-case.ts` | — | Comunidade viva com `storyBlocks` ordenados. `404`. |
| `unarchive.controller.ts` | PATCH /administrator/communities/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só alcança o que está arquivada - registro vivo responde 404 aqui, pelo mesmo motivo que o arquivado responde 404 nas leituras normais. |
| `unarchive.use-case.ts` | — | Busca só a arquivada e zera. |
| `update.controller.ts` | PUT /administrator/communities/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". |
| `update.use-case.ts` | — | Merge parcial; revalida `territoryId` quando vem, valida blocos, reconfere slug quando muda. Grava com `saveWithStory`. |

#### `administrator/companies/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/companies/:id/archive | Envia para a lixeira: grava `deletedAt` e revoga os tokens da conta. Produtos, endereços e anexos ficam de pé e apenas inacessíveis, porque a empresa não autentica mais (RN-49). Reversível por `PATCH /:id/unarchive`. Privilégio exclusivo do dono (RN-04). |
| `archive.use-case.ts` | — | **Arquiva o `User`, não o perfil**: grava `deletedAt` no usuário e revoga os tokens. Produtos, endereços e anexos ficam de pé e apenas inacessíveis, porque a empresa não autentica mais. |
| `create.controller.ts` | POST /administrator/companies | Cria o usuário de papel `COMPANY` e o perfil em `companies` numa transação só (RF-15). O recurso não aceita `role`: oferecer a escolha seria oferecer algo que não existe. |
| `create.use-case.ts` | — | Cria usuário `COMPANY` + perfil em `companies` numa **transação**. E-mail vivo já usado é `409`; e-mail de conta arquivada é **reaproveitado** (o slug é gerado com `exceptUserId` para não colidir consigo mesmo). CNPJ duplicado é `409`. Valida o logo. Usa `updateOrCreate` na relação `company`, e faz `$setRelated('user', user)` para a resposta sair com o usuário aninhado sem uma segunda consulta. |
| `delete.controller.ts` | DELETE /administrator/companies/:id | **Irreversível**: apaga a linha do banco, e o perfil, os endereços e os tokens vão junto por cascata. Só aceita empresa já arquivada, e recusa quando existe produto da empresa. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige a empresa arquivada (`409 COMPANY_NOT_ARCHIVED`) e **sem produtos** (`409 COMPANY_HAS_PRODUCTS`). **Apaga o `User`** — perfil, endereços e tokens vão por `CASCADE`. |
| `paginate.controller.ts` | GET /administrator/companies | Listagem paginada. `?status=INACTIVE` é como o painel encontra quem aprovar (UC-02) e `?search` filtra por nome, e-mail, razão social ou nome fantasia. `?sort` aceita USER_SORT_COLUMNS e `?direction` aceita asc ou desc - são colunas de `users`, que é a tabela consultada. Padrão: página 1, 20 por página, ordenada por nome crescente. |
| `paginate.use-case.ts` | — | Sai de `companies` com `join` em `users` e `select('companies.*')`. **Mapa `SORT_COLUMNS` qualificando as colunas** (`name → users.name`, `createdAt → companies.created_at`): sem qualificar, `createdAt` existe nas duas tabelas e o Postgres recusa por ambiguidade. `?status=INACTIVE` é a fila de aprovação; `?search` casa nome, e-mail, razão social ou nome fantasia. |
| `show.controller.ts` | GET /administrator/companies/:id | O `id` é o do perfil em `companies` - o mesmo que o `companyId` de produto, de organização e de alocação referencia. O usuário dono vem aninhado em `user`. |
| `show.use-case.ts` | — | **O `id` é o do perfil em `companies`, não o do usuário** — toda FK do sistema (`products.company_id`, `organizations.company_id`, `impact_allocations.company_id`) aponta para ele, e antes quem tinha um `companyId` em mãos não conseguia abrir a empresa. O usuário vem aninhado por `preload`, não remontado à mão. |
| `unarchive.controller.ts` | PATCH /administrator/companies/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só aceita empresa arquivada - uma empresa viva responde 404. O `status` não é tocado: quem foi arquivado `INACTIVE` volta `INACTIVE`. Privilégio exclusivo do dono (RN-04). |
| `unarchive.use-case.ts` | — | Zera `deletedAt` do usuário. **O `status` não é tocado**: quem foi arquivado `INACTIVE` volta `INACTIVE` e continua dependendo da aprovação. |
| `update.controller.ts` | PUT /administrator/companies/:id | Todo campo é opcional: só o que vier no payload muda. Trocar e-mail ou senha revoga as sessões ativas da empresa. |
| `update.use-case.ts` | — | Edita usuário e perfil numa transação. `409` para e-mail, CNPJ e slug duplicados (cada um conferido só quando muda). Valida o logo. **Revoga as sessões** quando o e-mail muda, a senha muda, **ou a empresa está sendo desativada** (`deactivating`) — suspender sem derrubar a sessão deixaria a empresa operando até o token vencer. |

#### `administrator/customers/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/customers/:id/archive | Remoção lógica (RN-42): o cliente sai da listagem e pode ser restaurado. As sessões dele são revogadas na mesma operação - o guard não conhece `deleted_at`, e sem revogar o token continuaria autenticando até vencer. |
| `archive.use-case.ts` | — | Grava `deletedAt` no cliente e **revoga as sessões** na mesma operação — o guard não conhece `deleted_at`. |
| `delete.controller.ts` | DELETE /administrator/customers/:id | **Irreversível**: apaga a linha do banco, e endereços e tokens vão junto por cascata. Só aceita conta já arquivada. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige arquivado (`409 CUSTOMER_NOT_ARCHIVED`) e apaga. Endereços e tokens por `CASCADE`. |
| `paginate.controller.ts` | GET /administrator/customers | Listagem paginada de compradores. `?search` filtra por nome, e-mail, CPF ou código - os quatro jeitos de referir a mesma pessoa no balcão. `?status` recorta por ativo/inativo e `?trashed` alcança os arquivados. `?sort` aceita USER_SORT_COLUMNS e `?direction` aceita asc ou desc. Enxerga **apenas** `CUSTOMER`: cada papel tem o recurso dele, e uma listagem de "usuários" obrigaria toda tela a filtrar de novo. |
| `paginate.use-case.ts` | — | **Só `CUSTOMER`** — cada papel tem o recurso dele; uma listagem de "usuários" obrigaria toda tela a filtrar de novo. `?search` casa nome, e-mail, código **e CPF** (o termo é limpo com `replace(/\D/g,'')` antes, para a busca funcionar com ou sem máscara). |
| `show.controller.ts` | GET /administrator/customers/:id | Devolve o cliente nu, sem envelope, com os endereços vivos precarregados. O filtro de papel faz o `id` de uma empresa ou de um administrador responder o mesmo `404` de um id inexistente: fora do recurso é indistinguível de ausente (RN-17). |
| `show.use-case.ts` | — | Cliente vivo com os **endereços vivos** precarregados. |
| `unarchive.controller.ts` | PATCH /administrator/customers/:id/unarchive | Traz o cliente de volta da lixeira. Ele volta com o mesmo status que tinha. |
| `unarchive.use-case.ts` | — | Busca só o arquivado e zera. Volta com o mesmo `status`. |
| `update.controller.ts` | PUT /administrator/customers/:id | Todo campo é opcional: só o que vier no payload muda. `password` **não** entra: trocar a senha de outro é caminho de sequestro de conta, e quem a troca é o titular por `PUT /account`. E-mail e CPF são corrigíveis, e ambos respondem `409` apontando o campo quando já pertencem a outra conta. |
| `update.use-case.ts` | — | Merge parcial com `409` para e-mail e CPF duplicados. **`password` não está no validator de propósito**: trocar a senha de outro é caminho de sequestro de conta, e quem a troca é o titular por `PUT /account`. |

#### `administrator/impact-projects/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /administrator/impact-projects | Todos os projetos de impacto, de todas as empresas (RF-32). Só leitura. Quem ativa um projeto é a própria empresa, e não o painel: a decisão §9.3 da RFC - se a validação é autodeclarada, de certificador terceiro, ou do administrador - segue aberta com a parceira. Esta listagem existe para o painel **ver** o que está sendo prometido enquanto a decisão não vem. |
| `paginate.use-case.ts` | — | Todos os projetos, de todas as empresas, com `company`, `community` e `sdgs`. `?trashed`, `?status`, `?companyId`, `?search` por título. |
| `review.controller.ts` | PATCH /administrator/impact-projects/:id/review | Aprova (`ACTIVE`) ou devolve (`DRAFT`) um projeto submetido pela empresa. É a decisão §9.3 da RFC 002, fechada em **administrador da plataforma** - dos três caminhos possíveis, o único que não depende de contrato com terceiro nem confia na palavra de quem se beneficia dela. Só projeto em `UNDER_REVIEW` é avaliado: aprovar um rascunho que ninguém submeteu seria ativar pelas costas da empresa - `409`. Aprovar exige ao menos um ODS vinculado. Não existe "rejeitado" como estado terminal: recusar devolve para `DRAFT`, porque o que se espera é que o projeto seja consertado. |
| `review.use-case.ts` | — | **Só avalia projeto `UNDER_REVIEW`** — aprovar um rascunho que ninguém submeteu seria o painel ativando projeto pelas costas da empresa (`409 IMPACT_PROJECT_NOT_UNDER_REVIEW`). `assertProjectReady` cobra os ODS. Aprovar leva a `ACTIVE` (o que sustenta alocação de valor e o degrau `IMPACT` do selo); recusar devolve a `DRAFT` — **não existe "rejeitado" como estado terminal**, porque o que se espera é que o projeto seja consertado. É a decisão §9.3 da RFC fechada em administrador da plataforma: o único caminho que não depende de contrato com terceiro nem confia na palavra de quem se beneficia dela. |
| `show.controller.ts` | GET /administrator/impact-projects/:id | O projeto com a empresa, os ODS, as alocações e os relatórios. É a tela em que o painel confere o que uma peça está prometendo antes de a promessa virar selo `IMPACT`. |
| `show.use-case.ts` | — | Projeto vivo com `company`, `community`, `cover`, `sdgs`, **`allocations` e `reports`** — a tela em que o painel confere o que uma peça está prometendo antes de a promessa virar selo `IMPACT`. |

#### `administrator/materials/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/materials/:id/archive | Envia para a lixeira: grava `deletedAt`. Some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. |
| `archive.use-case.ts` | — | Grava `deletedAt`; já arquivada é `404`. |
| `create.controller.ts` | POST /administrator/materials | O `slug` é opcional: sem ele, sai do nome. `originType` é obrigatório - é ele que a alegação socioambiental responde, e "não sei de onde veio" não é uma origem. `isNative` é eixo separado de `originType` de propósito: dá para cultivar espécie nativa e para extrair exótica. Devolve 201 com a matéria-prima criada, objeto nu e sem envelope. |
| `create.use-case.ts` | — | Slug normalizado, **ressuscita a arquivada** de mesmo slug, `409` se viva. `refresh()` porque `isNative` vem de DEFAULT. |
| `delete.controller.ts` | DELETE /administrator/materials/:id | **Irreversível**: apaga a linha do banco. Só aceita o que já está arquivada, e recusa com 409 quando alguma coisa ainda aponta para ele. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige arquivada e **conta o uso em `product_materials`** (`409 MATERIAL_HAS_PRODUCTS`). A contagem existe porque a FK é `RESTRICT` — sem ela o `DELETE` viraria 500 em vez de `409` — e conta o produto arquivado também, porque a linha continua lá e é ela que a constraint enxerga. |
| `paginate.controller.ts` | GET /administrator/materials | Listagem paginada do catálogo global de matérias-primas, com a contagem de produtos que usam cada uma. `?search` filtra por nome, `?originType` recorta por origem (WILD_HARVEST, MANAGED_FOREST, CULTIVATED, RECYCLED, PURCHASED), `?isNative` separa espécie nativa, e `?trashed` alcança as arquivadas. `?sort` aceita MATERIAL_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. |
| `paginate.use-case.ts` | — | `withCount('products')` dos vivos. `?trashed`, `?originType`, `?isNative`, `?search`. |
| `show.controller.ts` | GET /administrator/materials/:id | Devolve o objeto nu, sem envelope. Matéria-prima arquivada não é encontrada aqui - para alcançá-la, liste com `?trashed`. |
| `show.use-case.ts` | — | Matéria-prima viva por id. `404`. |
| `unarchive.controller.ts` | PATCH /administrator/materials/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só alcança o que está arquivada - registro vivo responde 404 aqui, pelo mesmo motivo que o arquivado responde 404 nas leituras normais. |
| `unarchive.use-case.ts` | — | Busca só a arquivada e zera. Sem guarda de slug — o `create` ressuscita em vez de inserir. |
| `update.controller.ts` | PUT /administrator/materials/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". |
| `update.use-case.ts` | — | Merge parcial com slug reconferido quando muda. |

#### `administrator/metrics/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /administrator/metrics | Os números do painel, numa resposta só: receita e volume dos últimos 30 dias com a janela anterior de mesmo tamanho ao lado, a série diária do período, a fila de cobrança, a quebra de produtos por estado e as contagens de cliente e de empresa. **Pedido cancelado não entra em soma nenhuma.** Ele fica no histórico (RF-57), mas contá-lo fecharia o mês com dinheiro que ninguém recebeu. A janela é fixa: não há `?from`/`?to` porque não há seletor de período na tela, e parâmetro sem tela é código morto. |
| `show.use-case.ts` | — | `orderMetrics()`, `productMetrics()`, `countUsers(CUSTOMER)` e `countCompanies()` em `Promise.all` — **um endpoint e não seis**: os seis cards da tela abrem juntos, e seis requisições seriam seis chances de a tela renderizar meio pronta. **Sem `?from`/`?to`**: a janela é fixa em 30 dias comparada com os 30 anteriores — faixa livre é o tipo de parâmetro que nasce sem tela para escolhê-la e envelhece sem ninguém notar. |

#### `administrator/orders/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /administrator/orders | Visão irrestrita: todos os pedidos, de todas as empresas (RN-19). É a única das três listagens que usa `?companyId` e `?customerId` - a empresa e o comprador veem os seus por escopo de sessão, e um parâmetro lá seria caminho para ler o alheio. `?sort` aceita ORDER_SORT_COLUMNS, com `placedAt` decrescente por padrão. |
| `paginate.use-case.ts` | — | Visão irrestrita: todos os pedidos com `customer` e `company`. **A única das três listagens que aceita `?companyId` e `?customerId`** — a empresa e o comprador veem os seus por escopo de sessão, e um parâmetro lá seria caminho para ler o alheio. |
| `show.controller.ts` | GET /administrator/orders/:id | Devolve o pedido com itens, comprador e empresa. Sem escopo: o painel lê qualquer pedido. |
| `show.use-case.ts` | — | Pedido por id, sem escopo, com itens, comprador e empresa. |

#### `administrator/organizations/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/organizations/:id/archive | Envia para a lixeira: grava `deletedAt`. Some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. |
| `archive.use-case.ts` | — | Grava `deletedAt`; já arquivada é `404`. |
| `create.controller.ts` | POST /administrator/organizations | Cria uma organização produtora - cooperativa, associação, coletivo. `companyId` é **opcional**, e é o ponto inteiro deste recurso: a organização existe antes de existir empresa. A associação em formação tem nome, comunidade, produtores e missão, e não tem CNPJ nem loja - é este endpoint que a cria, e é por ele que a mentoria começa. Nasce `IN_FORMATION`. `stage=FORMALIZED` exige `companyId`, e empresa já ligada a outra organização responde `409` (a relação é 1:0..1). `kind` é o que decide o selo mais adiante: `INDIVIDUAL` vende e não carimba. Devolve 201 com a organização criada, objeto nu e sem envelope. |
| `create.use-case.ts` | — | **`companyId` é opcional — é o ponto inteiro do recurso**: a organização existe antes de existir empresa. `stage` default `IN_FORMATION`, e `assertOrganizationCoherence` valida a combinação estágio × empresa × comunidade (uma `FORMALIZED` sem empresa, ou uma empresa já usada por outra organização, são recusadas). Valida blocos, normaliza slug, **ressuscita a arquivada**, `409` se viva. |
| `delete.controller.ts` | DELETE /administrator/organizations/:id | **Irreversível**: apaga a linha do banco. Só aceita o que já está arquivada, e recusa com 409 quando alguma coisa ainda aponta para ele. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige arquivada e **conta os produtores vinculados** (`409 ORGANIZATION_HAS_PRODUCERS`), pelo mesmo motivo `RESTRICT` das demais. |
| `paginate.controller.ts` | GET /administrator/organizations | Listagem paginada das organizações produtoras, com comunidade e território precarregados e a contagem de produtores de cada uma. `?stage=IN_FORMATION` é a fila da mentoria: as organizações que existem sem empresa e sem CNPJ, que a plataforma acompanha até formalizar. `?kind` recorta por tipo, `?communityId` por comunidade, `?womenLed` pelas lideradas por mulheres, e `?trashed` alcança as arquivadas. `?sort` aceita ORGANIZATION_SORT_COLUMNS e `?direction` aceita asc ou desc. |
| `paginate.use-case.ts` | — | Organizações com `community → territory (linhagem)`, `company` e `withCount('producers')` dos vivos. Filtros `?trashed`, `?kind`, **`?stage=IN_FORMATION`** (a fila da mentoria: as que existem sem empresa e sem CNPJ), `?communityId`, `?womenLed`, `?search`. |
| `show.controller.ts` | GET /administrator/organizations/:id | Devolve o objeto nu, sem envelope. Organização arquivada não é encontrada aqui - para alcançá-la, liste com `?trashed`. |
| `show.use-case.ts` | — | Organização viva com `storyBlocks` ordenados. |
| `unarchive.controller.ts` | PATCH /administrator/organizations/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só alcança o que está arquivada - registro vivo responde 404 aqui, pelo mesmo motivo que o arquivado responde 404 nas leituras normais. |
| `unarchive.use-case.ts` | — | Busca só a arquivada e zera. |
| `update.controller.ts` | PUT /administrator/organizations/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". **É por aqui que a formalização acontece**: ligar `companyId` e passar `stage` para `FORMALIZED` é o fim do acompanhamento. Um sem o outro responde `422`. |
| `update.use-case.ts` | — | **É por aqui que a formalização acontece**: ligar `companyId` e passar `stage: FORMALIZED`. Revalida a coerência com os valores efetivos (payload ou atuais) passando o próprio id como exceção. Valida blocos, reconfere slug quando muda, grava com `saveWithStory`. |

#### `administrator/producers/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/producers/:id/archive | Envia para a lixeira: grava `deletedAt`. Some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. |
| `archive.use-case.ts` | — | Grava `deletedAt`; já arquivado é `404`. |
| `create.controller.ts` | POST /administrator/producers | Cadastra um produtor pelo painel. `organizationId` é opcional: é assim que a organização em formação, que ainda não tem empresa para gerenciar os dela, ganha gente. Nasce **sem** `userId`: este é o produtor que não usa computador, e existe na plataforma sem logar nela. Quem se cadastra sozinho entra por `POST /authentication/sign-up/producer`, e a organização o vincula depois. `imageConsentAt` é o consentimento de imagem (RNF-704). Sem ele, nome e foto não saem em superfície pública nenhuma. `photoId` inexistente ou ainda `PENDING` responde `422` apontando o campo (RN-39, RN-51). Devolve 201 com o produtor criado, objeto nu e sem envelope. |
| `create.use-case.ts` | — | **`organizationId` é opcional** — é assim que a organização em formação, que ainda não tem empresa para gerenciar os dela, ganha gente; quando vem, é validada (`422`). Valida foto e blocos, gera slug, converte `joinedAt`, resolve o consentimento. Nasce **sem `userId`**: este é o produtor que não usa computador. |
| `delete.controller.ts` | DELETE /administrator/producers/:id | **Irreversível**: apaga a linha do banco. Só aceita o que já está arquivado, e recusa com 409 quando alguma coisa ainda aponta para ele. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige arquivado e **conta a autoria em `product_producers`** (`409 PRODUCER_HAS_PRODUCTS`) — a autoria de uma peça vendida não some. |
| `paginate.controller.ts` | GET /administrator/producers | Listagem paginada de produtores, com organização e foto precarregadas. `?organizationId` recorta por organização. `?linked=false` é a fila de quem se auto-cadastrou e ainda não foi vinculado a nenhuma - existe, tem perfil, e não publica produto. `?trashed` alcança os arquivados. `?sort` aceita PRODUCER_SORT_COLUMNS e `?direction` aceita asc ou desc. Esta é visão de painel: a foto sai independente de consentimento, porque quem administra precisa vê-la para decidir. O corte de RNF-704 é da vitrine. |
| `paginate.use-case.ts` | — | Produtores com `photo`, `organization` e `user`. `?trashed`, `?organizationId`, **`?linked`** (`false` = a fila de quem se auto-cadastrou e ainda não foi vinculado; `true` = o inverso), `?search` por nome OU ofício. |
| `show.controller.ts` | GET /administrator/producers/:id | Devolve o objeto nu, sem envelope. Produtor arquivado não é encontrado aqui - para alcançá-lo, liste com `?trashed`. |
| `show.use-case.ts` | — | Produtor vivo com foto, usuário, história ordenada e `organization → community → territory (linhagem)`. |
| `unarchive.controller.ts` | PATCH /administrator/producers/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só alcança o que está arquivado - registro vivo responde 404 aqui, pelo mesmo motivo que o arquivado responde 404 nas leituras normais. |
| `unarchive.use-case.ts` | — | Busca só o arquivado e zera. |
| `update.controller.ts` | PUT /administrator/producers/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". `organizationId` aceita `null` explícito para **desvincular** - o produtor volta a existir sem organização, e os produtos que ele fez continuam com a empresa. E `imageConsentAt: null` é a **revogação** do consentimento (RNF-704), que despublica nome e foto na leitura seguinte. |
| `update.use-case.ts` | — | Merge parcial com organização validada (`organizationId: null` **desvincula**), foto e blocos. `joinedAt` de ISO; `imageConsentAt: null` revoga o consentimento. **Extra em relação aos outros módulos**: quando `status` vem e o produtor tem conta própria, o `status` é gravado **no `User`**, e desativar **revoga todos os tokens dele** um a um — sem isso a conta suspensa seguiria autenticando até o token vencer. |

#### `administrator/products/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/products/:id/archive | Envia para a lixeira: grava `deletedAt`. Não confundir com `status: ARCHIVED`, que é estado de publicação e continua sendo gravado por `PUT /:id`. Reversível por `PATCH /:id/unarchive`. Privilégio exclusivo do dono (RN-04). |
| `archive.use-case.ts` | — | Grava `deletedAt` em qualquer produto (visão irrestrita). Não confundir com `status: ARCHIVED`, que é estado de publicação. |
| `delete.controller.ts` | DELETE /administrator/products/:id | **Irreversível**: apaga a linha do banco, e as associações com subcategorias e imagens vão junto por cascata. Só aceita produto já arquivado. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Busca sem filtrar `deletedAt` (para separar "vivo" de "inexistente") — vivo é `409 PRODUCT_NOT_ARCHIVED`. `product_subcategories` e `product_images` vão por `CASCADE`; os arquivos em `storages` ficam. |
| `paginate.controller.ts` | GET /administrator/products | Produtos de **todas** as empresas, visão irrestrita (RF-32, RN-19, UC-07). Não há escopo de sessão aqui: o painel lê o catálogo inteiro. Listagem paginada, com subcategorias e imagens precarregadas. `?companyId` recorta por empresa, `?search` filtra por nome e `?trashed` alcança os arquivados. `?sort` aceita PRODUCT_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. Empresa inexistente em `?companyId` devolve lista vazia, não erro - filtro é recorte, não busca de recurso. |
| `paginate.use-case.ts` | — | Produtos de **todas** as empresas, com 8 preloads (inclui `company`). `?trashed` sobre `products.deleted_at` qualificado, `?companyId`, filtros de catálogo e ordenação de `#core/catalog-query`. |
| `show.controller.ts` | GET /administrator/products/:id | Devolve o objeto nu, sem envelope, com subcategorias e imagens precarregadas - a galeria sai ordenada, e a primeira é a capa (RF-62). Visão irrestrita: alcança produto de qualquer empresa (RN-19). Produto arquivado não é encontrado aqui - para alcançá-lo, liste com `?trashed`. |
| `show.use-case.ts` | — | Produto vivo por id, sem filtro de empresa, com 11 preloads. Só o `deletedAt` esconde — removido é indistinguível de inexistente. |
| `unarchive.controller.ts` | PATCH /administrator/products/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só aceita produto arquivado - um produto vivo responde 404. O `status` não é tocado, então voltar da lixeira não republica na vitrine. Privilégio exclusivo do dono (RN-04). |
| `unarchive.use-case.ts` | — | Busca só o arquivado e zera `deletedAt`. **O `status` não é tocado**: produto arquivado enquanto `DRAFT` volta `DRAFT` e não reaparece na vitrine só por isso. |
| `update.controller.ts` | PUT /administrator/products/:id | Todo campo é opcional: só o que vier no payload muda. Mesma forma do módulo da empresa - só o escopo difere, e aqui não há nenhum (RN-19). `companyId` **não** entra: a posse do produto não se transfere por edição de painel. Criar também não existe neste módulo - produto nasce só pela empresa dona (RF-32). `sku` e `slug` são únicos globais e respondem `409` quando repetidos. Categoria inexistente, subcategoria de outra categoria (RN-38) e arquivo inexistente são `422` apontando o campo, nunca `404` nem `500` (RN-39). `imageIds` e `subcategoryIds` **substituem** a coleção inteira quando presentes; ausentes, deixam como está. A ordem de `imageIds` é a ordem da galeria, e o primeiro é a capa (RF-62). O `status` aqui é publicação (`DRAFT`/`ACTIVE`/`ARCHIVED`), não lixeira - arquivar é `PATCH /:id/archive`, e as duas coisas não se tocam. |
| `update.use-case.ts` | — | Mesma forma do `company/products/update`, **sem escopo de empresa**. Idêntica bateria de validações (categoria, coerência de subcategorias contra a categoria efetiva, sku/slug únicos, território, matérias, técnicas, história, galeria) e a mesma transação que sincroniza tudo. **Uma diferença de fundo**: `assertProducers(null, producers)` — passa `null` como organização, então o painel pode vincular **qualquer** produtor à peça, enquanto a empresa só pode vincular os da própria organização. `companyId` não entra: a posse não se transfere por edição de painel. |

#### `administrator/reviews/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `delete.controller.ts` | DELETE /administrator/reviews/:id | Tira uma avaliação do ar. A remoção é lógica: quem reclamou do comentário volta perguntando o que houve, e apagar a linha deixaria o painel sem resposta. A nota sai da média na hora, porque toda soma filtra `deletedAt`. |
| `delete.use-case.ts` | — | Remoção **lógica** (`deletedAt = now`), não física: quem reclamou do comentário volta perguntando o que houve, e apagar a linha deixaria o painel sem resposta. A nota sai da média na hora, porque toda soma filtra `deletedAt`. |
| `paginate.controller.ts` | GET /administrator/reviews | Todas as avaliações, para moderação (RN-19). Sem recorte obrigatório de produto: o painel precisa achar o comentário ofensivo de um produto que ele não conhece. `?search` casa o texto da avaliação, que é o que o moderador tem em mãos. `?trashed` mostra as já removidas. |
| `paginate.use-case.ts` | — | Todas as avaliações com `customer` e `product`. **Sem recorte obrigatório de produto** — ao contrário da vitrine: o painel precisa achar o comentário ofensivo de um produto que ele não conhece. `?trashed`, `?productId`, `?rating`, e `?search` casando o **texto do comentário**, que é o que o moderador tem em mãos. |

#### `administrator/sdgs/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /administrator/sdgs | Os 17 Objetivos de Desenvolvimento Sustentável da ONU, em ordem de código. Catálogo **fechado**: a lista é da ONU, não da plataforma, e não há escrita em módulo nenhum. Nasce em `database/seeders/sdg_seeder.ts`, que roda em todo ambiente - sem ele a tela de projeto de impacto não teria o que oferecer. |
| `paginate.use-case.ts` | — | Os 17 ODS ordenados por `code`, `?search` por título. Catálogo fechado — sem escrita em módulo nenhum; nasce no `sdg_seeder`. |

#### `administrator/subcategories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/subcategories/:id/archive | Envia para a lixeira: grava `deletedAt`. A subcategoria some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. Privilégio exclusivo do dono (RN-04). |
| `archive.use-case.ts` | — | Grava `deletedAt`; já arquivada é `404`. |
| `create.controller.ts` | POST /administrator/subcategories | Cria uma subcategoria sob uma categoria existente (RF-25, RF-28, UC-04). O `slug` é opcional: sem ele, sai do nome; com ele, passa pelo mesmo normalizador, senão a URL da vitrine sairia quebrada. Nome e slug são únicos **dentro da categoria**, não globalmente - "Acessórios" existe sob Vestuário e sob Tecnologia ao mesmo tempo. Repetido na mesma categoria responde `409`. Categoria inexistente ou arquivada é `422` apontando `categoryId`, nunca `404` nem `500` (RN-39): quem mandou o id errado foi o payload. |
| `create.use-case.ts` | — | Valida a categoria dona (`422`). A unicidade é **por categoria**: busca `categoryId` + (`name` OU `slug`). Arquivada é **ressuscitada**; viva é `409`. |
| `delete.controller.ts` | DELETE /administrator/subcategories/:id | **Irreversível**: apaga a linha do banco, e as associações com produtos somem por cascata sem levar o produto junto. Só aceita subcategoria já arquivada. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige arquivada. **Sem guarda de produto**: `product_subcategories` é `CASCADE` dos dois lados, então a associação some com a subcategoria sem levar o produto junto. |
| `paginate.controller.ts` | GET /administrator/subcategories | Listagem paginada. `?search` filtra por nome, `?categoryId` recorta por categoria e `?trashed` alcança as arquivadas. `?sort` aceita CATALOG_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. |
| `paginate.use-case.ts` | — | `?trashed`, `?search` por nome, `?categoryId`. |
| `show.controller.ts` | GET /administrator/subcategories/:id | Devolve o objeto nu, sem envelope. Subcategoria arquivada não é encontrada aqui - para alcançá-la, liste com `?trashed`. |
| `show.use-case.ts` | — | Subcategoria viva por id. `404`. |
| `unarchive.controller.ts` | PATCH /administrator/subcategories/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só aceita subcategoria arquivada - uma subcategoria viva responde 404. Não restaura a categoria dona junto. Privilégio exclusivo do dono (RN-04). |
| `unarchive.use-case.ts` | — | Busca só a arquivada e zera. **A categoria dona pode estar arquivada, e restaurar a subcategoria não a restaura junto** — a subcategoria volta visível e a categoria não; restaurar a categoria é chamada à parte. |
| `update.controller.ts` | PUT /administrator/subcategories/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". A subcategoria pode mudar de categoria dona. Quando isso acontece, nome e slug são reconferidos contra a categoria **nova** - únicos ali dentro, não globalmente -, e repetido responde `409`. Categoria inexistente ou arquivada é `422` apontando `categoryId` (RN-39). |
| `update.use-case.ts` | — | **Pode mudar de categoria dona.** Valida a nova categoria, calcula nome e slug efetivos e, se qualquer um dos três mudou, reconfere o par `(categoryId, name\|slug)` **contra a categoria nova** com `409`. |

#### `administrator/techniques/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/techniques/:id/archive | Envia para a lixeira: grava `deletedAt`. Some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. |
| `archive.use-case.ts` | — | Grava `deletedAt`; já arquivada é `404`. |
| `create.controller.ts` | POST /administrator/techniques | O `slug` é opcional: sem ele, sai do nome. Não há enum de tipo - o artesanato amazônico não cabe numa lista fechada, e o que justifica a tabela é o filtro da vitrine, não a taxonomia. Devolve 201 com a técnica criada, objeto nu e sem envelope. |
| `create.use-case.ts` | — | Slug normalizado, **ressuscita a arquivada**, `409` se viva. Não há enum de tipo — o artesanato amazônico não cabe em lista fechada, e o que justifica a tabela é o filtro da vitrine, não a taxonomia. |
| `delete.controller.ts` | DELETE /administrator/techniques/:id | **Irreversível**: apaga a linha do banco. Só aceita o que já está arquivada, e recusa com 409 quando alguma peça ainda aponta para ela. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | Exige arquivada e conta o uso em `product_techniques` (`409 TECHNIQUE_HAS_PRODUCTS`), pelo motivo `RESTRICT`. |
| `paginate.controller.ts` | GET /administrator/techniques | Listagem paginada do catálogo global de técnicas de produção, com a contagem de produtos que usam cada uma. `?search` filtra por nome e `?trashed` alcança as arquivadas. `?sort` aceita TECHNIQUE_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. |
| `paginate.use-case.ts` | — | `withCount('products')` dos vivos, `?trashed`, `?search`. |
| `show.controller.ts` | GET /administrator/techniques/:id | Devolve o objeto nu, sem envelope. Técnica arquivada não é encontrada aqui - para alcançá-la, liste com `?trashed`. |
| `show.use-case.ts` | — | Técnica viva por id. `404`. |
| `unarchive.controller.ts` | PATCH /administrator/techniques/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só alcança o que está arquivada - registro vivo responde 404 aqui, pelo mesmo motivo que o arquivado responde 404 nas leituras normais. |
| `unarchive.use-case.ts` | — | Busca só a arquivada e zera. |
| `update.controller.ts` | PUT /administrator/techniques/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". |
| `update.use-case.ts` | — | Merge parcial com slug reconferido quando muda. |

#### `administrator/territories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /administrator/territories/:id/archive | Envia para a lixeira: grava `deletedAt`. Some das listagens padrão e reaparece com `?trashed=only`. Reversível por `PATCH /:id/unarchive`. |
| `archive.use-case.ts` | — | Grava `deletedAt`; já arquivado é `404`. |
| `create.controller.ts` | POST /administrator/territories | O `slug` é opcional: sem ele, sai do nome. `parentId` monta a hierarquia BIOME > REGION > MUNICIPALITY, e o filho tem de ser mais profundo que o pai - um bioma pendurado num município responde `422` apontando o campo (RN-39). `uf` é opcional porque um bioma atravessa nove estados. Devolve 201 com o território criado, objeto nu e sem envelope. |
| `create.use-case.ts` | — | **`assertHierarchy(kind, parentId)`** antes de tudo: o filho tem de ser mais profundo que o pai (BIOME > REGION > MUNICIPALITY) — um bioma pendurado num município é `422`. Slug normalizado, **ressuscita o arquivado**, `409` se vivo. |
| `delete.controller.ts` | DELETE /administrator/territories/:id | **Irreversível**: apaga a linha do banco. Só aceita o que já está arquivado, e recusa com 409 quando alguma coisa ainda aponta para ele. Privilégio exclusivo do dono (RN-04). |
| `delete.use-case.ts` | — | O `delete` com mais guardas do sistema: exige arquivado e faz **quatro contagens** antes de apagar — territórios filhos (`TERRITORY_HAS_CHILDREN`), comunidades (`TERRITORY_HAS_COMMUNITIES`), produtos (`TERRITORY_HAS_PRODUCTS`) e o `territory_id` da pivô `product_materials` (`TERRITORY_HAS_MATERIALS`). Todas existem porque as FKs são `RESTRICT`, e todas contam o arquivado, porque é a linha que a constraint enxerga. |
| `paginate.controller.ts` | GET /administrator/territories | Listagem paginada do catálogo global de territórios. `?search` filtra por nome, `?kind` recorta por nível (BIOME, REGION, MUNICIPALITY) e `?parentId` devolve os filhos diretos de um território - é assim que a árvore é navegada. `?trashed` alcança os arquivados. `?sort` aceita TERRITORY_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenada por nome crescente. |
| `paginate.use-case.ts` | — | Territórios com `parent`. `?trashed`, `?kind`, `?parentId` (os filhos diretos — é assim que a árvore é navegada), `?search`. |
| `show.controller.ts` | GET /administrator/territories/:id | Devolve o objeto nu, sem envelope. Território arquivado não é encontrado aqui - para alcançá-lo, liste com `?trashed`. |
| `show.use-case.ts` | — | Território vivo por id. `404`. |
| `unarchive.controller.ts` | PATCH /administrator/territories/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só alcança o que está arquivado - registro vivo responde 404 aqui, pelo mesmo motivo que o arquivado responde 404 nas leituras normais. |
| `unarchive.use-case.ts` | — | Busca só o arquivado e zera. |
| `update.controller.ts` | PUT /administrator/territories/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". Mudar `parentId` revalida a hierarquia inteira, inclusive contra ciclo: pendurar um território abaixo de um descendente dele responde `422`. |
| `update.use-case.ts` | — | **Mudar `kind` ou `parentId` revalida a hierarquia inteira** passando o próprio id — `assertHierarchy` também recusa **ciclo**: pendurar um território abaixo de um descendente dele mesmo. Slug reconferido quando muda. |


### `authentication/` — sessão

Três auto-cadastros públicos separados por caminho — **o papel vai na URL, nunca no payload**. Empresa e produtor nascem `INACTIVE` (publicam no catálogo, passam por curadoria); comprador nasce `ACTIVE`. Os endpoints de sessão respondem `204` sem corpo: o que importa é o `Set-Cookie` com o par de tokens `httpOnly`. `refresh` fica fora do grupo autenticado de propósito — é o token vencido que traz alguém até lá.

| Arquivo | Rota | O que faz |
|---|---|---|
| `refresh.controller.ts` | POST /authentication/refresh | Renova a sessão a partir do cookie de refresh, e responde `204` com o par de tokens novo no `Set-Cookie`. Fica **fora** do grupo autenticado de propósito: é justamente o token de acesso vencido que traz alguém até aqui, então exigir sessão válida tornaria a rota inalcançável. Quem autoriza é o cookie de refresh, e nada mais. **Rotaciona**: o refresh usado é apagado ao emitir o novo. Duas renovações simultâneas com o mesmo token gastam-no duas vezes e a segunda derruba a sessão - o cliente deduplica (`http.ts`, `pendingRenewal`). Cookie ausente, ilegível ou que não seja de refresh responde `401`, sem distinguir qual dos três foi. |
| `refresh.use-case.ts` | — | Verifica o refresh token do cookie com `User.accessTokens.verify`. Confere que `token.name` é o de **refresh** (não o de acesso) — token de acesso usado aqui é `401 REFRESH_TOKEN_INVALID`. Token ilegível cai em `logger.debug`, não em erro. **Rotação: apaga o refresh usado** antes de devolver o usuário; o controller emite o par novo. Ausente é `401 REFRESH_TOKEN_MISSING`. |
| `sign-in.controller.ts` | POST /authentication/sign-in | Abre a sessão. Responde `204` **sem corpo**: o que importa é o `Set-Cookie` com o par de tokens `httpOnly` (RNF-02). O cliente nunca manipula o token, e nenhum dado do usuário viaja dentro dele. A falha é **indistinguível por causa** (RN-14, RNF-03): senha errada, conta inativa e conta removida devolvem o mesmo `401`. É o que impede descobrir quais e-mails existem - e é o que faz a aprovação de empresa valer alguma coisa, porque a conta recém-cadastrada nasce `INACTIVE` e cai neste mesmo 401 até alguém aprová-la (RF-17). |
| `sign-in.use-case.ts` | — | `User.verifyCredentials(email, password)` e, em seguida, recusa quem está `deletedAt` ou `INACTIVE`. **As três falhas devolvem a mesma resposta** — `401 INVALID_CREDENTIALS` com `root: 'Dados de acesso inválidos'` —, então senha errada, conta removida e conta não aprovada são indistinguíveis de fora. `E_INVALID_CREDENTIALS` do Adonis é capturado e traduzido, não vaza. |
| `sign-out.controller.ts` | POST /authentication/sign-out | Encerra a sessão **no servidor**, e não só na tela: apaga o token de acesso atual e o de refresh, depois limpa os dois cookies. Responde `204` sem corpo. Token de refresh ilegível não impede a saída - os cookies são limpos de qualquer forma, porque o resultado que o usuário pediu é ficar sem sessão. Apaga só os tokens desta sessão. Derrubar **todas** é consequência de trocar e-mail ou senha (RN-15), não desta rota. |
| `sign-out.use-case.ts` | — | Apaga o access token corrente (`user.currentAccessToken.identifier`) e, se o cookie de refresh veio, verifica e apaga o refresh também. **Encerra no servidor, não só na tela.** Refresh ilegível não impede a saída: cai em `logger.debug` e o fluxo segue — o controller limpa os cookies de qualquer forma. |
| `sign-up-customer.controller.ts` | POST /authentication/sign-up/customer | Auto-cadastro público de comprador (R11). Cria **só** o usuário: o comprador não tem perfil em outra tabela, ao contrário da empresa. A conta nasce `ACTIVE` e autentica em seguida - não há o que aprovar. A empresa nasce `INACTIVE` porque vender exige curadoria; comprar não. O papel vai no caminho, nunca no payload (RN-03). `cpf` é opcional e único quando informado. E-mail ou CPF já em uso respondem `409` apontando o campo; uma conta removida não é reativada por aqui. |
| `sign-up-customer.use-case.ts` | — | Cria **só** o usuário — o comprador não tem perfil em outra tabela, então não há transação. Recusa e-mail e CPF já usados (`409`, apontando o campo). Nasce `role: CUSTOMER`, `status: ACTIVE`: comprar não passa por curadoria. Conta removida **não** é reativada — o cadastro é público, e ressuscitar registro removido daria a quem souber o e-mail um caminho de volta (AD-009). |
| `sign-up-producer.controller.ts` | POST /authentication/sign-up/producer | Auto-cadastro público de produtor (RFC 002, F7). Cria o usuário e o registro em `producers` na mesma transação (RN-44). A conta nasce **`INACTIVE`** e **não** recebe tokens: o produtor publica conteúdo no catálogo da plataforma, e é a mesma razão de RF-17 para a empresa. Quem aprova é o painel. O papel vai no caminho, nunca no payload (RN-03). E-mail já em uso responde `409` com a **mesma** mensagem dos outros sign-ups, para não revelar de que tipo é a conta existente (RN-41). **Sem `organizationId`.** Quem vincula é a organização, por `POST /company/producers/link`, ou o painel. Se o produtor pudesse se declarar membro de uma cooperativa no próprio cadastro, o selo de rastreabilidade viraria autoatribuído. Aprovado e sem organização, ele entra, edita o próprio perfil e **não publica**: `POST /producer/products` responde `422` dizendo que falta vínculo. |
| `sign-up-producer.use-case.ts` | — | Usuário + linha em `producers` numa **transação** (RN-44). Slug pelo `SlugService.forProducer`. Nasce `INACTIVE` — publica no catálogo, passa por curadoria — e **sem organização** (`organizationId: null`) e **sem consentimento de imagem** (`imageConsentAt: null`): existe, é encontrável, e não publica até uma cooperativa o vincular. `409` em e-mail duplicado. |
| `sign-up.controller.ts` | POST /authentication/sign-up/company | Auto-cadastro público de empresa (RF-16, UC-01). Cria o usuário, o perfil em `companies` e o primeiro endereço numa transação só (RN-44, RN-46). A conta nasce `INACTIVE` e **não autentica** até que dono ou administrador a aprove (RF-17) - por isso a resposta é `201` com a empresa criada, e **não** um par de tokens: emitir sessão aqui seria entregar um acesso que o sign-in recusaria em seguida. O papel vai no caminho, nunca no payload (RN-03): `role` e `status` são do servidor, e nem sequer são declarados no schema. O `slug` da vitrine é derivado do nome fantasia, com desempate automático - nome fantasia repetido é normal e não é conflito. E-mail ou CNPJ já em uso respondem `409`. Uma conta removida **não** é reativada por aqui: o cadastro é público, e ressuscitar registro removido daria a quem souber o e-mail um caminho de volta. |
| `sign-up.use-case.ts` | — | Usuário + perfil em `companies` + **primeiro endereço com `isDefault: true`**, tudo numa transação (RN-44, RN-46). Recusa e-mail (em `users`) e CNPJ (em `companies`) já usados, cada um com seu código. Slug pelo `SlugService.forCompany(tradeName ?? legalName)`. Nasce `role: COMPANY`, `status: INACTIVE` — não autentica até aprovação (RF-17). |


### `company/` — painel da empresa

Guarda do grupo: `auth()` + `role([COMPANY])`. Todo escopo desce de `sessão → usuário → empresa → organização`, sempre por `companyOf(userId)`. Recurso de outra empresa responde `404`, nunca `403`. Catálogos globais (categorias, subcategorias, certificações, territórios, comunidades, materiais, técnicas, ODS) aparecem aqui **somente leitura**, cada um com use-case próprio e duplicado de propósito (AD-019) — não é dela o catálogo.

#### `company/addresses/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `_shared.default.ts` | — | `unsetDefault(userId, trx)` desmarca o principal atual. Chamado **dentro** da transação que marca o novo — é isso que mantém a exclusividade sem índice único parcial: durante a troca os dois ficam marcados por um instante, e um `UNIQUE ... WHERE is_default` recusaria justamente essa escrita intermediária. Escopo é o **usuário**, não a empresa: o endereço pendura no usuário, para qualquer papel futuro poder ter um. |
| `archive.controller.ts` | PATCH /company/addresses/:id/archive | Envia para a lixeira: grava `deletedAt`. Recusado quando é o último endereço ativo da empresa (RN-46). Endereço de outra empresa responde 404, nunca 403. Reversível por `PATCH /:id/unarchive`. |
| `archive.use-case.ts` | — | Escopado por `userId`; alheio ou já arquivado é `404`. **Conta os ativos antes de arquivar**: se sobrar só um, recusa com `422 LAST_ADDRESS` (RN-46 é regra de aplicação, não do banco). Grava `deletedAt`. |
| `create.controller.ts` | POST /company/addresses<br>POST /customer/addresses | Cria um endereço da própria empresa (RF-19, UC-08). O dono é sempre o usuário da sessão: não existe `userId` no payload, e não teria como existir (RF-13, RN-18). `complement` é o único campo opcional. CEP e UF perdem a máscara e são normalizados antes de gravar, então `01001-000` e `01001000` gravam o mesmo valor. Não há mínimo aqui: o primeiro endereço da empresa nasce no sign-up (RN-46), e o mínimo de um volta a ser cobrado no arquivamento. |
| `create.use-case.ts` | — | `isDefault` implícito quando é o **primeiro** endereço do usuário (`payload.isDefault ?? !existing`). Numa transação: se vai ser o principal, chama `unsetDefault` antes de criar. `userId` vem do guard. |
| `delete.controller.ts` | DELETE /company/addresses/:id | **Irreversível**: apaga a linha do banco. Só aceita endereço já arquivado - o mínimo de um endereço ativo (RN-46) é garantido lá, no `PATCH /:id/archive`. Endereço de outra empresa responde 404, nunca 403. |
| `delete.use-case.ts` | — | Apaga a linha, escopado por `userId`. **Exige já arquivado** (`409 ADDRESS_NOT_ARCHIVED`). Não repete a guarda de RN-46: endereço arquivado já não conta como ativo, e quem barra o último é o `archive`. Devolve um snapshot do que foi apagado. |
| `paginate.controller.ts` | GET /company/addresses<br>GET /customer/addresses | Endereços da **própria** empresa. `?search` filtra por logradouro, bairro ou cidade e `?trashed` alcança os arquivados. `?sort` aceita ADDRESS_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenados por data de criação crescente. O recorte vem da sessão (RN-16): não há parâmetro de usuário nesta rota, e nenhum endpoint aceita identificador que decida escopo de dados (RF-13, RNF-06). |
| `paginate.use-case.ts` | — | Só os do próprio `userId` (vem do guard — a empresa não escolhe de quem lê). `?trashed` alterna vivos/arquivados. `?search` casa `logradouro` OU `neighborhood` OU `city`. Ordem padrão `createdAt`. |
| `show.controller.ts` | GET /company/addresses/:id<br>GET /customer/addresses/:id | Devolve o objeto nu, sem envelope. Endereço de outra empresa responde `404`, nunca `403` (RN-17, RNF-07): a API não confirma a existência de dado alheio. Endereço arquivado também responde `404` - para alcançá-lo, liste com `?trashed`. |
| `show.use-case.ts` | — | `id` + `userId` + vivo. Endereço de outra empresa e removido caem no mesmo `404` — nunca `403`. |
| `unarchive.controller.ts` | PATCH /company/addresses/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só aceita endereço arquivado - um endereço vivo responde 404, assim como o de outra empresa. |
| `unarchive.use-case.ts` | — | Busca **só o arquivado** (`whereNotNull('deletedAt')`) e zera. Sem contrapartida de RN-46: restaurar só aumenta o número de ativos. |
| `update.controller.ts` | PUT /company/addresses/:id<br>PUT /customer/addresses/:id | Todo campo é opcional: só o que vier no payload muda. Campo ausente significa "não mexer", não "apagar". Endereço de outra empresa responde `404`, nunca `403` (RN-17). |
| `update.use-case.ts` | — | Merge parcial escopado. Se `isDefault` vier verdadeiro, chama `unsetDefault` **dentro da mesma transação** antes de salvar. |

#### `company/categories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /company/categories | Catálogo global de categorias, **somente leitura**, para a empresa classificar os próprios produtos (RF-27, RN-05). `?search` filtra por nome, `?sort` aceita CATALOG_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenado por nome crescente. Não há filtro por empresa: categoria é global e não pertence a ninguém (RF-25). Criar, editar e remover são do painel - este módulo só lê, e por isso `POST`, `PUT` e `DELETE` não existem aqui. |
| `paginate.use-case.ts` | — | Catálogo global, só vivas, `?status` e `?search`. **Duplicação deliberada (AD-019)**: os módulos não se referenciam, então filtro administrativo novo no painel não muda a visão da empresa por acidente. Sem filtro por empresa — categoria é global. |
| `show.controller.ts` | GET /company/categories/:id | Devolve o objeto nu, sem envelope. Somente leitura (RF-27). Categoria arquivada responde `404`: este módulo não tem lixeira, porque não é dele o catálogo. |
| `show.use-case.ts` | — | Categoria viva por id. Arquivada é `404`: este módulo não tem lixeira, porque não é dele o catálogo. |

#### `company/certification-grants/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `create.controller.ts` | POST /company/certification-grants | Registra um selo para uma peça (`productId`) ou para a organização (sem `productId`). Nasce **sempre** `PENDING`: quem aprova é o painel, e só com o documento anexado (§5.2). Selo de escopo incompatível com o assunto é `422` apontando `certificationId`; selo já registrado para o mesmo assunto é `409`. Devolve 201 com a concessão criada. |
| `create.use-case.ts` | — | `companyOf` → `assertCertificationScope` (o selo aceita este assunto?) → `scopedProduct` (se veio `productId`, a peça é da empresa?) → valida o documento. Recusa duplicata do par selo+assunto com `409`. Grava com **`status: PENDING` sempre** e `productId`/`companyId` mutuamente exclusivos — a empresa não carimba o próprio selo, senão a certificação seria autodeclarada como qualquer campo de texto. |
| `delete.controller.ts` | DELETE /company/certification-grants/:id | Remove um registro **pendente**. O que já foi avaliado responde `409`: selo aprovado não se apaga, se revoga - e a revogação é do painel, com o histórico ficando. Devolve 204. |
| `delete.use-case.ts` | — | Remoção **física**, e só de `PENDING` (`409 CERTIFICATION_GRANT_REVIEWED` caso contrário): a linha pendente nunca foi pública, e não há histórico a preservar. O que foi aprovado não se apaga — vira `REVOKED` pelo painel, e fica. |
| `paginate.controller.ts` | GET /company/certification-grants | Os selos da empresa e das peças dela, numa lista só. `companyId` preenchido é selo da organização; `productId` preenchido é selo de uma peça. O escopo é sempre o da sessão (RN-18). `?status=` recorta por estado - `PENDING` é o que ainda espera o painel, e `EXPIRED` é o que o comando `certifications:expire` já derrubou. |
| `paginate.use-case.ts` | — | Selos **da organização e das peças dela numa lista só**: `where('companyId', X).orWhereHas('product', product => product.where('companyId', X))`. Precarrega `certification` e `document`. Filtro `?status`. |
| `show.controller.ts` | GET /company/certification-grants/:id | A concessão, com o selo e o documento anexado. De outra empresa responde `404`, nunca `403` (RN-17). |
| `show.use-case.ts` | — | `scopedGrant` + `certification` + `document` — é a tela em que a empresa confere o que anexou. De outra empresa é `404`. |
| `update.controller.ts` | PUT /company/certification-grants/:id | Corrige data de emissão, validade e documento. Editar um selo **aprovado** o devolve para `PENDING`: trocar o certificado depois do aval refaria a alegação sem ninguém conferir. O selo e o assunto não mudam - para isso apague e registre de novo. |
| `update.use-case.ts` | — | Corrige `issuedAt`, `expiresAt` e `documentId` (cada um respeitando `undefined` = não mexer, `null` = limpar). **Se o selo estava `VALID`, volta para `PENDING`**: trocar o documento depois do aval refaria a alegação sem ninguém conferir, e é a conferência que dá valor ao selo. Selo e assunto não mudam. |

#### `company/certifications/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /company/certifications | Catálogo global de certificaçãos, **somente leitura**, para a empresa classificar os próprios produtos (RF-27, RN-05). `?search` filtra por nome, `?sort` aceita CATALOG_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenado por nome crescente. Não há filtro por empresa: certificação é global e não pertence a ninguém (RF-25). Criar, editar e remover são do painel - este módulo só lê, e por isso `POST`, `PUT` e `DELETE` não existem aqui. |
| `paginate.use-case.ts` | — | Catálogo global de selos, só vivos, `?status` e `?search`. Use-case próprio por AD-019. |
| `show.controller.ts` | GET /company/certifications/:id | Devolve o objeto nu, sem envelope. Somente leitura (RF-27). Certificação arquivada responde `404`: este módulo não tem lixeira, porque não é dele o catálogo. |
| `show.use-case.ts` | — | Certificação viva por id. `404 CERTIFICATION_NOT_FOUND`. |

#### `company/communities/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /company/communities | Comunidades do catálogo global, só leitura, com o território precarregado. `?territoryId` recorta por território. `?sort` aceita COMMUNITY_SORT_COLUMNS e `?direction` aceita asc ou desc. A empresa lê o catálogo para classificar a origem das peças, e nada além disso. Sem `?trashed`: registro arquivado não existe para quem só escolhe. |
| `paginate.use-case.ts` | — | Comunidades vivas com `territory` em linhagem; `?territoryId` e `?search`. Cópia deliberada do painel — lá a listagem enxerga a lixeira, aqui nunca. |
| `show.controller.ts` | GET /company/communities/:id | Devolve o objeto nu, sem envelope. Registro arquivado não é encontrada aqui. |
| `show.use-case.ts` | — | Comunidade viva por id com `territory` em linhagem. `404 COMMUNITY_NOT_FOUND`. |

#### `company/impact-allocations/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `close.controller.ts` | DELETE /company/impact-allocations/:id | Encerra a vigência preenchendo `effectiveToAt`. **Não apaga**: a linha continua respondendo o que a peça prometia enquanto valeu, e é isso que separa uma alocação versionada de um campo sobrescrito. Alocação já encerrada responde `404`. Devolve 204. |
| `close.use-case.ts` | — | Busca a alocação **vigente** (`effectiveToAt` nulo) da empresa e preenche `effectiveToAt = now`. **Não apaga**: a linha continua respondendo o que a peça prometia enquanto valeu — é isso que separa uma alocação versionada de um campo sobrescrito. Já encerrada é `404`. |
| `create.controller.ts` | POST /company/impact-allocations | Cria uma alocação vigente. `shareRate` em **pontos-base**: `500` é 5%. `productId` presente é alocação sobre a venda daquela peça; ausente é sobre o faturamento da organização inteira. A soma das vigentes do mesmo assunto não passa de 100% - `422` apontando `shareRate`, com o total que daria. O projeto precisa estar `ACTIVE`: alocar para um rascunho seria prometer para algo que ninguém aprovou. **Não existe update.** Para mudar o percentual, encerre a vigente (`DELETE /:id`) e crie outra: o que a peça prometia em março continua verdade sobre a venda de março. |
| `create.use-case.ts` | — | `scopedProject` + **exige o projeto `ACTIVE`** (`422 IMPACT_PROJECT_NOT_ACTIVE` — alocar para rascunho seria prometer para algo que ninguém aprovou) + `scopedProduct` (nulo = alocação sobre o faturamento da organização) + `assertShareFits` (a soma das vigentes do mesmo assunto tem de caber). Cria com `effectiveToAt: null`. **Não existe update**: para mudar o percentual, encerra-se a atual e cria-se outra — o que a peça prometia em março continua verdade sobre a venda de março. |
| `paginate.controller.ts` | GET /company/impact-allocations | As alocações de valor da empresa da sessão (RF-707), com o histórico inteiro. `?current=true` traz só o que está vigente (`effectiveToAt` nulo). O padrão mostra tudo, porque a alocação é versionada: esconder o que venceu deixaria a tela sem como responder o que a peça prometia no mês passado. |
| `paginate.use-case.ts` | — | Alocações da empresa com `project` precarregado. Filtros `?impactProjectId`, `?productId` e **`?current`** (só `effectiveToAt` nulo). O padrão mostra o histórico inteiro, porque a alocação é versionada. |

#### `company/impact-projects/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `_shared.scope.ts` | — | `assertSdgs(ids)` confere que todos os ODS existem e devolve `422 SDG_NOT_FOUND` apontando o campo — em vez de deixar a FK estourar como 500; deduplica a lista e distingue `undefined` (não mexer) de `[]` (esvaziar). `syncSdgs(project, ids, trx)` deixa a lista igual à enviada. Fica aqui porque criar e editar cobram a mesma coisa. |
| `archive.controller.ts` | PATCH /company/impact-projects/:id/archive | Remoção lógica. As peças que dependiam deste projeto para o nível `IMPACT` do selo caem para `TRACED` na leitura seguinte - o nível é calculado, e não gravado (§5.1). De outra empresa responde `404` (RN-17). |
| `archive.use-case.ts` | — | Grava `deletedAt` no projeto da empresa. As alocações que apontavam para ele **param de contar para o nível `IMPACT`** das peças, porque o cálculo ignora projeto removido — uma peça não pode exibir impacto de projeto que saiu do ar. |
| `create.controller.ts` | POST /company/impact-projects | Cria um projeto de impacto. `companyId` não entra no payload: é o da sessão (RN-18). Nasce **sempre** `DRAFT`. Ativar é `PATCH /:id/status`, e exige ao menos um ODS vinculado - projeto ativo sem objetivo declarado é a alegação vaga que a tabela de ODS existe para substituir. Devolve 201 com o projeto criado. |
| `create.use-case.ts` | — | `assertSdgs` + capa + slug normalizado com `409` em duplicata (o campo apontado é `slug` ou `title`, conforme o que o cliente mandou). Cria em **transação** com `status: DRAFT` sempre e sincroniza os ODS. Deixar `status` no payload permitiria projeto nascer ativo sem objetivo declarado — a alegação vaga que a tabela de ODS existe para substituir. |
| `paginate.controller.ts` | GET /company/impact-projects | Os projetos de impacto da empresa da sessão (RF-706). `?status=` recorta por estado - `DRAFT` é o que ainda não tem ODS suficiente para ativar. |
| `paginate.use-case.ts` | — | Projetos da empresa com `community`, `cover` e `sdgs`. `?trashed`, `?status`, `?search` por título. |
| `show.controller.ts` | GET /company/impact-projects/:id | O projeto com comunidade, capa e ODS vinculados. De outra empresa responde `404`, nunca `403` (RN-17). |
| `show.use-case.ts` | — | `scopedProject` + `community`, `cover`, `sdgs`. De outra empresa é `404`. |
| `transition.controller.ts` | PATCH /company/impact-projects/:id/status | Muda o estado do projeto: `DRAFT`, `ACTIVE`, `PAUSED`, `FINISHED`. Sair de `DRAFT` exige ao menos um ODS vinculado - `422` apontando `sdgIds`. Só projeto `ACTIVE` sustenta alocação de valor para o nível `IMPACT` do selo (§5.1). |
| `transition.use-case.ts` | — | Muda o `status` via `assertProjectReady` — sair de `DRAFT` cobra ao menos um ODS vinculado. Separado da edição pelo mesmo motivo do `archive` no produto: **o que muda o que a vitrine mostra não pode ser efeito colateral de um PUT de formulário**. |
| `unarchive.controller.ts` | PATCH /company/impact-projects/:id/unarchive | Devolve o projeto à listagem padrão, com o `status` que ele tinha. Projeto que não está na lixeira responde `404`. |
| `unarchive.use-case.ts` | — | Busca só o arquivado e zera `deletedAt`. Volta com o `status` que tinha — arquivar não é despublicar, e restaurar não republica. |
| `update.controller.ts` | PUT /company/impact-projects/:id | Edita o conteúdo do projeto. `sdgIds` presente **substitui** a lista inteira; ausente, deixa como está - a mesma regra de `subcategoryIds` no produto. `status` não entra aqui: transição é `PATCH /:id/status`, porque o que muda o que a vitrine mostra não pode ser efeito colateral de um formulário. |
| `update.use-case.ts` | — | Merge parcial com `assertSdgs`, capa e slug reconferido só quando muda. Transação sincroniza os ODS. **`status` não entra**: transição é ação própria e cobra os ODS. |

#### `company/impact-reports/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `_shared.scope.ts` | — | `scopedReport(companyId, reportId)` desce por `impact_projects.company_id` via `whereHas('project')` — o relatório **não guarda a empresa, e não deve**: ele pertence ao projeto, e o projeto à empresa. Duplicar a coluna abriria espaço para as duas divergirem. `404 IMPACT_REPORT_NOT_FOUND`. |
| `archive.controller.ts` | PATCH /company/impact-reports/:id/archive | Remoção lógica: o relatório sai da vitrine e das listagens padrão, e continua alcançável por `?trashed=only`. Devolve 204. |
| `archive.use-case.ts` | — | Grava `deletedAt` no relatório escopado — sai da vitrine e das listagens padrão. |
| `create.controller.ts` | POST /company/impact-reports | Registra o que o projeto entregou num período. Valor em **centavos**, inteiro. Nasce em rascunho: publicar é `PATCH /:id/publish`, e é lá que a evidência é cobrada (§5.2). Período com fim antes do começo é `422` apontando `periodEndAt`. Devolve 201. |
| `create.use-case.ts` | — | `scopedProject` + `assertPeriod` (função local: data inválida e **fim antes do começo** viram `422 IMPACT_REPORT_INVALID_PERIOD` apontando o campo — sem isso a tela desenharia uma barra ao contrário) + valida a evidência. Nasce com **`publishedAt: null`**: publicar é ação própria porque é ela que cobra a prova (§5.2). Valor em centavos, default 0. |
| `paginate.controller.ts` | GET /company/impact-reports | Os relatórios de impacto da empresa da sessão (RF-708). `?impactProjectId=` recorta por projeto. `publishedAt` nulo é rascunho, e rascunho **não** sai na vitrine - o corte é do lado público, e aqui a empresa vê os dois. |
| `paginate.use-case.ts` | — | Relatórios cujo projeto é da empresa (`whereHas('project')`), com `project` e `evidence`. `?trashed` e `?impactProjectId`. Ordem padrão por `periodStartAt`. Rascunho e publicado aparecem juntos — o corte é do lado público. |
| `publish.controller.ts` | PATCH /company/impact-reports/:id/publish | Publica o relatório. **Sem evidência anexada não publica** - `422` apontando `evidenceId`. É a §5.2 em código: nenhuma alegação socioambiental sai daqui sem responsável, data e prova. Idempotente: republicar não move a data, porque "publicado em" é o instante em que o relatório virou público, e não o do último clique. Devolve 204. |
| `publish.use-case.ts` | — | **Sem `evidenceId` não publica**: `422 IMPACT_REPORT_NO_EVIDENCE` apontando o campo. É a §5.2 em código — nenhuma alegação socioambiental sai sem responsável, data e prova, e das três a prova é a única que ninguém preenche sozinho. **Idempotente**: já publicado devolve o registro sem mover a data ("publicado em" é quando virou público, não o último clique). |
| `show.controller.ts` | GET /company/impact-reports/:id | O relatório com o projeto e a evidência anexada. De outra empresa responde `404` (RN-17) - o recorte desce por `impact_projects.company_id`. |
| `show.use-case.ts` | — | `scopedReport` + `project` + `evidence`. |
| `update.controller.ts` | PUT /company/impact-reports/:id | Corrige o relatório. Editar um relatório **publicado** o despublica: o número que foi ao ar é uma alegação pública sobre dinheiro, e trocá-lo em silêncio deixaria a página dizendo outra coisa sem registro nenhum. Republique com `PATCH /:id/publish`. |
| `update.use-case.ts` | — | Merge parcial, revalida o período depois do merge (fim antes do começo é `422`) e valida a evidência. **Zera `publishedAt` sempre**: o número que foi ao ar é alegação pública sobre dinheiro, e trocá-lo em silêncio deixaria a página dizendo outra coisa sem registro. Despublicar obriga a passar de novo pela checagem de evidência. |

#### `company/materials/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /company/materials | Matérias-primas do catálogo global, só leitura. `?originType` recorta por origem e `?isNative` separa espécie nativa. `?sort` aceita MATERIAL_SORT_COLUMNS e `?direction` aceita asc ou desc. A empresa lê o catálogo para classificar a origem das peças, e nada além disso. Sem `?trashed`: registro arquivado não existe para quem só escolhe. |
| `paginate.use-case.ts` | — | Matérias-primas vivas, filtros `?originType`, `?isNative`, `?search`. Cópia deliberada do painel (que enxerga a lixeira; esta nunca). |
| `show.controller.ts` | GET /company/materials/:id | Devolve o objeto nu, sem envelope. Registro arquivado não é encontrada aqui. |
| `show.use-case.ts` | — | Matéria-prima viva por id. `404 MATERIAL_NOT_FOUND`. |

#### `company/metrics/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /company/metrics | Os números da própria empresa: receita e volume dos últimos 30 dias com a janela anterior ao lado, a série diária, a fila de cobrança e a quebra de produtos por estado. O escopo é a sessão (RN-11): não há `?companyId` e não teria como haver. Pedido cancelado não entra em soma nenhuma. |
| `show.use-case.ts` | — | `orderMetrics(companyId)` e `productMetrics(companyId)` em `Promise.all`. Devolve `windowDays`, receita, volume, `unpaid` (fila de cobrança), série diária e quebra de produtos por estado. **Mesmas consultas do painel com um `where` a mais** — por isso moram em `_shared.metrics.ts` e não são copiadas. `companyId` vem da sessão; contagens de cliente e empresa **não** entram, porque não são dela. |

#### `company/orders/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `_shared.scope.ts` | — | `resolveCompany(userId)` embrulha `companyOf`. **Perfil ausente é `500`, não `404`**: a rota exige `role(['COMPANY'])`, então quem chega já é empresa autenticada, e perfil faltando é invariante quebrada — não recurso inexistente. Código próprio porque `COMPANY_NOT_FOUND` já significa o `404` de `/administrator/companies`. |
| `paginate.controller.ts` | GET /company/orders | As vendas da empresa da sessão (UC-16). O escopo vem da sessão (RN-16); `?companyId` é aceito pelo schema e ignorado aqui, porque só o painel o usa. `?status` e `?paymentStatus` recortam a fila de separação e a de cobrança. |
| `paginate.use-case.ts` | — | Pedidos com `orders.company_id` da sessão, `customer` precarregado, itens e filtros/ordenação do `OrderService`. `?companyId` é aceito pelo schema e **ignorado** aqui — só o painel o usa. |
| `pay.controller.ts` | PATCH /company/orders/:id/pay | Baixa de pagamento (RN-28). Separado da transição de estado de propósito: um pedido entregue pode estar pago ou não, e amarrar os dois obrigaria a inventar `DELIVERED_UNPAID`. Sem estorno: desfazer uma baixa é operação financeira que o MVP não faz, e pedido já pago responde `409`. `paymentMethod` é texto livre, informado por quem dá a baixa. |
| `pay.use-case.ts` | — | Marca `paymentStatus: PAID` e grava `paidAt`; `paymentMethod` opcional. **Separado da transição de estado**: um pedido entregue pode estar pago ou não, e amarrar os dois obrigaria a inventar `DELIVERED_UNPAID`. **Sem estorno** — o enum só tem `PENDING` e `PAID`; já pago responde `409 ORDER_ALREADY_PAID`. |
| `show.controller.ts` | GET /company/orders/:id | Devolve o pedido com itens e o comprador. Pedido de outra empresa responde `404` (RN-17). |
| `show.use-case.ts` | — | Pedido por id **e** `company_id` da sessão, com `customer` e itens. De outra empresa é `404`. |
| `transition.controller.ts` | PATCH /company/orders/:id/transition | Move o pedido pela máquina de estados (RN-23): confirmar, despachar, entregar, cancelar. Um endpoint para as quatro, e não quatro rotas: o destino é o dado, e quem decide se ele é alcançável de onde o pedido está é `ORDER_TRANSITIONS`. Destino inalcançável responde `422` dizendo de onde para onde não dá. `cancellationReason` é **obrigatório** quando o destino é `CANCELLED` (RN-25): quem cancela em nome de outro registra o motivo. Cancelar devolve o estoque. |
| `transition.use-case.ts` | — | Delega ao `OrderTransitionService.apply({ byCustomer: false })`. **Um endpoint para as quatro transições** (confirmar, despachar, entregar, cancelar): o destino é o dado, e quem decide se é alcançável é `ORDER_TRANSITIONS` — quatro rotas seriam quatro cópias da mesma checagem. |

#### `company/organization/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /company/organization | A organização produtora da **própria** empresa, com comunidade e território precarregados. O recorte vem da sessão (RN-16, RF-13): não há parâmetro de empresa nesta rota, e não poderia haver. Responde `404` quando a empresa ainda não tem organização. Quem a cria é o painel - uma organização auto-provisionada nasceria sem comunidade, sem tipo e sem missão, ou seja, sem nada do que ela existe para carregar. |
| `show.use-case.ts` | — | `organizationOfCompany(userId)` + `community → territory (linhagem)` + `storyBlocks` ordenados. Empresa sem organização cadastrada responde `404`. |
| `update.controller.ts` | PUT /company/organization | Edita a organização da **própria** empresa. Todo campo é opcional: só o que vier no payload muda. `companyId` não existe no payload - vem da sessão (RN-18). E **`stage` também não**: quem formaliza é o painel. Deixar a empresa se declarar formalizada tornaria o estado uma autoatribuição, e ele é justamente o que a mentoria acompanha. `kind` é o que decide o selo de rastreabilidade mais adiante: `INDIVIDUAL` vende e não carimba. |
| `update.use-case.ts` | — | Valida `communityId` (`422` se não existe) e os blocos de história; recalcula o slug a partir de `slug ?? name` só quando muda, com `409` apontando o campo que o cliente mandou. Grava com `saveWithStory`. **`companyId` e `stage` não existem no payload**: o escopo vem da sessão, e quem formaliza a organização é o painel — deixar a empresa mudar o próprio estágio tornaria a curadoria decorativa. |

#### `company/passports/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `_shared.scope.ts` | — | `scopedPassport(companyId, productId)` desce por `products.company_id` — o passaporte não guarda a empresa, e não deve: ele pertence à peça, e a peça à empresa. **Busca por `productId`, não pelo id do passaporte** (a peça é o que a empresa tem em mãos) e já precarrega `qrStorage`, porque toda leitura quer a imagem que vai para a gráfica. |
| `generate.controller.ts` | POST /company/passports/:id | Sorteia o código público da peça e devolve a URL do passaporte (RF-711). `:id` é o **produto**, e não o passaporte: a peça é o que a empresa tem em mãos. Gerar e publicar são separados de propósito: a etiqueta precisa ser impressa antes de a peça estar pronta para o público, que é a ordem real das coisas numa produção artesanal. Publicar é `PATCH /:id/publish`. Idempotente: peça que já tem passaporte devolve o mesmo código. Sortear um segundo invalidaria a etiqueta já impressa. O código não é sequencial e não é o `sku` (RNF-707): sequência deixaria qualquer um contar etiquetas e descobrir o volume do catálogo. |
| `generate.use-case.ts` | — | Confere a peça da empresa, sorteia `generatePublicCode()` (alfabeto sem caracteres ambíguos), gera o PNG do QR pelo `QRCodeService.generate` (que o sobe ao bucket) e cria o passaporte com `publishedAt: null`. **Idempotente**: peça que já tem passaporte devolve o mesmo — sortear um segundo código invalidaria a etiqueta já impressa. Gerar e publicar são separados porque a etiqueta é impressa **antes** de a peça estar pronta, que é a ordem real numa produção artesanal. |
| `paginate.controller.ts` | GET /company/passports | Os passaportes das peças da empresa, com código, URL e contagem de leituras. `?published=true` traz só os que estão no ar. `viewsCount` é quantas vezes o QR foi lido - é o retorno que a organização não tem de outro jeito. |
| `paginate.use-case.ts` | — | Passaportes cujas peças são da empresa (`whereHas('product')`), com `product` e `qrStorage`. `?published=true` filtra os no ar. Traz `viewsCount` — quantas vezes o QR foi lido, o retorno que a organização não tem de outro jeito. |
| `publish.controller.ts` | PATCH /company/passports/:id/publish | Publica o passaporte (§5.3). Três condições: produto `ACTIVE`, empresa aprovada, e nível de rastreabilidade **pelo menos** `TRACED`. O nível é calculado na hora, e não lido de coluna (§5.1): publicar contra um valor gravado deixaria o passaporte no ar dizendo `IMPACT` depois de o projeto ter sido encerrado. Nível insuficiente é `422` dizendo **o que falta** declarar. |
| `publish.use-case.ts` | — | **Três condições, todas cobradas aqui e não no banco**: produto `ACTIVE` (`422 PASSPORT_PRODUCT_INACTIVE`), usuário da empresa `ACTIVE` (`422 PASSPORT_COMPANY_INACTIVE`) e `traceability.levelFor()` **pelo menos `TRACED`** (`422 PASSPORT_LEVEL_TOO_LOW`, com a mensagem dizendo exatamente o que falta declarar). O nível é calculado na hora — não existe coluna `traceability_level`, senão o passaporte ficaria no ar dizendo `IMPACT` depois de o projeto ser encerrado. Idempotente: já publicado devolve sem mover a data. |
| `show.controller.ts` | GET /company/passports/:id | O passaporte com a URL e o `traceabilityLevel` calculado. O nível vem junto porque é a resposta da pergunta que a tela faz: por que o botão de publicar está desabilitado. Sem ele a empresa veria a recusa sem saber o que falta. |
| `show.use-case.ts` | — | `scopedPassport` + **`traceabilityLevel` calculado anexado à resposta** — é a resposta da pergunta que a tela faz: por que o botão de publicar está desabilitado. Sem ele a empresa veria a recusa sem saber o que falta. |
| `unpublish.controller.ts` | PATCH /company/passports/:id/unpublish | Tira o passaporte do ar. **A linha não some e o código continua resolvendo**: a página passa a dizer "informação em revisão". O QR já foi impresso e colado numa peça que está numa feira do outro lado do mundo. Devolver `404` para quem escaneia transformaria uma revisão de cadastro em produto quebrado. Devolve 204. |
| `unpublish.use-case.ts` | — | Zera `publishedAt`. **A linha não some e o código continua resolvendo**: a página pública passa a dizer "informação em revisão". O QR já foi impresso e colado numa peça que está numa feira do outro lado do mundo — devolver `404` transformaria uma revisão de cadastro em produto quebrado. |

#### `company/producers/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `_shared.scope.ts` | — | `scopedProducer(userId, producerId, trashed)` resolve a organização da empresa e recorta por `organizationId`. **`404` e não `403`** — a lista de quem trabalha numa cooperativa não é informação pública. O parâmetro `trashed` existe porque `unarchive` precisa alcançar o arquivado: as duas buscas são o mesmo escopo com o filtro invertido. |
| `archive.controller.ts` | PATCH /company/producers/:id/archive | Vale só para produtor da **própria** organização (RN-16). Produtor de outra responde `404`, indistinguível de inexistente (RN-17). |
| `archive.use-case.ts` | — | Grava `deletedAt`. O produtor some da vitrine e das listagens, e **os produtos que ele fez continuam de pé** — a autoria em `product_producers` não é reescrita, porque quem fez a peça fez. |
| `create.controller.ts` | POST /company/producers | Cadastra um produtor na **própria** organização. `organizationId` não existe no payload: vem da sessão, descendo `empresa → organização` (RN-18). Aceitá-lo deixaria uma empresa cadastrar gente na cooperativa de outra. Nasce **sem** `userId`: é a artesã que não usa computador, e existe na plataforma sem logar nela. Quem se cadastra sozinha entra por `POST /authentication/sign-up/producer`, e é vinculada por `POST /company/producers/link`. `imageConsentAt` é o consentimento de imagem (RNF-704). Sem ele, nome e foto não saem na vitrine. `photoId` inexistente ou ainda `PENDING` responde `422` apontando o campo (RN-39, RN-51). Devolve 201 com o produtor criado, objeto nu e sem envelope. |
| `create.use-case.ts` | — | `organizationOfCompany` dá o `organizationId` (não existe no payload — aceitá-lo deixaria uma empresa cadastrar gente na cooperativa de outra). Valida foto e blocos de história, gera slug por `SlugService.forProducer`, converte `joinedAt` de ISO e resolve o consentimento. Grava com `saveWithStory`. Nasce **sem `userId`**: este é o produtor que não usa computador, cadastrado pela organização. |
| `delete.controller.ts` | DELETE /company/producers/:id | **Irreversível**: apaga a linha do banco. Só aceita produtor já arquivado da própria organização, e recusa com `409` quando ele está vinculado a algum produto - a autoria de uma peça vendida não some. Produtor com conta própria também é recusado: apagá-lo deixaria um usuário sem perfil, e quem apaga conta é o painel. |
| `delete.use-case.ts` | — | Três recusas antes de apagar: **não arquivado** (`409 PRODUCER_NOT_ARCHIVED`), **tem conta própria** (`409 PRODUCER_HAS_USER` — desvincule em vez de apagar) e **está em algum produto** (`409 PRODUCER_HAS_PRODUCTS`, contado direto em `product_producers`): a autoria de uma peça vendida não some. |
| `link.controller.ts` | POST /company/producers/link | Traz para a organização um produtor que **já existe** - quem se auto-cadastrou por `POST /authentication/sign-up/producer` e ainda não pertence a nenhuma. Por e-mail, e não por id: quem se cadastrou sozinho não tem como passar o próprio uuid para a cooperativa, e e-mail é o que as duas pontas já sabem. **O produtor não se vincula sozinho.** Se pudesse, qualquer conta se declararia membro de uma cooperativa e o selo de rastreabilidade viraria autoatribuído - e o selo é a coisa toda. Produtor já vinculado a outra organização responde `409`. E-mail sem produtor responde `422` apontando o campo. |
| `link.use-case.ts` | — | Traz para a organização um produtor que **já existe** — quem se auto-cadastrou e ainda não pertence a nenhuma. **Busca por e-mail, não por id**: quem se cadastrou sozinho não tem como passar o próprio uuid para a cooperativa. Sem produtor com aquele e-mail é `422`; já vinculado a **outra** organização é `409 PRODUCER_ALREADY_LINKED` (revincular à mesma é inócuo). |
| `paginate.controller.ts` | GET /company/producers | Produtores da **própria** organização, com a foto precarregada. O recorte vem da sessão, descendo `empresa → organização` (RN-16, RF-13): não há parâmetro de organização nesta rota, e não poderia haver. `?search` filtra por nome e ofício, `?trashed` alcança os arquivados. `?sort` aceita PRODUCER_SORT_COLUMNS e `?direction` aceita asc ou desc. Empresa sem organização responde `404`. |
| `paginate.use-case.ts` | — | Produtores da própria organização com `photo` e `user`. `?trashed`; `?search` casa `name` OU `craft`. |
| `show.controller.ts` | GET /company/producers/:id | Devolve o objeto nu, sem envelope. Produtor de outra organização responde `404`, indistinguível de inexistente (RN-17). |
| `show.use-case.ts` | — | `scopedProducer` + `photo`, `user`, `storyBlocks` ordenados. |
| `unarchive.controller.ts` | PATCH /company/producers/:id/unarchive | Vale só para produtor da **própria** organização (RN-16). Produtor de outra responde `404`, indistinguível de inexistente (RN-17). |
| `unarchive.use-case.ts` | — | Espelho do `archive`: busca só o arquivado (`'only'`), então produtor vivo é `404` aqui pela mesma razão que o arquivado é `404` lá. |
| `unlink.controller.ts` | DELETE /company/producers/:id/link | Solta o produtor da organização. Ele **não é apagado**: volta a existir sem organização, com o perfil inteiro, e pode ser vinculado por outra. **Os produtos ficam com a empresa.** A autoria em `product_producers` também permanece - quem fez a peça fez, e reescrever isso seria apagar história. O que o produtor perde é o acesso de escrita: sem organização, ele não publica nem edita. |
| `unlink.use-case.ts` | — | Zera `organizationId`. **Só para produtor com conta própria** — sem `userId` é `409 PRODUCER_WITHOUT_USER` ("foi cadastrado pela organização e não tem conta própria; arquive-o"). Ele não é apagado: volta a existir sem organização, com o perfil inteiro, e pode ser vinculado por outra. **Os produtos ficam com a empresa** e a autoria em `product_producers` permanece. |
| `update.controller.ts` | PUT /company/producers/:id | Todo campo é opcional: só o que vier no payload muda. `imageConsentAt: null` é a **revogação** do consentimento (RNF-704): nome e foto saem da vitrine na leitura seguinte, sem rotina nenhuma no meio. Produtor de outra organização responde `404` (RN-17). |
| `update.use-case.ts` | — | Merge parcial escopado, com foto e blocos validados. `joinedAt` de ISO. **`imageConsentAt: null` é a revogação** (`resolveConsent` distingue "não mexer" de "limpar"): nome e foto saem da vitrine na leitura seguinte. |

#### `company/products/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `archive.controller.ts` | PATCH /company/products/:id/archive | Envia para a lixeira: grava `deletedAt`. Não confundir com `status: ARCHIVED`, que é estado de publicação e continua sendo gravado por `PUT /:id`. Produto de outra empresa responde 404, nunca 403. Reversível por `PATCH /:id/unarchive`. |
| `archive.use-case.ts` | — | Grava `deletedAt` no produto da empresa. **Não confundir com `status: ARCHIVED`**, que é estado de publicação e continua sendo gravado por `PUT`. |
| `create.controller.ts` | POST /company/products | Cria um produto da própria empresa (RF-29, RF-30, UC-05). O dono vem sempre da sessão: `companyId` não existe no payload, e qualquer valor enviado seria ignorado por construção (RN-18). Nasce `DRAFT` - só `ACTIVE` aparece na vitrine, então publicar é um passo separado. Preço e preço promocional são **inteiros em centavos** (RN-43). `sku` e `slug` são únicos globais e respondem `409` quando repetidos. Se o conflito for com um produto **arquivado da própria empresa**, o cadastro o reaproveita e o traz de volta com os dados novos. Categoria inexistente, subcategoria que não pertence à categoria principal (RN-38) e arquivo inexistente são `422` apontando o campo, nunca `404` nem `500` (RN-39). A ordem de `imageIds` é a ordem da galeria, e o primeiro é a capa (RF-62). Produto, subcategorias e galeria são gravados numa transação só (RN-44). |
| `create.use-case.ts` | — | O caso de escrita mais completo do módulo. `companyOf` dá o dono (`companyId` não existe no payload). Valida **antes de escrever**: categoria viva (`422`, senão a violação de FK viraria 500), coerência das subcategorias, território, **produtores da própria organização** (autoria apontando para a cooperativa vizinha tornaria o selo inútil), matérias, técnicas, blocos de história e galeria. `sku` e `slug` são únicos globais e a busca **não filtra removidos** — produto apagado logicamente continua ocupando ambos. **Ressuscita**: se o slug bate com um produto arquivado, ele é reativado e passa a pertencer à empresa da sessão, com os dados novos. `sku` de outro dono é `409` antes de tudo. Transação grava produto + subcategorias + selos + produtores + matérias + técnicas + história + variantes + registro on-chain + eventos de rastreabilidade + galeria com `position`. |
| `delete.controller.ts` | DELETE /company/products/:id | **Irreversível**: apaga a linha do banco, e as associações com subcategorias e imagens vão junto por cascata. Só aceita produto já arquivado. Produto de outra empresa responde 404, nunca 403. |
| `delete.use-case.ts` | — | Apaga a linha, escopado. A busca **não filtra `deletedAt`** para distinguir "não existe" de "ainda está vivo" — e o vivo é `409 PRODUCT_NOT_ARCHIVED`. Associações em `product_subcategories` e `product_images` vão por `CASCADE`; os arquivos em `storages` ficam (limpeza de binário está fora de escopo). |
| `paginate.controller.ts` | GET /company/products | Produtos da **própria** empresa, com subcategorias e imagens precarregadas. `?search` filtra por nome e `?trashed` alcança os arquivados. `?sort` aceita PRODUCT_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenados por nome crescente. O recorte vem da sessão (RN-16, UC-06): não há parâmetro de empresa nesta rota, e não poderia haver (RF-13). A empresa não enxerga nem alcança produto de outra (RF-31). |
| `paginate.use-case.ts` | — | Produtos da empresa com 7 preloads. `?trashed` sobre `products.deleted_at` **qualificado**, filtros de catálogo e ordenação de `#core/catalog-query`, `?search` por `products.name`. |
| `show.controller.ts` | GET /company/products/:id | Devolve o objeto nu, sem envelope, com subcategorias e imagens precarregadas - a galeria sai ordenada, e a primeira é a capa (RF-62). Produto de outra empresa responde `404`, nunca `403` (RF-31, RN-17): a API não confirma a existência de dado alheio. Produto arquivado também responde `404`. |
| `show.use-case.ts` | — | Produto da empresa, vivo, com 11 preloads (galeria ordenada por `position` — a primeira é a capa). De outra empresa e removido caem no mesmo `404`. |
| `unarchive.controller.ts` | PATCH /company/products/:id/unarchive | Tira da lixeira: zera `deletedAt`. Só aceita produto arquivado - um produto vivo responde 404, assim como o de outra empresa. O `status` não é tocado, então voltar da lixeira não republica na vitrine. |
| `unarchive.use-case.ts` | — | Busca só o arquivado e zera `deletedAt`. **O `status` não é tocado**: produto arquivado enquanto `DRAFT` volta `DRAFT` e não reaparece na vitrine só por isso. |
| `update.controller.ts` | PUT /company/products/:id | Todo campo é opcional: só o que vier no payload muda. `companyId` não entra - a posse do produto não se transfere por edição (RN-18). `sku` e `slug` são únicos globais e respondem `409` quando repetidos. Categoria inexistente, subcategoria que não pertence à categoria principal (RN-38) e arquivo inexistente são `422` apontando o campo (RN-39). `imageIds` e `subcategoryIds` **substituem** a coleção inteira quando presentes; ausentes, deixam como está. É aqui que o produto é publicado, com `status: ACTIVE` - arquivar para a lixeira é `PATCH /:id/archive`, e as duas coisas não se tocam. Produto de outra empresa responde `404`, nunca `403` (RF-31, RN-17). A escrita roda em transação (RN-44). |
| `update.use-case.ts` | — | Merge parcial com a mesma bateria de validações do `create`. Duas sutilezas: quando **só a categoria muda** (sem `subcategoryIds`), recarrega as subcategorias atuais e **revalida a coerência contra a categoria nova** — senão o produto ficaria com subcategoria de outra categoria; e `syncIds !== null` distingue "não mandou" de "mandou lista vazia". `sku` e `slug` reconferidos só quando mudam. **`companyId` não entra**: a posse não se transfere por edição. |

#### `company/sdgs/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /company/sdgs | Os 17 Objetivos de Desenvolvimento Sustentável da ONU, em ordem de código. Catálogo **fechado**: a lista é da ONU, não da plataforma, e não há escrita em módulo nenhum. Nasce em `database/seeders/sdg_seeder.ts`, que roda em todo ambiente - sem ele a tela de projeto de impacto não teria o que oferecer. |
| `paginate.use-case.ts` | — | Os 17 ODS ordenados por `code`, com `?search` por título. Catálogo **fechado** — a lista é da ONU, e não há escrita em módulo nenhum. |

#### `company/subcategories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /company/subcategories | Catálogo global de subcategorias, **somente leitura**, para a empresa classificar os próprios produtos (RF-27, RN-05). Ordenado por nome, com `?search` por nome - é o que o combobox de subcategoria do formulário de produto consome. Padrão: página 1, 20 por página. Toda subcategoria associada a um produto deve pertencer à categoria principal dele (RN-38), e quem cobra isso é a escrita do produto, não esta listagem. |
| `paginate.use-case.ts` | — | Subcategorias vivas com `?search` e `?categoryId` — é o que o combobox do formulário de produto consome. Use-case próprio por AD-019. |
| `show.controller.ts` | GET /company/subcategories/:id | Devolve o objeto nu, sem envelope. Somente leitura (RF-27). Subcategoria arquivada responde `404`: este módulo não tem lixeira, porque não é dele o catálogo. |
| `show.use-case.ts` | — | Subcategoria viva por id. `404 SUBCATEGORY_NOT_FOUND`. |

#### `company/techniques/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /company/techniques | Técnicas de produção do catálogo global, só leitura. `?search` filtra por nome. `?sort` aceita TECHNIQUE_SORT_COLUMNS e `?direction` aceita asc ou desc. A empresa lê o catálogo para classificar como a peça foi feita, e nada além disso. Sem `?trashed`: registro arquivado não existe para quem só escolhe. |
| `paginate.use-case.ts` | — | Técnicas vivas com `?search`. Cópia deliberada do painel. |
| `show.controller.ts` | GET /company/techniques/:id | Devolve o objeto nu, sem envelope. Registro arquivado não é encontrado aqui. |
| `show.use-case.ts` | — | Técnica viva por id. `404 TECHNIQUE_NOT_FOUND`. |

#### `company/territories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /company/territories | Territórios do catálogo global, só leitura. `?kind` recorta por nível e `?parentId` devolve os filhos diretos - é assim que a árvore é navegada no seletor. `?sort` aceita TERRITORY_SORT_COLUMNS e `?direction` aceita asc ou desc. A empresa lê o catálogo para classificar a origem das peças, e nada além disso. Sem `?trashed`: registro arquivado não existe para quem só escolhe. |
| `paginate.use-case.ts` | — | Territórios vivos com `parent`; `?kind` e `?parentId` navegam a árvore no seletor. |
| `show.controller.ts` | GET /company/territories/:id | Devolve o objeto nu, sem envelope. Registro arquivado não é encontrado aqui. |
| `show.use-case.ts` | — | Território vivo por id, com `parent`. `404 TERRITORY_NOT_FOUND`. |


### `customer/` — área do comprador

Guarda do grupo: `auth()` + `role([CUSTOMER])`. O escopo é a sessão e é o único que existe. As rotas `/customer/addresses` **reaproveitam os controllers de `company/addresses`** — o endereço pertence ao usuário, não à empresa.

#### `customer/orders/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `cancel.controller.ts` | PATCH /customer/orders/:id/cancel | O comprador desiste (RN-24). Só até `CONFIRMED`: depois de despachado o que existe é devolução, que o MVP não tem - a máquina de `ORDER_TRANSITIONS` recusa com `422`. Sem motivo obrigatório: quem compra desiste sem satisfação. A exigência de RN-25 vale para empresa, dono e admin. O estoque volta na mesma transação - um cancelamento que não o devolvesse deixaria a peça fora da vitrine para sempre. |
| `cancel.use-case.ts` | — | Busca o pedido **escopado por `customer_id`** e delega ao `OrderTransitionService.apply({ status: CANCELLED, byCustomer: true })` — quem recusa depois de `SHIPPED` é a máquina `ORDER_TRANSITIONS`, não um `if` aqui. Motivo é opcional: quem compra desiste sem satisfação (a exigência de motivo é para empresa e painel). |
| `checkout.controller.ts` | POST /customer/orders | Fecha o carrinho (RF-48, UC-14). Responde `201` com **um pedido por empresa**: carrinho com peças de duas lojas gera dois pedidos, agrupados pelo mesmo `checkoutId` (R15) - cada empresa separa, despacha e recebe o seu. O payload leva só os itens e o endereço. Preço, nome e SKU são resolvidos no servidor a partir do catálogo vivo e **copiados** para o item (RF-49): aceitar preço do cliente seria aceitar o preço que o cliente quisesse. O endereço é copiado também (RF-50) - o comprador muda de casa, e o pedido de dois anos atrás tem de dizer para onde foi. A visibilidade é revalidada aqui (RN-32): peça arquivada entre abrir a vitrine e fechar o carrinho responde `422`, como estoque insuficiente. A baixa acontece com trava de linha, então duas compras da última unidade não deixam estoque negativo (RN-35). |
| `checkout.use-case.ts` | — | O caso mais denso do sistema. Valida o endereço (do próprio usuário, vivo) e **recusa produto repetido no carrinho** (`422 ORDER_DUPLICATE_PRODUCT` — "some as quantidades"). Abre transação e carrega os produtos por `visibleProducts().forUpdate()` — **revalida a visibilidade no fechamento** (entre abrir a vitrine e fechar o carrinho o vendedor pode ter arquivado a peça) e trava as linhas: sem `forUpdate` duas compras da última unidade leriam `stock = 1` e uma gravaria estoque negativo; o `CHECK` da migration é rede, não mecanismo. Por item confere existência, coerência da variante (`variant.productId === product.id`), **exige variante quando o produto tem variantes vivas** e estoque suficiente — cada um com seu código `422`. Depois **agrupa por `companyId` e cria um pedido por empresa**, todos com o mesmo `checkoutId`: um pedido multi-empresa obrigaria cada vendedor a filtrar os itens que são dele. Preço, nome e SKU são **copiados do catálogo** no instante da compra (variante sobrepõe o preço do produto quando tem o seu) — aceitar preço do payload seria aceitar o preço que o cliente quisesse. Congela a `commissionRate` vigente da empresa e calcula `commissionAmount` em pontos-base. Número via `nextval('order_number_seq')` formatado `PED-000001` — sequence e não `MAX+1`, porque duas compras simultâneas colidiriam no `unique`; buraco na numeração é preferível a número duplicado. Por fim decrementa estoque da variante ou do produto. |
| `paginate.controller.ts` | GET /customer/orders | "Meus pedidos" (UC-15). O escopo é a sessão, sempre (RN-16): não há parâmetro de comprador nesta rota, nem poderia haver. A ordem padrão é `placedAt` **decrescente**, ao contrário das outras listagens: numa lista de compras o que interessa é a última. `?search` filtra por número do pedido, que é o que se dita ao telefone. |
| `paginate.use-case.ts` | — | "Meus pedidos": `where('orders.customer_id', userId)` e nada de parâmetro de comprador — o escopo é a sessão e não poderia ser outro. Reusa `OrderService.withItems/applyFilters/orderBy`. Padrão `placedAt` decrescente: numa lista de compras o que interessa é a última. |
| `show.controller.ts` | GET /customer/orders/:id | Devolve o pedido nu, com itens e a loja. Pedido de outro comprador responde `404`, e não `403` (RN-17): fora do escopo é indistinguível de inexistente. |
| `show.use-case.ts` | — | Pedido por id **e** `customer_id` da sessão, com `company` e itens (`OrderService.withItems`). Pedido de outro comprador cai no mesmo `404 ORDER_NOT_FOUND` de inexistente. |

#### `customer/reviews/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `create.controller.ts` | ⚠️ _sem rota registrada_ | Avalia um produto comprado (R16). Só passa quem tem o produto num pedido próprio já `DELIVERED`: sem essa regra a avaliação vira caixa de recado aberta, e a nota deixa de significar experiência de compra. Quem não recebeu leva `422` apontando `productId`. Uma avaliação por produto por comprador: a segunda responde `409`. Para mudar de ideia, use o `PUT`. O autor é sempre a sessão (RN-11): não existe `customerId` no payload. |
| `create.use-case.ts` | — | **Só quem recebeu avalia**: procura o produto em `order_items` de um pedido `DELIVERED` do próprio comprador (`whereHas('order')`); sem isso é `422 REVIEW_NOT_PURCHASED`. `DELIVERED` e não `CONFIRMED` — quem não recebeu não tem o que avaliar. Depois recusa avaliação viva já existente com `409 REVIEW_ALREADY_EXISTS` (o `UNIQUE` da migration é a rede; o `409` evita que a violação de índice vire 500). ⚠️ **Sem rota registrada.** |
| `delete.controller.ts` | ⚠️ _sem rota registrada_ | Apaga a própria avaliação. A remoção é lógica: a nota sai da média e da vitrine na hora, e a linha continua existindo para o painel enxergar que houve uma avaliação ali. Depois disto o comprador pode avaliar o mesmo produto de novo. |
| `delete.use-case.ts` | — | Remoção **lógica** (`deletedAt = now`) escopada pelo comprador: a nota sai da média e da vitrine na hora, e a linha continua existindo para o painel enxergar que houve uma avaliação ali. Depois disso o comprador pode avaliar de novo — o `create` só olha as vivas. ⚠️ **Sem rota registrada.** |
| `paginate.controller.ts` | ⚠️ _sem rota registrada_ | As avaliações que o próprio comprador escreveu, com o produto precarregado. O escopo é a sessão e é o único que existe (RN-16). |
| `paginate.use-case.ts` | — | "Minhas avaliações": `customerId` da sessão, só as vivas, com o `product` precarregado. Filtros opcionais `?productId` e `?rating`. ⚠️ **Sem rota registrada.** |
| `update.controller.ts` | ⚠️ _sem rota registrada_ | Corrige a própria avaliação. Avaliação de outro responde `404`, não `403` (RN-17). `productId` não é editável: trocá-lo seria escrever outra avaliação, e a que existia sumiria sem rastro. |
| `update.use-case.ts` | — | Merge parcial escopado por `customerId` — avaliação de outro é `404`, não `403`. **`productId` não entra**: mudar o produto seria escrever outra avaliação, e a que existia sumiria sem rastro. ⚠️ **Sem rota registrada.** |


### `lookup/` — consultas externas

BrasilAPI, **sem autenticação**: quem consulta está preenchendo o cadastro público e ainda não tem sessão. Nada grava. Origem fora do ar responde `503`, e não `404`.

| Arquivo | Rota | O que faz |
|---|---|---|
| `cep.controller.ts` | GET /lookup/cep/:cep | Endereço de um CEP, pela BrasilAPI. **Sem autenticação** - quem consulta está preenchendo o cadastro público, e ainda não tem sessão. A máscara é opcional: `01001-000` e `01001000` são a mesma consulta. Os campos saem com os nomes do payload de endereço (`logradouro`, `neighborhood`, `city`, `uf`), então a tela preenche o formulário sem traduzir nada. Número e complemento não vêm - são do imóvel, não do CEP. CEP inexistente responde `404`, e o formulário segue com os campos em branco. Origem fora do ar responde `503`, que é outra coisa: vale tentar de novo. |
| `cep.use-case.ts` | — | Delega ao `BrasilAPIService.cep`. **Não toca no banco.** As duas falhas são deliberadamente diferentes: CEP inexistente é `404` (a tela segue com campos em branco), origem fora do ar é `503 LOOKUP_UNAVAILABLE` (a tela oferece tentar de novo) — dizer "CEP não encontrado" quando o problema é a rede mandaria a pessoa conferir um CEP que está certo. |
| `cnpj.controller.ts` | GET /lookup/cnpj/:cnpj | Dados públicos de uma empresa, pela BrasilAPI. **Sem autenticação**, pela mesma razão do CEP: o cadastro de empresa acontece antes de existir sessão. Devolve razão social, nome fantasia, e-mail, telefone e situação cadastral, mais o endereço **fiscal** aninhado na forma do payload de endereço - uma consulta preenche os dois passos do formulário. É consulta e nada mais: não cria empresa, não verifica se o CNPJ já está cadastrado (quem responde isso é o sign-up, com `409`) e não recusa empresa por `situation` diferente de `ATIVA` - o campo vai na resposta, a decisão é de quem cadastra. O CNPJ alfanumérico em vigor desde julho/2026 é aceito pelo validator, mas a base consultada ainda só conhece o numérico: com letra, a resposta é `404`, e o cadastro segue com os campos digitados à mão. |
| `cnpj.use-case.ts` | — | Delega ao `BrasilAPIService.cnpj`. Consulta e nada mais: **não** cria empresa, não confere se o CNPJ já está cadastrado e não recusa situação cadastral irregular — quem decide isso é o sign-up. `404` para CNPJ desconhecido, `503` para origem fora do ar. |


### `producer/` — painel do artesão

Guarda do grupo: `auth()` + `role([PRODUCER])`. **O produtor não é dono do produto — a empresa é.** O recorte é pela autoria na pivô `product_producers`; `products.company_id` continua sendo o dono fiscal. Não há `DELETE` de produto neste módulo: apagar é do dono.

#### `producer/categories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /producer/categories | Catálogo global de categorias, **somente leitura**, para o produtor classificar as próprios produtos (RF-27, RN-05). `?search` filtra por nome, `?sort` aceita CATALOG_SORT_COLUMNS e `?direction` aceita asc ou desc. Padrão: página 1, 20 por página, ordenado por nome crescente. Não há filtro por empresa: categoria é global e não pertence a ninguém (RF-25). Criar, editar e remover são do painel - este módulo só lê, e por isso `POST`, `PUT` e `DELETE` não existem aqui. |
| `paginate.use-case.ts` | — | Catálogo global, só vivas, com `?status` e `?search`. **Use-case próprio e não import do painel (AD-019)**: os módulos não se referenciam, então um filtro administrativo novo lá não muda a visão do produtor por acidente. Sem filtro por empresa — categoria é global e não pertence a ninguém. |
| `show.controller.ts` | GET /producer/categories/:id | Devolve o objeto nu, sem envelope. Somente leitura (RF-27). Categoria arquivada responde `404`: este módulo não tem lixeira, porque não é dele o catálogo. |
| `show.use-case.ts` | — | Categoria viva por id. Arquivada é `404` — este módulo não tem lixeira, porque não é dele o catálogo. |

#### `producer/communities/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /producer/communities | Comunidades do catálogo global, só leitura, com o território precarregado. `?territoryId` recorta por território. `?sort` aceita COMMUNITY_SORT_COLUMNS e `?direction` aceita asc ou desc. O produtor lê o catálogo para classificar a origem das peças, e nada além disso. Sem `?trashed`: registro arquivado não existe para quem só escolhe. |
| `paginate.use-case.ts` | — | Comunidades vivas com `territory` em linhagem, filtros `?territoryId` e `?search`. Cópia deliberada do painel: lá a listagem enxerga a lixeira, aqui nunca — amarrar os dois faria uma mudança lá vazar para cá. |
| `show.controller.ts` | GET /producer/communities/:id | Devolve o objeto nu, sem envelope. Registro arquivado não é encontrada aqui. |
| `show.use-case.ts` | — | Comunidade viva por id, com `territory` em linhagem. `404 COMMUNITY_NOT_FOUND`. |

#### `producer/materials/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /producer/materials | Matérias-primas do catálogo global, só leitura. `?originType` recorta por origem e `?isNative` separa espécie nativa. `?sort` aceita MATERIAL_SORT_COLUMNS e `?direction` aceita asc ou desc. O produtor lê o catálogo para classificar a origem das peças, e nada além disso. Sem `?trashed`: registro arquivado não existe para quem só escolhe. |
| `paginate.use-case.ts` | — | Matérias-primas vivas, filtros `?originType`, `?isNative` e `?search`. Mesma duplicação deliberada do painel. |
| `show.controller.ts` | GET /producer/materials/:id | Devolve o objeto nu, sem envelope. Registro arquivado não é encontrada aqui. |
| `show.use-case.ts` | — | Matéria-prima viva por id. `404 MATERIAL_NOT_FOUND`. |

#### `producer/organization/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /producer/organization | A organização a que o produtor da sessão pertence, **só leitura**, com comunidade e território precarregados. Quem edita a organização é a empresa dela, por `PUT /company/organization`, ou o painel. O produtor a lê para saber onde está, e não para mudá-la. Responde `404` quando ele ainda não foi vinculado a nenhuma - que é o estado em que toda conta de produtor nasce. |
| `show.use-case.ts` | — | Resolve `producerOf(userId)` e, se ele **não tem `organizationId`**, responde `404` — é o estado normal de quem se auto-cadastrou e ainda não foi vinculado. Com vínculo, carrega a organização com `community → territory (linhagem)` e `company`. Só leitura: quem edita é a empresa ou o painel. |

#### `producer/products/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `_shared.scope.ts` | — | `ownedByProducer(query, producerId)` aplica `whereHas('producers')` — **filtro por autoria na pivô, não por coluna de posse**: uma peça tem várias mãos, e "meus produtos" para uma artesã quer dizer "as peças em que eu trabalhei", não uma afirmação de propriedade que ela não tem. `scopedProduct(producerId, productId, trashed)` devolve `Either` com `404` — peça de outra artesã da **mesma cooperativa** é dado alheio e responde inexistente. |
| `archive.controller.ts` | PATCH /producer/products/:id/archive | Vale só para peça em que o produtor da sessão consta como autor. Peça de outra pessoa responde `404`, inclusive dentro da própria cooperativa (RN-17). Não há `DELETE` neste módulo: apagar produto é do dono, e o dono é a empresa. |
| `archive.use-case.ts` | — | `producerOf` → `scopedProduct` → grava `deletedAt`. Tira a peça da vitrine. A empresa continua enxergando a peça no painel dela: a lixeira é do catálogo, não do autor. |
| `create.controller.ts` | POST /producer/products | O produtor publica uma peça dentro da organização dele. `companyId` não existe no payload: é derivado de `sessão → produtor → organização → empresa` (RN-18). O dono fiscal da peça continua sendo a empresa; o produtor é quem a fez, e nasce já vinculado em `product_producers`. **Produtor sem organização responde `422`**, e não `403`: não é falta de permissão, é falta de vínculo, e o caminho para resolver é a cooperativa vinculá-lo. Organização ainda em formação, sem empresa, responde `422` pelo mesmo motivo. `producers` não entra no payload - escolher quem mais fez a peça é atribuição de autoria alheia, e quem monta a equipe é a organização, pelo módulo dela. O produto nasce `DRAFT`. Preço e preço promocional são inteiros em centavos (RN-43). |
| `create.use-case.ts` | — | Desce `sessão → produtor → organização → empresa` (`producerOf` + `companyOfProducer`) e grava `companyId` **da empresa da organização** — o dono fiscal continua sendo ela. Valida categoria, coerência de subcategorias, território, matérias, técnicas, blocos de história e galeria **antes** de escrever. `sku`/`slug` únicos globais respondem `409`. Na transação: cria o produto, sincroniza subcategorias, selos, variantes, matérias, técnicas, história e galeria, e **vincula o próprio produtor como autor** (`producers.sync({ [id]: { role: null } })`). Diferente do `company/products/create`: **não ressuscita produto arquivado** e não aceita `producers`, `onchain` nem `traceability`. |
| `paginate.controller.ts` | GET /producer/products | As peças em que o produtor da sessão consta como autor. **Não é "os produtos dele"**: o dono da peça continua sendo a empresa da organização. O recorte é pela autoria em `product_producers`, e é o que "meus produtos" quer dizer para quem faz - as peças em que trabalhou, não as que lhe pertencem. O recorte vem da sessão (RN-16, RF-13). Peça da mesma cooperativa em que ele não consta responde `404` no detalhe, indistinguível de inexistente (RN-17). `?sort` aceita PRODUCT_SORT_COLUMNS e `?direction` aceita asc ou desc. |
| `paginate.use-case.ts` | — | Lista com 10 preloads, recortada por `ownedByProducer` (autoria na pivô). Suporta `?trashed` sobre `products.deleted_at` **qualificado** (o join com produtores torna a coluna ambígua sem o prefixo), filtros de catálogo e ordenação de `#core/catalog-query`. |
| `show.controller.ts` | GET /producer/products/:id | Devolve o objeto nu, sem envelope. Peça em que o produtor da sessão não consta como autor responde `404`, indistinguível de inexistente - vale inclusive para as peças da própria cooperativa feitas por outra pessoa (RN-17). |
| `show.use-case.ts` | — | `scopedProduct` e depois 10 `load()` sequenciais (subcategorias, selos, variantes vivas ordenadas, galeria por posição, categoria, território, produtores, matérias, técnicas, história). Peça de outra pessoa é `404`. |
| `unarchive.controller.ts` | PATCH /producer/products/:id/unarchive | Vale só para peça em que o produtor da sessão consta como autor. Peça de outra pessoa responde `404`, inclusive dentro da própria cooperativa (RN-17). Não há `DELETE` neste módulo: apagar produto é do dono, e o dono é a empresa. |
| `unarchive.use-case.ts` | — | Espelho do `archive`: busca **só o arquivado** (`scopedProduct(..., 'only')`), então peça viva é `404` aqui pela mesma razão que a arquivada é `404` nas leituras. Zera `deletedAt` e **não toca no `status`** — restaurar não republica na vitrine. |
| `update.controller.ts` | PUT /producer/products/:id | Edita uma peça em que o produtor da sessão consta como autor. Todo campo é opcional. `companyId` não muda: a posse do produto não se transfere por edição, e o produtor nunca foi o dono - ele é o autor. Peça em que ele não consta responde `404`, inclusive dentro da própria cooperativa (RN-17). |
| `update.use-case.ts` | — | Merge parcial sobre `scopedProduct`. Revalida categoria (quando muda), coerência de subcategorias contra a categoria **efetiva** (`rest.categoryId ?? product.categoryId`), território, matérias, técnicas, história e galeria. Slug só é reconferido se `name` ou `slug` vieram e o normalizado mudou; `sku` é conferido contra os outros registros. Transação sincroniza tudo. **`companyId` não muda**: a posse não se transfere por edição, e o produtor nunca foi o dono — ele é o autor. |

#### `producer/profile/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /producer/profile | O **próprio** registro de produtor, com foto e organização precarregadas. O recorte vem da sessão (RN-16, RF-13): não há parâmetro de produtor nesta rota, e não poderia haver. `organization` nula é quem ainda não foi vinculado a nenhuma cooperativa - existe, tem perfil, e não publica produto. |
| `show.use-case.ts` | — | `producerOf(userId)` + `photo`, `storyBlocks` ordenados e `organization → community → territory (linhagem)`. `organization` nula é quem ainda não foi vinculado. |
| `update.controller.ts` | PUT /producer/profile | Edita o **próprio** perfil de produtor. Todo campo é opcional: só o que vier no payload muda. **Sem `organizationId`**: o produtor não se vincula sozinho a uma cooperativa. Se pudesse, qualquer conta se declararia membro de uma e o selo de rastreabilidade viraria autoatribuído. Quem vincula é a organização, ou o painel. `imageConsentAt` é o consentimento de imagem, e é **dele** a decisão (RNF-704): preencher publica nome e foto na vitrine, e mandar `null` revoga - a despublicação vale na leitura seguinte, sem rotina nenhuma no meio. |
| `update.use-case.ts` | — | Merge parcial no próprio registro. Valida a foto (`assertPhoto`) e os blocos de história. `joinedAt` chega como ISO e vira `DateTime`. **`imageConsentAt` passa por `resolveConsent`**: `null` explícito é a **revogação** (RNF-704) — nome e foto saem da vitrine na leitura seguinte, sem rotina no meio. Grava com `saveWithStory`. **Sem `organizationId`**: o produtor não se vincula sozinho a uma cooperativa; se pudesse, qualquer conta se declararia membro e o selo de origem não valeria nada. |

#### `producer/subcategories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /producer/subcategories | Catálogo global de subcategorias, **somente leitura**, para o produtor classificar as próprios produtos (RF-27, RN-05). Ordenado por nome, com `?search` por nome - é o que o combobox de subcategoria do formulário de produto consome. Padrão: página 1, 20 por página. Toda subcategoria associada a um produto deve pertencer à categoria principal dele (RN-38), e quem cobra isso é a escrita do produto, não esta listagem. |
| `paginate.use-case.ts` | — | Subcategorias vivas com `?search` e `?categoryId` — é o que o combobox do formulário de produto consome. Use-case próprio por AD-019. |
| `show.controller.ts` | GET /producer/subcategories/:id | Devolve o objeto nu, sem envelope. Somente leitura (RF-27). Subcategoria arquivada responde `404`: este módulo não tem lixeira, porque não é dele o catálogo. |
| `show.use-case.ts` | — | Subcategoria viva por id. `404 SUBCATEGORY_NOT_FOUND`. |

#### `producer/techniques/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /producer/techniques | Técnicas de produção do catálogo global, só leitura. `?search` filtra por nome. `?sort` aceita TECHNIQUE_SORT_COLUMNS e `?direction` aceita asc ou desc. O produtor lê o catálogo para classificar como a peça foi feita, e nada além disso. Sem `?trashed`: registro arquivado não existe para quem só escolhe. |
| `paginate.use-case.ts` | — | Técnicas vivas com `?search`. Cópia deliberada do painel. |
| `show.controller.ts` | GET /producer/techniques/:id | Devolve o objeto nu, sem envelope. Registro arquivado não é encontrado aqui. |
| `show.use-case.ts` | — | Técnica viva por id. `404 TECHNIQUE_NOT_FOUND`. |

#### `producer/territories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /producer/territories | Territórios do catálogo global, só leitura. `?kind` recorta por nível e `?parentId` devolve os filhos diretos - é assim que a árvore é navegada no seletor. `?sort` aceita TERRITORY_SORT_COLUMNS e `?direction` aceita asc ou desc. O produtor lê o catálogo para classificar a origem das peças, e nada além disso. Sem `?trashed`: registro arquivado não existe para quem só escolhe. |
| `paginate.use-case.ts` | — | Territórios vivos com `parent` precarregado; filtros `?kind` e `?parentId` — é assim que a árvore BIOME > REGION > MUNICIPALITY é navegada no seletor. |
| `show.controller.ts` | GET /producer/territories/:id | Devolve o objeto nu, sem envelope. Registro arquivado não é encontrado aqui. |
| `show.use-case.ts` | — | Território vivo por id, com `parent`. `404 TERRITORY_NOT_FOUND`. |


### `storages/` — upload multipart presigned

O binário **não passa pela aplicação**. `POST` abre o upload e devolve URLs assinadas; o navegador sobe as partes direto no bucket; `complete` confirma e a linha vira `UPLOADED`; `GET :id/parts` serve à retomada e ao próximo lote de URLs. O registro nasce **sem dono** — quem anexa é que guarda a referência —, e por isso o `DELETE` só alcança arquivo órfão. `GET :id/download` fica fora do grupo autenticado: o bucket é público, e trancar só ali seria trancar a porta da frente com a dos fundos aberta.

| Arquivo | Rota | O que faz |
|---|---|---|
| `complete.controller.ts` | POST /storages/:id/complete | Fecha o upload aberto por `POST /storages`: o bucket remonta as partes e a linha passa a `UPLOADED`, que é o único estado que pode ser anexado a alguma coisa. O corpo traz o `ETag` que cada `PUT` de parte devolveu - é assim que o storage confere que nenhuma parte se perdeu ou chegou pela metade. Upload de parte única não tem parte para confirmar, e `parts` vem ausente. É aqui que o tamanho **declarado** no `POST /storages` é comparado com o do objeto que de fato subiu. Divergiu, o objeto é apagado, a linha morre junto e a resposta é `422` (RN-47). O `mimetype` não é conferido porque não tem como divergir: ele entra na assinatura da URL, e o bucket recusa um `PUT` que não bata com ela. Chamar duas vezes é seguro: a segunda devolve o mesmo registro. |
| `complete.use-case.ts` | — | Remonta as partes (`MultipartService.complete` com os `ETag` recebidos) e **confere o declarado contra o real**: se `metadata.contentLength` diverge de `storage.size`, apaga binário e linha e responde `422 STORAGE_SIZE_MISMATCH` com os dois números na mensagem. O `mimetype` não é conferido — ele entra na assinatura da URL, e o bucket já recusa `PUT` divergente. **Idempotente**: já `UPLOADED` devolve o mesmo registro. Ao final grava `status: UPLOADED` e zera `uploadId`. |
| `create.controller.ts` | POST /storages | Abre um upload e devolve por onde subi-lo. **Não recebe bytes** - só os metadados do arquivo (RF-59). O binário vai do navegador direto ao bucket, por URL assinada, e nunca atravessa esta aplicação: um arquivo grande num corpo HTTP esbarra no limite do proxy, ocupa a aplicação pelo tempo do upload, e não tem como ser retomado quando a conexão cai. Aceita STORAGE_MIMETYPES, até UPLOAD_MAX_SIZE bytes, recusados **antes** de qualquer assinatura (RN-47): arquivo proibido não ganha URL, então não chega ao bucket. Que o tamanho declarado seja verdade é o que `POST /storages/:id/complete` confere, contra o objeto real. O arquivo é fatiado em partes de PART_SIZE bytes. Quando cabe numa parte só, `uploadId` vem nulo e a única URL aceita um `PUT` com o arquivo inteiro. Quando não cabe, cada URL aceita a sua parte, o cliente guarda o `ETag` que cada `PUT` devolve, e `parts` pode trazer só o primeiro lote - o resto sai em `GET /storages/:id/parts`, que é o mesmo endpoint da retomada. A linha nasce `PENDING` e não pode ser anexada a nada até ser confirmada. O arquivo nasce sem dono: quem anexa guarda a referência (RF-60), informando o `id` em `avatarId`, `logoId` ou `imageIds`. |
| `create.use-case.ts` | — | Gera a chave (`StorageService.key`), calcula `countParts(size, PART_SIZE)` e bifurca: **uma parte** → `signSingle`, `uploadId` nulo, `PUT` direto (cerimônia de multipart para um avatar de 40 KB seria inútil); **mais de uma** → `initiate` + `signParts` do primeiro lote. Grava a linha `PENDING` **sem dono** (RF-60) e devolve o envelope `StorageUpload` (`storage`, `uploadId`, `partSize`, `totalParts`, `parts`, `uploaded: []`). Em erro, aborta o multipart em silêncio para não encobrir a falha original. |
| `delete.controller.ts` | DELETE /storages/:id | **Irreversível**: apaga o binário no disco e a linha em `storages`. Só apaga arquivo **órfão**. O arquivo é um registro neutro e compartilhado - ele não pertence ao formulário que o enviou (RF-60) -, então quem o referencia é quem manda: avatar de usuário, logotipo de empresa ou galeria de produto em uso respondem `409`, com a origem na mensagem. Desvincule primeiro, apague depois. É o par do `POST /storages`, que grava o arquivo antes de o formulário ser salvo: sem esta rota, todo anexo escolhido e removido da tela ficaria em disco para sempre. |
| `delete.use-case.ts` | — | Dois caminhos. **`PENDING`** = cancelar: aborta o multipart (sem o aborto as partes ficam penduradas, invisíveis na listagem e cobradas) ou descarta o objeto de parte única, e apaga a linha. **`UPLOADED`**: consulta `StorageService.references(id)` e, se alguém aponta para o arquivo, responde `409 STORAGE_IN_USE` **dizendo onde**. A posse não autoriza — o registro é neutro e compartilhado, e quem conhecesse um uuid furaria a imagem de um produto alheio. |
| `download.controller.ts` | GET /storages/:id/download | Redireciona para uma URL temporária do bucket que entrega o arquivo com `Content-Disposition: attachment` e o nome original. Existe por uma limitação do navegador, não do storage: o atributo `download` de um `<a>` é ignorado entre origens, e a API responde numa origem diferente da do app. Sem esta rota, "salvar arquivo" abriria a imagem numa aba, e o arquivo chegaria nomeado com o uuid em vez do nome que a pessoa enviou. Redireciona em vez de servir o binário: o header viaja assinado dentro da URL, então a aplicação entrega um endereço e sai do caminho, em vez de ficar ocupada pelo tempo da transferência de cada download. **Pública**: o bucket é `visibility: public` e o mesmo binário já sai sem sessão pela `url` derivada. Exigir autenticação aqui protegeria a porta da frente deixando a dos fundos aberta.', responses: { 302: 'no-content' } |
| `download.use-case.ts` | — | Abre por `id` (não por `path`, porque o nome original mora na linha) e devolve a **URL assinada** de `StorageService.signedDownload` — o `Content-Disposition` com o nome original viaja assinado dentro dela. A aplicação entrega um endereço e sai do caminho, em vez de ficar ocupada pelo tempo de cada transferência. |
| `parts.controller.ts` | GET /storages/:id/parts | De onde continuar: em `uploaded`, o que o bucket já recebeu; em `parts`, URL nova para o que falta. Serve a dois casos que são o mesmo problema. **Retomada**: a conexão caiu na parte 900 de mil, e sem isto a única saída seria recomeçar do zero. **Próximo lote**: as URLs saem em lotes, porque assinar mil de uma vez seria meio megabyte de JSON antes do primeiro byte subir. Assinar de novo é o ponto, e não um efeito colateral: URL assinada expira, e um upload que durou mais que a validade encontra aqui um endereço novo para a mesma parte. Arquivo já confirmado responde `200` com as duas listas vazias - quem pergunta é um cliente retomando, e ler o `status` e parar é o desfecho certo. |
| `parts.use-case.ts` | — | Descobre o que o bucket já tem (`listParts` no multipart; no parte-única, a existência do próprio objeto responde a mesma pergunta) e **reassina** URL nova só para o que falta — reassinar é o ponto, não efeito colateral: URL assinada expira, e um upload longo encontra aqui endereço novo para a mesma parte. Já `UPLOADED` devolve o envelope vazio. Mesma forma de resposta do `create` de propósito: começar e retomar são a mesma pergunta. |


### `storefront/` — vitrine pública

Única superfície sem sessão além de sign-in/sign-up, e **somente leitura** (com uma exceção: o passaporte incrementa a contagem de leituras). Não tem middleware nenhum de propósito: quem limita o que sai é `StorefrontVisibilityService` (RN-20), não a autenticação. Toda resposta passa por `StorefrontShapeService`, que corta campo privado. Listagens de filtro (categorias, selos, territórios, técnicas) só devolvem o que tem ao menos um produto visível — filtro que devolve lista vazia não é filtro.

#### `storefront/categories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/categories | O catálogo que monta a navegação da vitrine (RF-38): categorias com as subcategorias aninhadas, e só as que têm ao menos um produto visível. Os `slug` devolvidos aqui são os que `GET /storefront/products` aceita em `categorySlug` e `subcategorySlug`. |
| `paginate.use-case.ts` | — | Categorias `ACTIVE` que aparecem em `visibleProducts()`, com `withCount('products')` restrito aos visíveis e `subcategories` aninhadas — estas filtradas por uma subconsulta em `product_subcategories`. **Corta nos dois níveis**: categoria cujo único produto foi arquivado sai da navegação, e subcategoria vazia não vira filtro que devolve nada. Serializa só `id, name, slug, description, icon, productsCount` + `id, name, slug` da subcategoria. 20/página. |

#### `storefront/certifications/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/certifications | Os selos que a vitrine oferece como filtro (R17), sem autenticação. Só os que têm ao menos um produto visível, pela mesma razão de RF-38 nas categorias: filtro que devolve lista vazia não é filtro, é armadilha. Sai o nome e o emissor; a descrição fica no painel, que é onde o catálogo é escrito. |
| `paginate.use-case.ts` | — | Selos `ACTIVE` com `whereHas('products')` restrito a `visibleProducts()`. Serializa `id, name, slug, issuer, description`. **50 por página** (é lista de filtro, não navegação). A condição de visibilidade não é reescrita — sai do service. |

#### `storefront/communities/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/communities | As comunidades do marketplace. Só as que chegam a uma peça visível por `organizations → companies → products` - comunidade com cooperativa que ainda não vende nada é cadastro, e a página abriria com história e grade vazia. `?search` filtra por nome e `?territorySlug` recorta pelo território. |
| `paginate.use-case.ts` | — | Parte de `visibleCommunities()` (que sobe `organizations → companies → products`), precarrega `territory` com `withLineage` (linhagem até o bioma). Filtros `?search` por nome e `?territorySlug`. Passa por `StorefrontShapeService.communities()` antes de sair. |
| `show.controller.ts` | GET /storefront/communities/:slug | A página de uma comunidade, pelo `slug`. Dá endereço ao que a ficha da peça só cita: o território até o bioma, a história que a comunidade escreveu, e o ponto no mapa quando ela declarou um. As peças vêm de `GET /storefront/products?communitySlug=` e os artesãos de `GET /storefront/producers?communitySlug=`. |
| `show.use-case.ts` | — | Comunidade por `slug` dentro de `visibleCommunities()`, com `territory` em linhagem e `storyBlocks` ordenados por `position`. **Não devolve as peças** — vêm de `?communitySlug=` na listagem de produtos, e os artesãos de `?communitySlug=` na de produtores: paginação aninhada seria segunda implementação da mesma consulta. `404 COMMUNITY_NOT_FOUND`. |

#### `storefront/companies/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/companies | As lojas do marketplace, sem autenticação (RF-37). Uma empresa só aparece com ao menos um produto visível - empresa aprovada e sem produto existe no painel e não aqui. O recurso é reduzido de propósito: nunca cnpj, anotações internas, e-mail ou telefone (RF-39). |
| `paginate.use-case.ts` | — | `visibleCompanies()` + `logo`. Busca casa **`tradeName` OU `legalName`** — o par que a vitrine exibe. Ordena por `legalName`. Reduzido pelo `StorefrontShapeService.companies()`: nunca CNPJ nem anotações internas. |
| `show.controller.ts` | GET /storefront/companies/:slug | A página de uma loja, pelo `slug`. Os produtos dela vêm de `GET /storefront/products?companySlug=`: uma paginação aninhada aqui seria uma segunda implementação da mesma consulta, e a regra de visibilidade vive num lugar só (RN-20). |
| `show.use-case.ts` | — | Loja por `slug`, com `logo` e a cadeia `organization → community → territory (linhagem)`. Devolve **só a loja**; os produtos vêm de `?companySlug=`. Inexistente, suspensa ou sem produto visível respondem o mesmo `404` (RN-21). |

#### `storefront/organizations/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /storefront/organizations/:slug | A página de uma organização, pelo `slug`. Dá endereço ao que a ficha da peça só citava: a missão, quantas pessoas reúne, a comunidade e o território atrás dela, a história em blocos e quem trabalha ali. Só organizações com empresa visível abrem: sem empresa é a organização **em formação**, que existe no painel e não tem loja. Os artesãos vêm aninhados - é relação direta -, e só quem consentiu com a imagem (RNF-704). As peças vêm de `GET /storefront/products?companySlug=`. |
| `show.use-case.ts` | — | Organização por `slug` em `visibleOrganizations()`, com `community → territory`, `company.logo`, `storyBlocks` ordenados e **`producers` aninhados** (a exceção da regra: `producers` é relação direta da organização, então não precisa de rota separada). As peças continuam vindo de `?companySlug=`. |

#### `storefront/passports/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /storefront/passports/:publicCode | O destino do QR impresso na etiqueta (RF-712, UC-709). **Sem autenticação.** Devolve a peça inteira com território, matérias-primas, quem fez (só quem consentiu, RNF-704), a cadeia de custódia com evidência, e para onde vai o valor - projetos ativos com os ODS de cada um. `state` é o estado da **página**, não do registro. Código desconhecido responde `404`; código conhecido e despublicado responde `200` com `UNDER_REVIEW`. É a diferença entre uma etiqueta que nunca existiu e uma que está em revisão - e a segunda já foi impressa e colada numa peça que está numa feira (§5.3). Cada leitura incrementa `views_count` (RF-713). É a única escrita pública do sistema, e ela não segura a resposta: a página é lida com sinal ruim, e RNF-701 pede menos de 500 ms. |
| `show.use-case.ts` | — | O destino do QR impresso. Busca por `upper(public_code)` — o código é digitado de etiqueta, e a caixa não pode importar. **Única superfície pública que escreve**: `countRead()` faz `increment('views_count', 1)` (UPDATE atômico, não ler-somar-gravar) chamado com `void`, sem `await` no caminho da resposta, e com o erro engolido — RNF-701 pede menos de 500 ms e contar não pode atrasar quem escaneou. **Três estados**: código desconhecido → `404`; conhecido e despublicado (ou produto invisível) → `200` com `state: UNDER_REVIEW`; publicado → `200 PUBLISHED` com o produto inteiro (14 preloads: origem, autoria, matérias, técnicas, cadeia de custódia com evidência, on-chain, história), `traceabilityLevel` calculado, `rating` e `impact`. |

#### `storefront/producers/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/producers | Os artesãos do marketplace. Só quem **consentiu** com a imagem (RNF-704) e tem ao menos uma peça visível - artesão cadastrado e sem peça no ar existe no painel e não aqui, pela mesma regra que rege a listagem de lojas (RF-37). `?search` filtra por nome; `?organizationSlug`, `?communitySlug` e `?territorySlug` recortam pela procedência. Nunca devolve conta, contato nem a data do consentimento. |
| `paginate.use-case.ts` | — | `visibleProducers()` (consentimento de imagem + ao menos uma peça visível) com `photo` e a cadeia até o território. Quatro filtros por slug: `?search`, `?organizationSlug`, `?communitySlug`, `?territorySlug` — os três últimos por `whereHas` aninhado. **Slug inexistente devolve lista vazia, não erro**: filtro é recorte, não busca de recurso. |
| `show.controller.ts` | GET /storefront/producers/:slug | A página de um artesão, pelo `slug`. As peças dele vêm de `GET /storefront/products?producerSlug=`, pelo mesmo motivo da página da loja. Sem consentimento de imagem, sem peça visível ou inexistente respondem o mesmo `404`: a vitrine não confirma que a pessoa existe para quem não pode vê-la (RN-21). |
| `show.use-case.ts` | — | Artesão por `slug`, com foto, `storyBlocks` dele e da organização, e `community → territory`. Devolve só a pessoa; as peças vêm de `?producerSlug=`. **Sem consentimento, sem peça visível e inexistente respondem o mesmo `404`** — a vitrine não confirma que a pessoa existe para quem não pode vê-la. |

#### `storefront/products/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/products | Produtos à venda, sem autenticação (RF-14, RF-35). Só aparece produto `ACTIVE` e não removido, de empresa ativa e não removida (RN-20) - qualquer outra combinação é inexistente para o visitante, não "indisponível". Os filtros são por `slug`, os mesmos que a URL da vitrine carrega. Slug inexistente devolve lista vazia, não erro. |
| `paginate.use-case.ts` | — | A listagem da vitrine. Parte de `visibleProducts()` com 13 preloads (categoria, subcategorias, selos, variantes vivas ordenadas, on-chain, cadeia de custódia, galeria por `position`, empresa→organização→comunidade→território, território em linhagem, produtores com foto, matérias, técnicas, história). Oito filtros por slug (`category`, `subcategory`, `company`, `certification`, `territory`, `community`, `producer` — este exigindo `image_consent_at` não nulo —, `technique`). **`?available`** é a disponibilidade real: sem variante viva, `stock > 0`; com variantes, ao menos uma com estoque — e `whereNot` do mesmo grupo para o inverso. Faixa de preço e ordenação vêm de `#core/catalog-query`, sobre o **preço efetivamente cobrado**. |
| `show.controller.ts` | GET /storefront/products/:identifier | Detalhe de um produto pelo `slug` ou pelo `sku` - os dois identificadores públicos, no mesmo parâmetro (UC-13). Produto em rascunho, arquivado, removido ou de empresa suspensa responde `404`, nunca "indisponível" (RN-21): a vitrine não confirma a existência do que não está à venda. |
| `show.use-case.ts` | — | Detalhe por **`slug` OU `sku`** no mesmo parâmetro (`where(slug).orWhere(sku)`), a partir da **mesma** `visibleProducts()` da listagem. Mesmos preloads, mais `traceabilityLevel` (calculado na hora), `rating` e `impact` anexados ao objeto serializado. Rascunho, arquivado, removido ou de empresa suspensa respondem "não encontrado", nunca "indisponível". |

#### `storefront/qrcode/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `show.controller.ts` | GET /storefront/qrcode/:entity/:slug | Devolve um **PNG** (não JSON) com o QR que aponta para a página pública da entidade: `producer` → `/artesao/:slug`, `community` → `/comunidade/:slug`, `company` → `/company/:slug`, `organization` → `/organizacao/:slug`. Entidade fora dessa lista é 404. O critério é **existência**, e não visibilidade: a etiqueta é impressa antes de publicar, e a página dirá "informação em revisão" até lá. O endereço é montado de `APP_URL` e nunca do `Host` - o QR é impresso uma vez e lido por anos. Com `?download=1` vem `Content-Disposition: attachment`, porque o atributo `download` de um `<a>` é ignorado entre origens. |
| `show.use-case.ts` | — | Gera o PNG do QR que aponta para a página pública. Valida `entity` contra a lista fechada (`isPublicEntity`) e resolve o model pelo mapa `producer\|community\|company\|organization`. **A única consulta da vitrine que não passa pelo `StorefrontVisibilityService`** — de propósito: a etiqueta é impressa *antes* de publicar, e exigir visibilidade impediria a cooperativa em formação de levar material para a feira. Nada é gravado: o PNG é função pura de `entity + slug`, e o `Cache-Control` da resposta evita gerar o mesmo binário duas vezes. |

#### `storefront/reviews/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/reviews | As avaliações de um produto, sem autenticação. `?productId` é obrigatório: a listagem existe para a ficha de um produto, e sem recorte devolveria a opinião do marketplace inteiro numa página só. A visibilidade é a do produto (RN-20): peça arquivada ou de empresa suspensa responde `404`, e as avaliações dela não vazam por aqui. A média e a distribuição por estrela vêm no mesmo envelope, calculadas sobre **todas** as avaliações do produto - derivá-las da página carregada daria proporção errada. De cada autor sai o nome, e só (RF-39). |
| `paginate.use-case.ts` | — | Exige `?productId` (`422 REVIEW_PRODUCT_REQUIRED`) e confere o produto contra `visibleProducts()` antes de listar — peça arquivada não vaza avaliação por esta rota. Filtro opcional `?rating`. **A nota agregada vai no mesmo envelope** (`ratingFor`), e não numa segunda requisição: as barras de distribuição são do produto inteiro, e derivá-las da página carregada daria proporção errada com cara de certa. 10/página. |

#### `storefront/techniques/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/techniques | As técnicas de produção oferecidas como filtro (RFC 002, F7). Só as que têm ao menos um produto visível - filtro que devolve lista vazia não é filtro, é armadilha. A `description` vem junto porque é o tooltip do chip: o nome do ofício não diz o que ele é, e quem está decidindo o que comprar precisa da segunda metade. |
| `paginate.use-case.ts` | — | Técnicas com `whereHas('products')` restrito a `visibleProducts()`. Serializa `id, name, slug, description` — a descrição vai junto porque é o tooltip do chip. 50/página. |

#### `storefront/territories/`

| Arquivo | Rota | O que faz |
|---|---|---|
| `paginate.controller.ts` | GET /storefront/territories | Os territórios que a vitrine oferece como filtro (RF-35, RFC 002 F7), sem autenticação. Só os que têm ao menos um produto visível, pela mesma razão de RF-38 nas categorias: filtro que devolve lista vazia não é filtro, é armadilha. O pai vem aninhado: "Alto Solimões" sozinho não localiza ninguém, e é a linhagem até o bioma que dá sentido ao recorte. |
| `paginate.use-case.ts` | — | Territórios cujo id aparece em `products.territory_id` dos visíveis, **com `parent` precarregado** — "Alto Solimões" sozinho não localiza ninguém; é a linhagem que prova procedência a quem lê do outro lado do mundo. Passa por `StorefrontShapeService.territory()`. 50/página. |


---

## 13. `database/`

### `database/schema.ts` e `schema_rules.ts`

| Arquivo | Linhas | O que é |
|---|---|---|
| `schema.ts` | 896 | **GERADO** por `node ace migration:run` (`DO NOT EDIT manually` no topo). Uma classe `*Schema extends BaseModel` por tabela, com `static $columns` e um `@column` por coluna, tipado a partir do banco. É o que os 27 models estendem. Ignorado pelo ESLint e pelo Prettier. Consequência de design registrada nos comentários: enums saem tipados como `string`, e por isso os models fazem override (`declare status: ProductStatus`). |
| `schema_rules.ts` | 3 | `export default {} satisfies SchemaRules` — ponto de extensão vazio para customizar a geração. |

### `database/migrations/` — 35 migrations, ordem cronológica

Todas as PKs são `uuid` com `defaultTo(uuid_generate_v4())`. Todas as tabelas de negócio têm `created_at`, `updated_at` e `deleted_at` (remoção lógica).

| # | Arquivo | Tabela | Colunas / restrições principais |
|---|---|---|---|
| 1 | `1761885935058_create_extension.ts` | — | Habilita a extensão `uuid-ossp` (usada por todo `defaultTo(uuid_generate_v4())`) |
| 2 | `1761885935135_create_storages.ts` | `storages` | `filename`, `original_name`, `mimetype`, `size` (bigint), `path`, `status` (default `PENDING`), `upload_id`, `part_size`; índice `(status, created_at)` |
| 3 | `1761885935140_create_territories_table.ts` | `territories` | `name`, `slug` único, `kind` (enum `TERRITORY_KINDS`), `uf(2)`, `parent_id` (auto-relação); índices em `parent_id` e `kind` |
| 4 | `1761885935145_create_communities_table.ts` | `communities` | `name`, `slug` único, `description`, `latitude`, `longitude`, `territory_id` |
| 5 | `1761885935168_create_users_table.ts` | `users` | `name`, `email` único, `password`, `phone(11)`, `role` (enum), `status` (default `ACTIVE`), `avatar_id` → `storages` (`SET NULL`), `cpf` único, `code` único, `notes` |
| 6 | `1761885935200_create_companies_table.ts` | `companies` | `cnpj(14)` único, `legal_name`, `trade_name`, `slug` único, `logo_id` → `storages`, `notes`, `wallet(128)`, `commission_rate` (default 0) |
| 7 | `1768620764696_create_access_tokens_table.ts` | `auth_access_tokens` | `type`, `name`, `hash`, `abilities`, `last_used_at`, `expires_at` |
| 8 | `1785248290024_create_categories_table.ts` | `categories` | `name`, `slug` único, `description`, `icon(40)`, `status` (default `ACTIVE`) |
| 9 | `1785300000000_create_subcategories_table.ts` | `subcategories` | `name`, `slug`, `category_id`; **únicos compostos** `(category_id, name)` e `(category_id, slug)` — dois "Acessórios" em categorias diferentes convivem |
| 10 | `1785385159507_create_products_table.ts` | `products` | `name`, `slug` único, `sku` único, `barcode`, `description`, `price`/`discounted_price` (inteiros em centavos), `charge_tax`, `stock` (default 0), `status` (default `DRAFT`), `brand`, `color`, `weight`, `story`, `symbolism`, `features` (jsonb), `producer_price`, `cooperative_rate`, `harvest`, `volume`, `market`; índices `category_id`, `company_id`, `territory_id`, `(status, deleted_at, company_id)`; **CHECK `stock >= 0`** |
| 11 | `1785435500179_create_addresses_table.ts` | `addresses` | `user_id` (`CASCADE`), `cep(8)`, `logradouro`, `number`, `complement`, `neighborhood`, `city`, `uf(2)`, `label`, `is_default` |
| 12 | `1785600000000_create_product_subcategories.ts` | `product_subcategories` | Pivô; PK composta `(product_id, subcategory_id)` |
| 13 | `1785700000000_create_product_images.ts` | `product_images` | Pivô com `position`; PK composta `(product_id, storage_id)` — a ordem é a da galeria, o primeiro é a capa |
| 14 | `1785800000000_create_orders_table.ts` | `orders` | `number` único, `checkout_id` (agrupa pedidos do mesmo carrinho), `customer_id` (`RESTRICT`), `status` (default `PENDING`), `payment_method`, `subtotal`, `shipping_price`, `total`, `commission_rate`, `commission_amount`, endereço de entrega **congelado** em 7 colunas `shipping_*`, `cancellation_reason`, e 6 timestamps de ciclo (`placed_at`, `confirmed_at`, `shipped_at`, `delivered_at`, `cancelled_at`, `paid_at`); cria `SEQUENCE order_number_seq` |
| 15 | `1785805000000_create_product_variants_table.ts` | `product_variants` | `name`, `sku` único, `price`, `stock` (CHECK `>= 0`), `position`; único `(product_id, name)` |
| 16 | `1785810000000_create_order_items_table.ts` | `order_items` | `order_id` (`CASCADE`), `name`, `sku`, `variant_name`, `unit_price`, `quantity` (CHECK `> 0`), `line_total` — **dados do produto copiados**, não referenciados: o pedido não muda quando o produto muda |
| 17 | `1785900000000_create_reviews_table.ts` | `reviews` | `customer_id` (`RESTRICT`), `rating` (CHECK 1–5), `comment`; único `(product_id, customer_id)` |
| 18 | `1785910000000_create_certifications_table.ts` | `certifications` | `name`, `slug` único, `issuer`, `description`, `scope` (default `PRODUCT`), `status` |
| 19 | `1785920000000_create_certification_grants.ts` | `certification_grants` | `product_id`/`company_id` **ambos nulos** (o selo é de um ou de outro), `issued_at`, `expires_at`, `document_id` → `storages`; únicos `(product_id, certification_id)` e `(company_id, certification_id)`; `raw` com CHECK garantindo exatamente um assunto |
| 20 | `1785940000000_create_onchain_records_table.ts` | `onchain_records` | `network`, `contract_address`, `token_id`, `tx_hash`, `explorer_url`, `registered_at` |
| 21 | `1785950000000_create_traceability_events_table.ts` | `traceability_events` | `stage`, `happened_at`, `location`, `actor`, `tx_hash`, `position`, `evidence_id` → `storages`, `recorded_by` → `users`, `superseded_by_id` (auto-relação); índices `(product_id, position)` e `superseded_by_id` |
| 22 | `1785960000000_create_organizations_table.ts` | `organizations` | `name`, `slug` único, `kind` (enum), `mission`, `women_led`, `founded_at`, `members_count`, `managed_area`, `company_id` **nulo** (organização em formação existe sem empresa), `community_id`, `stage` |
| 23 | `1785965000000_create_materials_table.ts` | `materials` | `name`, `slug` único, `origin_type` (enum), `is_native`, `notes` |
| 24 | `1785970000000_create_producers_table.ts` | `producers` | `name`, `slug` único, `bio`, `craft`, `joined_at`, `photo_id`, **`image_consent_at`** (a coluna do consentimento), `user_id` nulo (produtor sem conta existe), `organization_id` nulo |
| 25 | `1785980000000_create_product_producers.ts` | `product_producers` | Pivô de **autoria** com `role`; único `(product_id, producer_id)` |
| 26 | `1785990000000_create_product_materials.ts` | `product_materials` | Pivô com `share_rate` e `territory_id`; único `(product_id, material_id)` |
| 27 | `1786000000000_create_sdgs_table.ts` | `sdgs` | `code(6)` único, `title`, `color(7)` — os 17 ODS da ONU |
| 28 | `1786010000000_create_impact_projects_table.ts` | `impact_projects` | `title`, `slug` único, `summary`, `started_at`, `ended_at`, `cover_id`, `company_id`, `community_id`, `status`; índice em `status` |
| 29 | `1786020000000_create_impact_project_sdgs.ts` | `impact_project_sdgs` | Pivô projeto↔ODS (`RESTRICT` no ODS); único `(impact_project_id, sdg_id)` |
| 30 | `1786030000000_create_impact_allocations_table.ts` | `impact_allocations` | `product_id` nulo (alocação sobre a peça ou sobre o faturamento), `basis` (enum), `share_rate` (pontos-base), `effective_from_at`, `effective_to_at` — **versionada, nunca sobrescrita** |
| 31 | `1786040000000_create_impact_reports_table.ts` | `impact_reports` | `period_start_at`, `period_end_at`, `narrative`, `amount_in_cents` (bigint), `beneficiaries_count`, `evidence_id`, `published_at`; índices em `impact_project_id` e `published_at` |
| 32 | `1786050000000_create_product_passports_table.ts` | `product_passports` | `public_code(12)` único, `published_at`, `views_count`, `qr_storage_id`; índice em `published_at` |
| 33 | `1786060000000_create_techniques_table.ts` | `techniques` | `name`, `slug` único, `description` — sem enum de tipo: o artesanato não cabe em lista fechada |
| 34 | `1786070000000_create_product_techniques.ts` | `product_techniques` | Pivô com `detail(200)`; único `(product_id, technique_id)` |
| 35 | `1786080000000_create_story_blocks.ts` | `story_blocks` | `kind` (enum), `position`, `body` (jsonb `RichDocument`), `storage_id`, `url`, `credit`, e **quatro FKs mutuamente exclusivas**: `product_id`, `producer_id`, `organization_id`, `community_id` (todas `CASCADE`); um índice `(dono, position)` para cada; `raw` com CHECK de exclusividade |

### `database/factories/` — 7 factories

| Arquivo | Linhas | Notas |
|---|---|---|
| `address_factory.ts` | 60 | Ruas, bairros e cidades de listas próprias — o faker padrão devolveria endereço dos EUA, o que salta aos olhos num endereço de Benjamin Constant. UFs da Amazônia Legal. |
| `category_factory.ts` | 21 | Estado `inactive` existe porque `status` é metade da regra de visibilidade na vitrine. |
| `company_factory.ts` | 54 | `userId` **não** é definido de propósito — quem cria a empresa é a relação `company` da `UserFactory`. CNPJ só com dígitos e com dígitos verificadores calculados (`faker.string.numeric(14)` seria recusado pelo validator). |
| `product_factory.ts` | 35 | Nasce `DRAFT`. `companyId` e `categoryId` ficam fora da definição — declará-los faria cada produto nascer com empresa e categoria novas. Preços em centavos. |
| `storage_factory.ts` | 30 | Grava só a linha; **nada vai para o disco**. Basta para exercitar `avatar_id`, `logo_id` e o pivô `product_images` com `position`. Abrir a `url` dá 404, e é o esperado. |
| `subcategory_factory.ts` | 16 | Sem `status` próprio: some junto com a categoria. |
| `user_factory.ts` | 45 | `DEMO_PASSWORD = 'Demo1234!'` em texto puro — o mixin `withAuthFinder` cifra ao salvar; passar hash geraria hash de hash. |

### `database/seeders/` — 3 seeders

| Arquivo | Linhas | O que faz |
|---|---|---|
| `user_seeder.ts` | 20 | Cria o **dono da plataforma** (`administrator@mail.com`) por `updateOrCreate`. É o único caminho para o papel `OWNER` — nenhum endpoint cria nem promove. |
| `sdg_seeder.ts` | 44 | Os 17 ODS da ONU com código, título e **cor oficial** em hexadecimal. Roda em **todo** ambiente: projeto de impacto sem ODS não sai de `DRAFT`, então produção subiria com a tela vazia. |
| `demo_seeder.ts` | 2.003 | Seed de demonstração completo: empresas, organizações, comunidades, territórios, produtores, catálogo Ticuna, anexos. **Grava binário de verdade em disco** para cada anexo (desenha um SVG por `slug`, com cor derivada do próprio slug), dá chave própria a cada arquivo e liga a galeria com a capa em `position: 0` — três comportamentos verificados por `tests/functional/demo_seeder.spec.ts`. |
| `products/base.md` | — | Fonte raspada de lojas de artesanato Ticuna: nome, especificação, dimensão e preço de cada peça. Fica como registro da procedência da especificação. |

### `database/data/`

| Arquivo | Linhas | O que é |
|---|---|---|
| `ticuna_catalog.ts` | 871 | O catálogo Ticuna do seed — **46 peças reais**, derivadas de `products/base.md`. **Imagem não vem junto**: as fotos são de terceiros e não são versionadas; o seeder desenha um SVG por peça. |


### Anatomia de `config/openapi.ts` — 674 linhas

Três exports e um default:

| Export | Conteúdo |
|---|---|
| `SECURITY_SCHEME = 'cookieAuth'` / `SECURITY_COOKIE = 'access-token'` | O esquema de segurança do documento. É cookie, não `Authorization`, porque o guard é `CookieAccessTokensGuard`. |
| `type TagRule` | `{ prefix, name, description, singular?, plural? }`. |
| `tags: TagRule[]` | **67 regras**, uma por prefixo de rota, na ordem em que aparecem no documento. Vão de `/authentication` e `/lookup`, passando pelos 12 prefixos de `/storefront/*`, `/account` e `/storages`, até os ~20 de `/administrator/*`, `/company/*`, `/customer/*` e `/producer/*`. `singular` e `plural` são o que `deriveSummary` usa para escrever "Listar peças" a partir da ação `paginate` — o resumo de cada operação **não é escrito à mão**. |
| `default { info, servers, ignore }` | `info`: "Simple Hub API", versão 1.0.0. `servers`: um só, `APP_URL`. **`ignore: ['/', '/documentation', '/openapi.json', '/health']`** — o documento não se documenta, e a sonda de saúde não é contrato de API. |

### Anatomia de `start/routes.ts` — 1.215 linhas

Não é uma lista: é um arquivo comentado, em que cada grupo carrega a justificativa da própria existência. A estrutura, em ordem:

| Bloco | Linhas (aprox.) | O que estabelece |
|---|---|---|
| Raiz | 18–58 | `/` redireciona para `/documentation`; `/health` é sonda mínima — **deliberadamente não** o `@adonisjs/core/health`, cujo `/health/ready` reporta disco, memória e conexões e exige header secreto ("uma sonda que exige segredo para ser usada é uma sonda a menos"); `/openapi.json` lê o arquivo do disco **uma vez** e cacheia em memória (é artefato commitado, não muda enquanto o processo vive); `/documentation` serve a página Scalar. |
| `storefront` | 61–211 | 12 subgrupos. **Sem middleware nenhum, de propósito** — o que limita é a condição de visibilidade, não a autenticação. `products/:identifier` casa slug **ou** sku no mesmo caminho. `passports/:publicCode` é alcançado pelo **código curto**, não pelo id, porque o que está na etiqueta é o código. `qrcode/:entity/:slug` é o único endpoint binário do sistema. |
| `authentication` | 213–229 | Os três sign-ups com **o papel no caminho**; `sign-out` é o único com `auth()`; `refresh` fica fora de propósito. |
| `lookup` | 232–247 | Logo abaixo de `/authentication` porque é quem a usa — o formulário de cadastro, que roda antes de existir sessão. |
| `account` | 249–257 | `GET`/`PUT` sem identificador, com `auth()`. |
| `storages` | 259–295 | Os quatro passos do upload sob `auth()`, e `:id/download` **fora** do grupo. |
| `administrator` | 297–779 | O maior bloco. ~20 subgrupos sob `auth()` + `role([OWNER, ADMINISTRATOR])`, mais o subgrupo `lifecycle` (linhas ~600–775) com archive/unarchive/delete de 12 recursos. O `role(['OWNER'])` está **em cada `DELETE`**, e não no grupo: a matriz difere por verbo — o administrador gerencia a lixeira, só o dono apaga —, e um guard de grupo diria que o administrador não pode arquivar, que é o oposto do desenho. Um subgrupo por recurso porque o Adonis deriva o nome da rota do verbo, e três operações × cinco recursos num grupo plano colidiriam. |
| `company` | 781–1.042 | 19 subgrupos sob `role([COMPANY])`. |
| `customer` | 1.044–1.094 | `orders` + `addresses` (estes reaproveitando os controllers de `company/addresses`). |
| `producer` | 1.096–1.215 | 8 subgrupos sob `role([PRODUCER])`. |

O inventário completo das 238 rotas está na [§18](#18-índice-completo-de-rotas).

### Anatomia de `database/seeders/demo_seeder.ts` — 2.003 linhas

O seed de demonstração. **Só roda em `development`** (a doc do Lucid sugere incluir `testing`, mas `resetDatabase()` em `tests/helpers.ts` faz truncate + seed a cada teste, e todo teste começaria com 15 produtos e 3 empresas — quebrando contagens de paginação e colidindo nos slugs que os helpers criam). Há um `// REMOVER production QUANDO DE FATO IR PARA PRODUCAO` no arquivo.

**Guarda de reentrada:** `run()` procura `Company.findBy('slug', 'assoc-artesas-do-solimoes')` e sai se achar — reexecutar duplicaria tudo e estouraria as chaves únicas fixas. Para regerar: `node ace migration:fresh --seed`.

Dados declarados no topo do arquivo:

| Constante | Linhas | Conteúdo |
|---|---|---|
| `PACKAGE_ICON` | 72–151 | O SVG que o seeder desenha por peça — cor derivada do próprio slug, para as peças ficarem distintas sem o repositório carregar foto de terceiro. |
| `CERTIFICATIONS` | 152–184 | Os selos do catálogo global. |
| `SALES` | 185–269 | Os pedidos de demonstração. |
| `CompanySeed` / `seeds` | 270–311 | Três empresas. O perfil produtivo (membros, área manejada, comunidade) **saiu daqui e virou `organizations`**: quem tem esses atributos é a cooperativa, não a razão social — o que resta é o eixo comercial. |
| `CATEGORIES` | 312–382 | O catálogo. |
| `PRODUCTS` | 383–582 | As peças, cada bloco anotado com o estado que exercita: **Marajoara** tem 3 visíveis, 1 rascunho e 1 removida (o `deleted_at` sozinho já a tira da vitrine *e* das listagens do painel — é o que separa "arquivada" de "removida"); **Rio Negro** tem todas publicadas e **nenhuma aparece**, porque o usuário da empresa está inativo e isso invalida a empresa inteira na vitrine — arrastando junto a categoria `tecelagem-e-pintura`, que existe e está ativa. |

Métodos privados, na ordem em que `run()` os chama:

| Método | Linhas | O que semeia |
|---|---|---|
| `#storages(names)` | 1.906–1.930 | Escreve o binário de cada anexo **em disco**, com chave própria por arquivo. Só a galeria de produto recebe imagem: logotipo, avatar e foto de artesão ficam nulos de propósito — para eles o `AvatarFallback` mostra a inicial de quem é, mais informativo que uma imagem falsa, e é a tela que o vendedor vê antes de subir a dele. |
| `#company(data)` | 1.931–1.971 | Usuário + perfil + endereço. |
| `#catalog()` | 1.972–2.003 | Categorias e subcategorias. |
| `#origin(companies)` | 957–1.596 | O maior: territórios, comunidades, organizações, produtores, matérias-primas, técnicas e a história em blocos. |
| `#paragraph(text)` | 1.597–1.603 | Monta um `RichDocument` de um parágrafo. |
| `#certifications()` | 1.604–1.671 | Selos e concessões. |
| `#impact(company)` | 1.672–1.759 | Projeto, alocação e relatório de impacto. |
| `#traceability(company)` | 817–911 | A cadeia de custódia com evidência — devolve a peça que chega ao nível `TRACED`. |
| `#variants()` | 912–956 | As variantes com estoque. |
| `#passports(traced)` | 1.760–1.793 | O passaporte da peça rastreada, com QR. |
| `#sales()` | 1.794–1.905 | Os pedidos, em vários estados. |

Além disso: dois administradores e dois compradores por `UserFactory`, **um inativo de cada** — que é o que exercita o filtro de status da listagem e o `401` do sign-in.

Três comportamentos deste arquivo são cobertos por `tests/functional/demo_seeder.spec.ts`: grava o binário de todo anexo, dá chave própria a cada um, e liga a galeria com a capa em `position: 0`.

---

## 14. `commands/`, `providers/`, `infra/`, `bin/`

### `commands/` — 3 comandos ace (261 linhas)

| Arquivo | Comando | O que faz |
|---|---|---|
| `openapi_generate.ts` | `openapi:generate` | Chama `buildDocument()` de `#core/openapi/document` e escreve `openapi.json`. `--check` compara com o disco e falha se divergir (é o que pega export de validator renomeado sem atualizar o controller). `--strict` trata aviso como erro. Loga `X de Y operações com a resposta descrita`. |
| `storages_prune.ts` | `storages:prune` | Apaga uploads `PENDING` abandonados há mais de `--hours` (padrão 24) e **aborta o multipart de cada um** no bucket. Reaproveita `StorageDeleteUseCase` em vez de reimplementar a remoção. `--dry-run` lista sem apagar. |
| `certifications_expire.ts` | `certifications:expire` | Move para `EXPIRED` as concessões `VALID` com `expiresAt` no passado. `--dry-run` lista sem escrever. |

### `providers/` (111 linhas)

| Arquivo | O que registra |
|---|---|
| `api_provider.ts` | `ApiSerializer extends BaseSerializer` com `wrap: 'data'` e metadados de paginação do Lucid. Instala `context.serialize()` e `context.serialize.withoutWrapping()` como propriedade de instância do `HttpContext`, com o module augmentation correspondente. É o que faz listagem sair envelopada em `data` e item sair "nu". |
| `storage_provider.ts` | Registra o **`S3Client` como singleton** no container, montado a partir de `clientConfig` de `#config/drive`. `shutdown()` destrói o client. É a instância que o `MultipartService` recebe por injeção. |

### `infra/`

| Arquivo | O que é |
|---|---|
| `r2-cors.json` | Política CORS a aplicar no bucket R2 de produção: origem `https://marketplace.simple.tec.br`, métodos `PUT`/`GET`/`HEAD`, header `content-type`, expõe `ETag` (o `complete` do multipart depende dele), `MaxAgeSeconds: 3600`. |

### `bin/`

| Arquivo | O que é |
|---|---|
| `server.ts` | Entrypoint HTTP. `Ignitor` com importer relativo, valida `#start/env` no `app.booting`, escuta `SIGTERM` (e `SIGINT` sob PM2), `httpServer().start()`. |
| `console.ts` | Entrypoint do ace. Mesma montagem, terminando em `.ace().handle(process.argv)`. É por isso que `node ace build` valida o env — o que explica os placeholders no `Dockerfile-production`. |
| `test.ts` | Entrypoint do Japa. Força `NODE_ENV=test` antes de qualquer import, carrega `tests/bootstrap.js`, e encadeia `app.terminate()` no teardown. |

---

## 15. `tests/`

Suite única, `functional`, timeout 30s (`adonisrc.ts`). **Não há suite unitária.** 16 specs, 2.672 linhas.

| Arquivo | O que estabelece |
|---|---|
| `bootstrap.ts` | Plugins: `assert`, `pluginAdonisJS`, `dbAssertions`, `apiClient`, `sessionApiClient`, `authApiClient`. Registra o `Registry` do Tuyau em `RoutesRegistry` — os testes chamam rota **por nome tipado**. Dois reporters: `spec` (padrão) e um `tap` escrito à mão, ativado por `ONP_TAP=1`. `setup: [testUtils.db().migrate()]`. |
| `helpers.ts` | `body()`, `OWNER`, `authenticate()`, `authenticateAsOwner()`, `resetDatabase()`, `createAdministrator()`, `signUpCompany()`, `createCompanySession()`, `createCategory()`, `createSubcategory()`, `createCompanyProduct()`. |
| `functional/storages.spec.ts` (631 l) | O maior. Upload: uma parte vs. fatiado, recusa de mimetype antes de assinar, teto de tamanho, tamanho acima do teto de `int4`, exigência de sessão, `complete` idempotente, remontagem do multipart, `422` quando o que subiu não bate com o tamanho declarado, retomada, e que **a URL devolvida sobe de verdade**. |
| `functional/origin.spec.ts` (244 l) | Hierarquia de território (região dentro do bioma passa; bioma dentro do município não; ciclo na edição é recusado), consentimento de imagem do produtor na serialização, e a escada de rastreabilidade: `NONE` sem origem → `BASIC` sem evidência → `IMPACT` com origem, autoria, evidência e alocação. |
| `functional/lookup.spec.ts` (204 l) | CEP/CNPJ: nomes de campo do projeto, máscara irrelevante, `404` na origem, **`503` quando a origem cai** (e não `404`), validação antes da chamada, e cache na segunda consulta. |
| `functional/validator.spec.ts` (162 l) | Invariantes do `#core/validator`: todo campo de texto tem limite, todo campo tem rótulo em português, e não sobra rótulo de campo que não existe mais. |
| `functional/documento.spec.ts` (159 l) | CPF e CNPJ: máscara removida ao gravar, dígito verificador conferido, dígito repetido recusado, **CNPJ alfanumérico** aceito e normalizado para maiúscula, e o CNPJ da `CompanyFactory` passando pela regra. |
| `functional/multipart.spec.ts` (137 l) | O `MultipartService` contra o MinIO real: sobe em partes e remonta com a soma dos tamanhos, `listParts` enxerga só o que subiu, `abort` não deixa parte ocupando o bucket, URL assinada expira. |
| `functional/storefront-privacy.spec.ts` (117 l) | Nenhum campo privado atravessa a listagem pública nem a página da organização. |
| `functional/storefront.spec.ts` (113 l) | Disponível/indisponível partem o catálogo; a ordem por preço é a do **preço cobrado**; a faixa de preço corta pelo que se paga; filtro de território só oferece o que tem peça visível. |
| `functional/storefront-qrcode.spec.ts` (98 l) | Organização em formação imprime QR antes de existir na vitrine; entidade fora da lista fechada e slug inexistente são `404`; `?download=1` liga o header de anexo. |
| `functional/storefront-organizations.spec.ts` (83 l) | Associação formalizada abre com história, gente e loja; organização em formação não tem página; slug inexistente é `404`; quem não consentiu não entra na lista. |
| `functional/qualified-columns.spec.ts` (79 l) | Nenhuma string de coluna mistura prefixo de tabela com camelCase, e as listagens que contam produtos não quebram no join. |
| `functional/company-identity.spec.ts` (76 l) | O `companyId` de uma organização e o de um produto abrem a **mesma** empresa; o id do usuário dono não abre. |
| `functional/demo_seeder.spec.ts` (65 l) | O seeder grava o binário de todo anexo, dá chave própria a cada um, e liga a galeria com a capa em `position: 0`. |
| `functional/mensagens.spec.ts` (61 l) | As regras dos validators estão em português; nenhuma mensagem escapou em inglês. |
| `functional/slug.spec.ts` (57 l) | Descarta pontuação, não estoura o limite da coluna, não deixa hífen pendurado no corte, preserva o que já cabe. |
| `functional/company-profile.spec.ts` (55 l) | Empresa arquivada responde `403` (estado previsto), perfil ausente continua `500` (invariante quebrada) — a distinção que `companyOf()` existe para preservar. |

---

## 16. `.adonisjs/` — codegen

Gerado pelos hooks de `adonisrc.ts` (`indexEntities` do Adonis e `generateRegistry` do Tuyau). **Nenhum arquivo aqui é editado à mão**, e todos trazem `DO NOT EDIT manually` no topo.

### `.adonisjs/server/`

| Arquivo | Linhas | O que é |
|---|---|---|
| `controllers.ts` | 383 | O objeto `controllers` que `start/routes.ts` importa como `#generated/controllers`. Árvore `papel → recurso → Ação`, cada folha um `() => import('#features/.../x.controller')`. Gerado pelo `indexEntities` com `source: 'app/features'`, `glob: ['**/*.controller.ts']`. É o que elimina string mágica no arquivo de rotas — renomear um controller quebra a compilação, não a produção. |
| `routes.d.ts` | 596 | `ScannedRoutes` — o nome de cada rota mapeado para seus parâmetros (`paramsTuple` e `params`). Estende `RoutesList` do Adonis, dando autocomplete tipado a `router.makeUrl()` e ao api client dos testes. |
| `events.ts` | 6 | `export const events = {}` — nenhum evento declarado. |
| `listeners.ts` | 6 | `export const listeners = {}` — nenhum listener declarado. |

### `.adonisjs/client/` — registry Tuyau

| Arquivo | Linhas | O que é |
|---|---|---|
| `registry/index.ts` | 1.415 | O registry runtime: para cada rota, `methods`, `pattern`, `tokens` (segmentos parseados) e o tipo `Registry[...]['types']`. É o que um cliente HTTP tipado consome — o `package.json` o exporta como `./registry`. |
| `registry/schema.d.ts` | 2.794 | Os tipos de request/response de cada rota, por nome. Usado por `tests/bootstrap.ts` para tipar `RoutesRegistry`. |
| `registry/tree.d.ts` | 403 | `ApiDefinition` — a árvore de rotas em forma navegável (`api.storefront.products.$get()`). |
| `data.d.ts` | 10 | Namespace `Data` para os transformers (`InferData`, `InferVariants`). Vazio hoje. Exportado como `./data`. |
| `manifest.d.ts` | 11 | `/// <reference>` para `adonisrc.ts` e os configs que fazem module augmentation (`auth`, `drive`, `hash`, `logger`, `openapi`) — é o que costura os tipos declarados nos configs. |

---

## 17. Artefatos gerados

Presentes no repositório, **não** mapeados arquivo a arquivo por serem derivados:

| Caminho | O que é | Quem gera |
|---|---|---|
| `build/` | Espelho compilado de todo o source (`.js` + `.js.map`), com `package.json` e lockfile próprios escritos pelo assembler. É a árvore que vai para a imagem de produção. | `node ace build` |
| `openapi.json` (4,8 MB) | Documento OpenAPI completo, **commitado** e declarado em `metaFiles` para acompanhar o build. Servido por `GET /openapi.json`. | `node ace openapi:generate` |
| `node_modules/` | Dependências. | `pnpm install` |
| `tmp/db.sqlite3`, `tmp/storage-test/` | Resíduos de execução de teste — o `storage-test/` guarda os `.webp` que os specs de storage e o `demo_seeder` escreveram. | suite de testes |
| `database/schema.ts` | Colunas tipadas a partir do banco. Commitado, e a única exceção da regra "gerado não se versiona" — os models dependem dele para compilar. | `node ace migration:run` |
| `.adonisjs/` | Ver seção 16. | hooks de `adonisrc.ts` |

---

## 18. Índice completo de rotas

238 rotas, extraídas de `node ace list:routes`. `role(A\|B)` significa que qualquer um dos papéis passa.

### Raiz — sonda e documentação — 4 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| GET | `/` | — | _closure em `routes.ts`_ | — |
| GET | `/health` | — | _closure em `routes.ts`_ | — |
| GET | `/openapi.json` | — | _closure em `routes.ts`_ | — |
| GET | `/documentation` | — | _closure em `routes.ts`_ | — |

### `/storefront` — público, sem sessão — 16 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| GET | `/storefront/products` | `storefront.products.paginate` | `storefront/products/paginate` | — |
| GET | `/storefront/products/:identifier` | `storefront.products.show` | `storefront/products/show` | — |
| GET | `/storefront/companies` | `storefront.companies.paginate` | `storefront/companies/paginate` | — |
| GET | `/storefront/companies/:slug` | `storefront.companies.show` | `storefront/companies/show` | — |
| GET | `/storefront/categories` | `storefront.categories.paginate` | `storefront/categories/paginate` | — |
| GET | `/storefront/certifications` | `storefront.certifications.paginate` | `storefront/certifications/paginate` | — |
| GET | `/storefront/territories` | `storefront.territories.paginate` | `storefront/territories/paginate` | — |
| GET | `/storefront/techniques` | `storefront.techniques.paginate` | `storefront/techniques/paginate` | — |
| GET | `/storefront/producers` | `storefront.producers.paginate` | `storefront/producers/paginate` | — |
| GET | `/storefront/producers/:slug` | `storefront.producers.show` | `storefront/producers/show` | — |
| GET | `/storefront/communities` | `storefront.communities.paginate` | `storefront/communities/paginate` | — |
| GET | `/storefront/communities/:slug` | `storefront.communities.show` | `storefront/communities/show` | — |
| GET | `/storefront/organizations/:slug` | `storefront.organizations.show` | `storefront/organizations/show` | — |
| GET | `/storefront/reviews` | `storefront.reviews.paginate` | `storefront/reviews/paginate` | — |
| GET | `/storefront/passports/:publicCode` | `storefront.passports.show` | `storefront/passports/show` | — |
| GET | `/storefront/qrcode/:entity/:slug` | `storefront.qrcode.show` | `storefront/qrcode/show` | — |

### `/authentication` — 6 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| POST | `/authentication/sign-up/company` | `authentication.sign_up` | `authentication/sign-up` | — |
| POST | `/authentication/sign-up/customer` | `authentication.sign_up_customer` | `authentication/sign-up-customer` | — |
| POST | `/authentication/sign-up/producer` | `authentication.sign_up_producer` | `authentication/sign-up-producer` | — |
| POST | `/authentication/sign-in` | `authentication.sign_in` | `authentication/sign-in` | — |
| POST | `/authentication/sign-out` | `authentication.sign_out` | `authentication/sign-out` | auth |
| POST | `/authentication/refresh` | `authentication.refresh` | `authentication/refresh` | — |

### `/lookup` — 2 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| GET | `/lookup/cep/:cep` | `lookup.cep` | `lookup/cep` | — |
| GET | `/lookup/cnpj/:cnpj` | `lookup.cnpj` | `lookup/cnpj` | — |

### `/account` — `auth()` — 2 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| GET | `/account` | `profile.show` | `account/show` | auth |
| PUT | `/account` | `profile.update` | `account/update` | auth |

### `/storages` — `auth()` (exceto `download`) — 5 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| POST | `/storages` | `storages.create` | `storages/create` | auth |
| POST | `/storages/:id/complete` | `storages.complete` | `storages/complete` | auth |
| GET | `/storages/:id/parts` | `storages.parts` | `storages/parts` | auth |
| DELETE | `/storages/:id` | `storages.delete` | `storages/delete` | auth |
| GET | `/storages/:id/download` | `storages.download` | `storages/download` | — |

### `/administrator` — `auth()` + `role(OWNER|ADMINISTRATOR)` — 103 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| GET | `/administrator/administrators` | `administrator.administrators.paginate` | `administrator/administrators/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/administrators` | `administrator.administrators.create` | `administrator/administrators/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/administrators/:id` | `administrator.administrators.show` | `administrator/administrators/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/administrators/:id` | `administrator.administrators.update` | `administrator/administrators/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/companies` | `administrator.companies.paginate` | `administrator/companies/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/companies` | `administrator.companies.create` | `administrator/companies/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/companies/:id` | `administrator.companies.show` | `administrator/companies/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/companies/:id` | `administrator.companies.update` | `administrator/companies/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/categories` | `administrator.categories.paginate` | `administrator/categories/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/categories` | `administrator.categories.create` | `administrator/categories/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/categories/:id` | `administrator.categories.show` | `administrator/categories/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/categories/:id` | `administrator.categories.update` | `administrator/categories/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/subcategories` | `administrator.subcategories.paginate` | `administrator/subcategories/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/subcategories` | `administrator.subcategories.create` | `administrator/subcategories/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/subcategories/:id` | `administrator.subcategories.show` | `administrator/subcategories/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/subcategories/:id` | `administrator.subcategories.update` | `administrator/subcategories/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/products` | `administrator.products.paginate` | `administrator/products/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/products/:id` | `administrator.products.show` | `administrator/products/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/products/:id` | `administrator.products.update` | `administrator/products/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/orders` | `administrator.orders.paginate` | `administrator/orders/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/orders/:id` | `administrator.orders.show` | `administrator/orders/show` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/certifications` | `administrator.certifications.paginate` | `administrator/certifications/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/certifications` | `administrator.certifications.create` | `administrator/certifications/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/certifications/:id` | `administrator.certifications.show` | `administrator/certifications/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/certifications/:id` | `administrator.certifications.update` | `administrator/certifications/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/certification-grants` | `administrator.certificationGrants.paginate` | `administrator/certification-grants/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/certification-grants/:id` | `administrator.certificationGrants.show` | `administrator/certification-grants/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/certification-grants/:id/review` | `administrator.certificationGrants.review` | `administrator/certification-grants/review` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/sdgs` | `administrator.sdgs.paginate` | `administrator/sdgs/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/impact-projects` | `administrator.impactProjects.paginate` | `administrator/impact-projects/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/impact-projects/:id` | `administrator.impactProjects.show` | `administrator/impact-projects/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/impact-projects/:id/review` | `administrator.impactProjects.review` | `administrator/impact-projects/review` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/territories` | `administrator.territories.paginate` | `administrator/territories/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/territories` | `administrator.territories.create` | `administrator/territories/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/territories/:id` | `administrator.territories.show` | `administrator/territories/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/territories/:id` | `administrator.territories.update` | `administrator/territories/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/communities` | `administrator.communities.paginate` | `administrator/communities/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/communities` | `administrator.communities.create` | `administrator/communities/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/communities/:id` | `administrator.communities.show` | `administrator/communities/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/communities/:id` | `administrator.communities.update` | `administrator/communities/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/materials` | `administrator.materials.paginate` | `administrator/materials/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/materials` | `administrator.materials.create` | `administrator/materials/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/materials/:id` | `administrator.materials.show` | `administrator/materials/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/materials/:id` | `administrator.materials.update` | `administrator/materials/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/techniques` | `administrator.techniques.paginate` | `administrator/techniques/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/techniques` | `administrator.techniques.create` | `administrator/techniques/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/techniques/:id` | `administrator.techniques.show` | `administrator/techniques/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/techniques/:id` | `administrator.techniques.update` | `administrator/techniques/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/organizations` | `administrator.organizations.paginate` | `administrator/organizations/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/organizations` | `administrator.organizations.create` | `administrator/organizations/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/organizations/:id` | `administrator.organizations.show` | `administrator/organizations/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/organizations/:id` | `administrator.organizations.update` | `administrator/organizations/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/producers` | `administrator.producers.paginate` | `administrator/producers/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| POST | `/administrator/producers` | `administrator.producers.create` | `administrator/producers/create` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/producers/:id` | `administrator.producers.show` | `administrator/producers/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/producers/:id` | `administrator.producers.update` | `administrator/producers/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/reviews` | `administrator.reviews.paginate` | `administrator/reviews/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/reviews/:id` | `administrator.reviews.purge` | `administrator/reviews/delete` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/metrics` | `administrator.metrics.show` | `administrator/metrics/show` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/customers` | `administrator.customers.paginate` | `administrator/customers/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/customers/:id` | `administrator.customers.show` | `administrator/customers/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PUT | `/administrator/customers/:id` | `administrator.customers.update` | `administrator/customers/update` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/addresses` | `administrator.addresses.paginate` | `administrator/addresses/paginate` | auth + role(OWNER\|ADMINISTRATOR) |
| GET | `/administrator/addresses/:id` | `administrator.addresses.show` | `administrator/addresses/show` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/administrators/:id/archive` | `administrator.lifecycle.administrators.archive` | `administrator/administrators/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/administrators/:id/unarchive` | `administrator.lifecycle.administrators.unarchive` | `administrator/administrators/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/administrators/:id` | `administrator.lifecycle.administrators.purge` | `administrator/administrators/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/companies/:id/archive` | `administrator.lifecycle.companies.archive` | `administrator/companies/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/companies/:id/unarchive` | `administrator.lifecycle.companies.unarchive` | `administrator/companies/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/companies/:id` | `administrator.lifecycle.companies.purge` | `administrator/companies/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/categories/:id/archive` | `administrator.lifecycle.categories.archive` | `administrator/categories/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/categories/:id/unarchive` | `administrator.lifecycle.categories.unarchive` | `administrator/categories/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/categories/:id` | `administrator.lifecycle.categories.purge` | `administrator/categories/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/subcategories/:id/archive` | `administrator.lifecycle.subcategories.archive` | `administrator/subcategories/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/subcategories/:id/unarchive` | `administrator.lifecycle.subcategories.unarchive` | `administrator/subcategories/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/subcategories/:id` | `administrator.lifecycle.subcategories.purge` | `administrator/subcategories/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/customers/:id/archive` | `administrator.lifecycle.customers.archive` | `administrator/customers/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/customers/:id/unarchive` | `administrator.lifecycle.customers.unarchive` | `administrator/customers/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/customers/:id` | `administrator.lifecycle.customers.purge` | `administrator/customers/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/certifications/:id/archive` | `administrator.lifecycle.certifications.archive` | `administrator/certifications/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/certifications/:id/unarchive` | `administrator.lifecycle.certifications.unarchive` | `administrator/certifications/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/certifications/:id` | `administrator.lifecycle.certifications.purge` | `administrator/certifications/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/products/:id/archive` | `administrator.lifecycle.products.archive` | `administrator/products/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/products/:id/unarchive` | `administrator.lifecycle.products.unarchive` | `administrator/products/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/products/:id` | `administrator.lifecycle.products.purge` | `administrator/products/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/territories/:id/archive` | `administrator.lifecycle.territories.archive` | `administrator/territories/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/territories/:id/unarchive` | `administrator.lifecycle.territories.unarchive` | `administrator/territories/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/territories/:id` | `administrator.lifecycle.territories.purge` | `administrator/territories/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/communities/:id/archive` | `administrator.lifecycle.communities.archive` | `administrator/communities/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/communities/:id/unarchive` | `administrator.lifecycle.communities.unarchive` | `administrator/communities/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/communities/:id` | `administrator.lifecycle.communities.purge` | `administrator/communities/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/materials/:id/archive` | `administrator.lifecycle.materials.archive` | `administrator/materials/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/materials/:id/unarchive` | `administrator.lifecycle.materials.unarchive` | `administrator/materials/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/materials/:id` | `administrator.lifecycle.materials.purge` | `administrator/materials/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/techniques/:id/archive` | `administrator.lifecycle.techniques.archive` | `administrator/techniques/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/techniques/:id/unarchive` | `administrator.lifecycle.techniques.unarchive` | `administrator/techniques/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/techniques/:id` | `administrator.lifecycle.techniques.purge` | `administrator/techniques/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/organizations/:id/archive` | `administrator.lifecycle.organizations.archive` | `administrator/organizations/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/organizations/:id/unarchive` | `administrator.lifecycle.organizations.unarchive` | `administrator/organizations/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/organizations/:id` | `administrator.lifecycle.organizations.purge` | `administrator/organizations/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |
| PATCH | `/administrator/producers/:id/archive` | `administrator.lifecycle.producers.archive` | `administrator/producers/archive` | auth + role(OWNER\|ADMINISTRATOR) |
| PATCH | `/administrator/producers/:id/unarchive` | `administrator.lifecycle.producers.unarchive` | `administrator/producers/unarchive` | auth + role(OWNER\|ADMINISTRATOR) |
| DELETE | `/administrator/producers/:id` | `administrator.lifecycle.producers.purge` | `administrator/producers/delete` | auth + role(OWNER\|ADMINISTRATOR) + role(OWNER) |

### `/company` — `auth()` + `role(COMPANY)` — 71 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| GET | `/company/categories` | `company.categories.paginate` | `company/categories/paginate` | auth + role(COMPANY) |
| GET | `/company/categories/:id` | `company.categories.show` | `company/categories/show` | auth + role(COMPANY) |
| GET | `/company/subcategories` | `company.subcategories.paginate` | `company/subcategories/paginate` | auth + role(COMPANY) |
| GET | `/company/subcategories/:id` | `company.subcategories.show` | `company/subcategories/show` | auth + role(COMPANY) |
| GET | `/company/addresses` | `company.addresses.paginate` | `company/addresses/paginate` | auth + role(COMPANY) |
| POST | `/company/addresses` | `company.addresses.create` | `company/addresses/create` | auth + role(COMPANY) |
| GET | `/company/addresses/:id` | `company.addresses.show` | `company/addresses/show` | auth + role(COMPANY) |
| PUT | `/company/addresses/:id` | `company.addresses.update` | `company/addresses/update` | auth + role(COMPANY) |
| PATCH | `/company/addresses/:id/archive` | `company.addresses.archive` | `company/addresses/archive` | auth + role(COMPANY) |
| PATCH | `/company/addresses/:id/unarchive` | `company.addresses.unarchive` | `company/addresses/unarchive` | auth + role(COMPANY) |
| DELETE | `/company/addresses/:id` | `company.addresses.purge` | `company/addresses/delete` | auth + role(COMPANY) |
| GET | `/company/products` | `company.products.paginate` | `company/products/paginate` | auth + role(COMPANY) |
| POST | `/company/products` | `company.products.create` | `company/products/create` | auth + role(COMPANY) |
| GET | `/company/products/:id` | `company.products.show` | `company/products/show` | auth + role(COMPANY) |
| PUT | `/company/products/:id` | `company.products.update` | `company/products/update` | auth + role(COMPANY) |
| PATCH | `/company/products/:id/archive` | `company.products.archive` | `company/products/archive` | auth + role(COMPANY) |
| PATCH | `/company/products/:id/unarchive` | `company.products.unarchive` | `company/products/unarchive` | auth + role(COMPANY) |
| DELETE | `/company/products/:id` | `company.products.purge` | `company/products/delete` | auth + role(COMPANY) |
| GET | `/company/orders` | `company.orders.paginate` | `company/orders/paginate` | auth + role(COMPANY) |
| GET | `/company/orders/:id` | `company.orders.show` | `company/orders/show` | auth + role(COMPANY) |
| PATCH | `/company/orders/:id/transition` | `company.orders.transition` | `company/orders/transition` | auth + role(COMPANY) |
| PATCH | `/company/orders/:id/pay` | `company.orders.pay` | `company/orders/pay` | auth + role(COMPANY) |
| GET | `/company/certifications` | `company.certifications.paginate` | `company/certifications/paginate` | auth + role(COMPANY) |
| GET | `/company/certifications/:id` | `company.certifications.show` | `company/certifications/show` | auth + role(COMPANY) |
| GET | `/company/territories` | `company.territories.paginate` | `company/territories/paginate` | auth + role(COMPANY) |
| GET | `/company/territories/:id` | `company.territories.show` | `company/territories/show` | auth + role(COMPANY) |
| GET | `/company/communities` | `company.communities.paginate` | `company/communities/paginate` | auth + role(COMPANY) |
| GET | `/company/communities/:id` | `company.communities.show` | `company/communities/show` | auth + role(COMPANY) |
| GET | `/company/materials` | `company.materials.paginate` | `company/materials/paginate` | auth + role(COMPANY) |
| GET | `/company/materials/:id` | `company.materials.show` | `company/materials/show` | auth + role(COMPANY) |
| GET | `/company/techniques` | `company.techniques.paginate` | `company/techniques/paginate` | auth + role(COMPANY) |
| GET | `/company/techniques/:id` | `company.techniques.show` | `company/techniques/show` | auth + role(COMPANY) |
| GET | `/company/organization` | `company.organization.show` | `company/organization/show` | auth + role(COMPANY) |
| PUT | `/company/organization` | `company.organization.update` | `company/organization/update` | auth + role(COMPANY) |
| GET | `/company/producers` | `company.producers.paginate` | `company/producers/paginate` | auth + role(COMPANY) |
| POST | `/company/producers` | `company.producers.create` | `company/producers/create` | auth + role(COMPANY) |
| POST | `/company/producers/link` | `company.producers.link` | `company/producers/link` | auth + role(COMPANY) |
| GET | `/company/producers/:id` | `company.producers.show` | `company/producers/show` | auth + role(COMPANY) |
| PUT | `/company/producers/:id` | `company.producers.update` | `company/producers/update` | auth + role(COMPANY) |
| DELETE | `/company/producers/:id/link` | `company.producers.unlink` | `company/producers/unlink` | auth + role(COMPANY) |
| PATCH | `/company/producers/:id/archive` | `company.producers.archive` | `company/producers/archive` | auth + role(COMPANY) |
| PATCH | `/company/producers/:id/unarchive` | `company.producers.unarchive` | `company/producers/unarchive` | auth + role(COMPANY) |
| DELETE | `/company/producers/:id` | `company.producers.purge` | `company/producers/delete` | auth + role(COMPANY) |
| GET | `/company/certification-grants` | `company.certificationGrants.paginate` | `company/certification-grants/paginate` | auth + role(COMPANY) |
| POST | `/company/certification-grants` | `company.certificationGrants.create` | `company/certification-grants/create` | auth + role(COMPANY) |
| GET | `/company/certification-grants/:id` | `company.certificationGrants.show` | `company/certification-grants/show` | auth + role(COMPANY) |
| PUT | `/company/certification-grants/:id` | `company.certificationGrants.update` | `company/certification-grants/update` | auth + role(COMPANY) |
| DELETE | `/company/certification-grants/:id` | `company.certificationGrants.purge` | `company/certification-grants/delete` | auth + role(COMPANY) |
| GET | `/company/sdgs` | `company.sdgs.paginate` | `company/sdgs/paginate` | auth + role(COMPANY) |
| GET | `/company/impact-projects` | `company.impactProjects.paginate` | `company/impact-projects/paginate` | auth + role(COMPANY) |
| POST | `/company/impact-projects` | `company.impactProjects.create` | `company/impact-projects/create` | auth + role(COMPANY) |
| GET | `/company/impact-projects/:id` | `company.impactProjects.show` | `company/impact-projects/show` | auth + role(COMPANY) |
| PUT | `/company/impact-projects/:id` | `company.impactProjects.update` | `company/impact-projects/update` | auth + role(COMPANY) |
| PATCH | `/company/impact-projects/:id/status` | `company.impactProjects.status` | `company/impact-projects/transition` | auth + role(COMPANY) |
| PATCH | `/company/impact-projects/:id/archive` | `company.impactProjects.archive` | `company/impact-projects/archive` | auth + role(COMPANY) |
| PATCH | `/company/impact-projects/:id/unarchive` | `company.impactProjects.unarchive` | `company/impact-projects/unarchive` | auth + role(COMPANY) |
| GET | `/company/impact-allocations` | `company.impactAllocations.paginate` | `company/impact-allocations/paginate` | auth + role(COMPANY) |
| POST | `/company/impact-allocations` | `company.impactAllocations.create` | `company/impact-allocations/create` | auth + role(COMPANY) |
| DELETE | `/company/impact-allocations/:id` | `company.impactAllocations.close` | `company/impact-allocations/close` | auth + role(COMPANY) |
| GET | `/company/impact-reports` | `company.impactReports.paginate` | `company/impact-reports/paginate` | auth + role(COMPANY) |
| POST | `/company/impact-reports` | `company.impactReports.create` | `company/impact-reports/create` | auth + role(COMPANY) |
| GET | `/company/impact-reports/:id` | `company.impactReports.show` | `company/impact-reports/show` | auth + role(COMPANY) |
| PUT | `/company/impact-reports/:id` | `company.impactReports.update` | `company/impact-reports/update` | auth + role(COMPANY) |
| PATCH | `/company/impact-reports/:id/publish` | `company.impactReports.publish` | `company/impact-reports/publish` | auth + role(COMPANY) |
| PATCH | `/company/impact-reports/:id/archive` | `company.impactReports.archive` | `company/impact-reports/archive` | auth + role(COMPANY) |
| GET | `/company/passports` | `company.passports.paginate` | `company/passports/paginate` | auth + role(COMPANY) |
| GET | `/company/passports/:id` | `company.passports.show` | `company/passports/show` | auth + role(COMPANY) |
| POST | `/company/passports/:id` | `company.passports.generate` | `company/passports/generate` | auth + role(COMPANY) |
| PATCH | `/company/passports/:id/publish` | `company.passports.publish` | `company/passports/publish` | auth + role(COMPANY) |
| PATCH | `/company/passports/:id/unpublish` | `company.passports.unpublish` | `company/passports/unpublish` | auth + role(COMPANY) |
| GET | `/company/metrics` | `company.metrics.show` | `company/metrics/show` | auth + role(COMPANY) |

### `/customer` — `auth()` + `role(CUSTOMER)` — 8 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| POST | `/customer/orders` | `customer.orders.checkout` | `customer/orders/checkout` | auth + role(CUSTOMER) |
| GET | `/customer/orders` | `customer.orders.paginate` | `customer/orders/paginate` | auth + role(CUSTOMER) |
| GET | `/customer/orders/:id` | `customer.orders.show` | `customer/orders/show` | auth + role(CUSTOMER) |
| PATCH | `/customer/orders/:id/cancel` | `customer.orders.cancel` | `customer/orders/cancel` | auth + role(CUSTOMER) |
| GET | `/customer/addresses` | `customer.addresses.paginate` | `company/addresses/paginate` | auth + role(CUSTOMER) |
| POST | `/customer/addresses` | `customer.addresses.create` | `company/addresses/create` | auth + role(CUSTOMER) |
| GET | `/customer/addresses/:id` | `customer.addresses.show` | `company/addresses/show` | auth + role(CUSTOMER) |
| PUT | `/customer/addresses/:id` | `customer.addresses.update` | `company/addresses/update` | auth + role(CUSTOMER) |

### `/producer` — `auth()` + `role(PRODUCER)` — 21 rotas

| Método | Caminho | Nome | Controller | Middleware |
|---|---|---|---|---|
| GET | `/producer/profile` | `producer.profile.show` | `producer/profile/show` | auth + role(PRODUCER) |
| PUT | `/producer/profile` | `producer.profile.update` | `producer/profile/update` | auth + role(PRODUCER) |
| GET | `/producer/organization` | `producer.organization.show` | `producer/organization/show` | auth + role(PRODUCER) |
| GET | `/producer/products` | `producer.products.paginate` | `producer/products/paginate` | auth + role(PRODUCER) |
| POST | `/producer/products` | `producer.products.create` | `producer/products/create` | auth + role(PRODUCER) |
| GET | `/producer/products/:id` | `producer.products.show` | `producer/products/show` | auth + role(PRODUCER) |
| PUT | `/producer/products/:id` | `producer.products.update` | `producer/products/update` | auth + role(PRODUCER) |
| PATCH | `/producer/products/:id/archive` | `producer.products.archive` | `producer/products/archive` | auth + role(PRODUCER) |
| PATCH | `/producer/products/:id/unarchive` | `producer.products.unarchive` | `producer/products/unarchive` | auth + role(PRODUCER) |
| GET | `/producer/categories` | `producer.categories.paginate` | `producer/categories/paginate` | auth + role(PRODUCER) |
| GET | `/producer/categories/:id` | `producer.categories.show` | `producer/categories/show` | auth + role(PRODUCER) |
| GET | `/producer/subcategories` | `producer.subcategories.paginate` | `producer/subcategories/paginate` | auth + role(PRODUCER) |
| GET | `/producer/subcategories/:id` | `producer.subcategories.show` | `producer/subcategories/show` | auth + role(PRODUCER) |
| GET | `/producer/territories` | `producer.territories.paginate` | `producer/territories/paginate` | auth + role(PRODUCER) |
| GET | `/producer/territories/:id` | `producer.territories.show` | `producer/territories/show` | auth + role(PRODUCER) |
| GET | `/producer/communities` | `producer.communities.paginate` | `producer/communities/paginate` | auth + role(PRODUCER) |
| GET | `/producer/communities/:id` | `producer.communities.show` | `producer/communities/show` | auth + role(PRODUCER) |
| GET | `/producer/materials` | `producer.materials.paginate` | `producer/materials/paginate` | auth + role(PRODUCER) |
| GET | `/producer/materials/:id` | `producer.materials.show` | `producer/materials/show` | auth + role(PRODUCER) |
| GET | `/producer/techniques` | `producer.techniques.paginate` | `producer/techniques/paginate` | auth + role(PRODUCER) |
| GET | `/producer/techniques/:id` | `producer.techniques.show` | `producer/techniques/show` | auth + role(PRODUCER) |

**Total: 238 rotas.**
