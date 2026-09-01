# Infra, ambiente e CI/CD no padrão `simple-hub`

O `backend-old/` e o `frontend-old/` já foram portados para o padrão do projeto de
referência e auditados arquivo por arquivo (AD-001, AD-029, AD-046). A camada
que ninguém tinha portado é a de **fora do código da aplicação**: o `.github/`,
a forma de declarar variável de ambiente na infra local, e o caminho que vai da
imagem ao deploy.

Este documento mapeia essa camada nos dois projetos, registra o delta e diz o
que fazer com ele.

## 1. O que este documento cobre

| Camada | Onde está documentada |
|---|---|
| Arquitetura do backend, feature a feature | `ARQUITETURA-SIMPLE-HUB-BACKEND.md` |
| Arquitetura do frontend, rota a rota | `SIMPLE_HUB_FRONTEND_MAP.md` |
| Como conduzir um porte | `MIGRACAO-PLAYBOOK.md`, `MIGRACAO-PARA-O-PADRAO-SIMPLE-HUB.md` |
| **Workflows, env, Docker, registry e deploy** | **este arquivo** |

Nada de app-level é repetido aqui. Quando precisar do porquê de uma decisão de
código, o ponteiro está na tabela acima; as decisões ficam em `.specs/STATE.md`.

## 2. A camada de infra do `simple-hub`

### 2.1 Os sete workflows

O repositório de referência não tem raiz de workspace: sem `package.json`, sem
`pnpm-workspace.yaml`, sem `docker-compose.yml` na raiz. `backend-old/` e
`frontend-old/` são dois projetos pnpm independentes, e o `.github/` é o único lugar
que conhece os dois. Dentro dele há **só** `workflows/` — sem `actions/`
composta, sem `dependabot.yml`, sem `CODEOWNERS`, sem template de issue ou PR.

| Arquivo | Gatilho | Papel |
|---|---|---|
| `ci.yml` | `pull_request` → `main` | Régua de PR |
| `main.yml` | `push` → `main` | Orquestrador; só chama os outros |
| `main-check-backend.yml` | `workflow_call` | Lint, tipos e documento OpenAPI do backend |
| `main-build-frontend.yml` | `workflow_call` | Build do frontend e artifact do `.output/` |
| `main-docker-backend.yml` | `workflow_call` + 2 secrets | Imagem da API no Docker Hub |
| `main-docker-frontend.yml` | `workflow_call` + 2 secrets | Imagem do app no Docker Hub |
| `main-deploy-coolify.yml` | `workflow_call` + 1 secret | Dois `curl` para o Coolify |

O grafo do `main.yml`:

```
check-backend ──▶ docker-backend ──┐
                                   ├──▶ deploy-to-coolify
build-frontend ─▶ docker-frontend ─┘
```

As duas imagens antes do deploy, e não em paralelo com ele: implantar o
frontend contra uma API que falhou o build é publicar meia versão.

O `ci.yml` chama **a mesma** reusable de backend que o push em `main` chama. É o
princípio declarado no arquivo: o PR não passa por uma régua diferente da do
deploy. O job de frontend do PR é inline, e não a reusable de build, porque as
duas fazem coisas diferentes — o PR confere lint e tipos, o push empacota.

Nenhum workflow tem `workflow_dispatch`, `schedule`, `concurrency`,
`permissions` ou `environment`. Nenhum usa `vars.*`: toda configuração
não-secreta está literal no YAML. Nenhuma action está pinada por SHA — todas por
tag major.

### 2.2 Cache, em três mecanismos

1. **Store do pnpm**, por `actions/setup-node` com `cache: "pnpm"` e
   `cache-dependency-path` apontando para `backend-old/pnpm-lock.yaml` ou
   `frontend-old/pnpm-lock.yaml`. O caminho é explícito porque não há lockfile na
   raiz.
2. **BuildKit no GHA**, `cache-from`/`cache-to` com `scope=backend` e
   `scope=frontend` separados, para uma imagem não invalidar a outra.
3. **Artifact** `frontend-build`, `retention-days: 1`,
   `include-hidden-files: true`, levando `frontend-old/.output/` do job de build ao
   job de imagem. É o único dado que atravessa jobs.

### 2.3 As duas imagens

**API** — `backend-old/Dockerfile-production`, multi-stage, `node:24-alpine` nos
dois estágios. O build acontece **dentro da imagem**, e não no runner: a imagem
é multi-arquitetura e o projeto tem dependência com binário nativo (`@swc/core`),
então um `node_modules` compilado no runner amd64 não roda na variante arm64.
Compilando por estágio, cada arquitetura instala o binário dela.

Detalhes que valem repetir porque quebram sozinhos:

- O estágio de build declara em `ENV` os valores que `start/env.ts` exige, porque
  `node ace build` boota a aplicação. `APP_KEY` fica na **linha do `RUN`**, e não
  em `ENV`: em `ENV` viraria metadado da imagem.
- O install de produção roda dentro de `build/`, com o `pnpm-workspace.yaml`
  copiado para lá — sem ele o pnpm sobe até a raiz e a imagem final sai sem
  `node_modules`.
- `USER node`, `EXPOSE 3333`, `HEALTHCHECK` batendo em `/health`.
- **Sem `ENTRYPOINT`**: migration não roda no start do container. Subir uma
  réplica não pode ser o mesmo evento que alterar o schema.

**App** — `frontend-old/Dockerfile-production`, single-stage. Só copia o `.output/`
pronto, cria o usuário `nitro` (uid 1001), `EXPOSE 3000`,
`CMD ["node", ".output/server/index.mjs"]`. O `.dockerignore` lista `.output`,
que é exatamente o que o Dockerfile copia — por isso o workflow roda
`rm -f frontend/.dockerignore` antes do build, e por isso um `docker build`
local do frontend falha sem remover o arquivo.

### 2.4 Registry e deploy

Docker Hub como registry, **Coolify self-hosted** como plataforma. Não há VPS
por SSH, Fly, Vercel nem `docker compose` remoto no pipeline.

Tags fixas em `:latest`, sem SHA e sem semver — o que significa que **rollback
pelo registry não existe**; quem reverte é o Coolify.

O deploy é `curl -fsS -X POST https://<coolify>/api/v1/deploy` com
`Authorization: Bearer` e corpo `{"uuid":"<aplicação>","force":false}`. Duas
sutilezas que já custaram deploy silencioso:

- `-f` é o que faz o passo reprovar. Sem ele o `curl` sai com código 0 mesmo em
  401 ou 404, e um deploy que nunca aconteceu aparece verde no histórico.
- POST, e não GET: desde o Coolify v4.2 a rota GET existe só para devolver 405.

E o job fica verde assim que a API aceita o gatilho — ele não espera o deploy
terminar.

### 2.5 O compose

O `simple-hub` também não tem compose na raiz: o único é
`backend-old/docker-compose.yml`, e o frontend não aparece nele. Sobe só a infra —
`database` (Postgres 16), `storage` (MinIO) e `storage-bootstrap` (um `mc` que
cria os buckets, libera leitura anônima e sai). A API em desenvolvimento é o
`pnpm dev`.

## 3. Inventário de variáveis de ambiente

### 3.1 Backend — as 17 validadas em `start/env.ts`

São as mesmas nos dois projetos, com a mesma obrigatoriedade. Esta é a lista
canônica: o que não está aqui não é lido por `env.get`.

| Variável | Validador | Exigida |
|---|---|---|
| `NODE_ENV` | `enum(['development','production','test'])` | sim |
| `PORT` | `number()` | sim |
| `HOST` | `string({ format: 'host' })` | sim |
| `LOG_LEVEL` | `string()` | sim |
| `APP_KEY` | `secret()` | sim |
| `APP_URL` | `string({ format: 'url', tld: false })` | sim |
| `SESSION_DRIVER` | `enum(['cookie','memory','database'])` | sim |
| `CORS_ORIGIN` | `string.optional()` | não |
| `DATABASE_URL` | `string()` | sim |
| `DATABASE_SSL` | `boolean.optional()` | não |
| `UPLOAD_MAX_SIZE` | `number()` | **sim, de propósito** |
| `STORAGE_KEY` | `string.optional()` | não |
| `STORAGE_SECRET` | `string.optional()` | não |
| `STORAGE_BUCKET` | `string.optional()` | não |
| `STORAGE_ENDPOINT` | `string.optional()` | não |
| `STORAGE_CDN_URL` | `string.optional()` | não |
| `STORAGE_FORCE_PATH_STYLE` | `boolean.optional()` | não |

`TZ` aparece no `.env` dos dois projetos e no schema de nenhum: quem a lê é o
Node, não o Adonis.

### 3.2 Backend — as que só o compose usa

Não passam por `Env.create`; são interpoladas no YAML a partir do `.env` do
diretório do arquivo.

| Variável | Default `simple-hub` | Default adacaibs |
|---|---|---|
| `DB_PORT` | 5432 | **5433** |
| `STORAGE_PORT` | 9000 | **9002** |
| `STORAGE_CONSOLE_PORT` | 9001 | **9003** |
| `STORAGE_CORS_ORIGIN` | `*` | `*` |
| `STORAGE_KEY` / `STORAGE_SECRET` / `STORAGE_BUCKET` | reaproveitadas do schema | idem |

As portas do adacaibs são outras por AD-013: o `simple-hub` roda na mesma
máquina e ocupa as padrão. O **nome** e o mecanismo são os mesmos; o valor é
que difere.

### 3.3 Frontend — uma variável

`VITE_API_URL`, e só. Lida em um lugar
(`src/integrations/tanstack-query/http.ts`), com fallback para
`http://localhost:3333`, e tipada em `src/vite-env.d.ts`. Não há `src/env.ts`,
não há validação em runtime, `process.env` não aparece em `src/`.

Três arquivos: `.env` ignorado pelo git, `.env.example` e `.env.production`
versionados. `.env.production` é versionado de propósito — o prefixo `VITE_`
embute o valor no bundle, então nada ali é segredo por definição.

E é embutida em **tempo de build**. Trocar a variável do container não muda
nada; mudar de endereço exige rebuild da imagem. Como o Nitro renderiza a
primeira navegação no servidor, o endereço precisa resolver dos dois lados —
rede interna do Docker não serve.

### 3.4 CI — os nove placeholders

`openapi:generate` roda com `startApp`, ou seja, boota a aplicação, e o boot
valida `start/env.ts`. Os nove valores existem só para o schema passar: o
comando lê rotas e schemas VineJS, não toca no banco nem no bucket.

`NODE_ENV=development`, `PORT=3333`, `HOST=0.0.0.0`, `LOG_LEVEL=info`,
`APP_KEY=ci-placeholder-sem-uso-fora-deste-job`, `APP_URL=http://localhost:3333`,
`SESSION_DRIVER=cookie`, `DATABASE_URL=postgres://ci:ci@localhost:5432/ci`,
`UPLOAD_MAX_SIZE=1073741824`.

No adacaibs esse bloco fica **no passo**, e não no job. Motivo na §5.

## 4. Delta adacaibs ↔ `simple-hub`

### 4.1 O que já estava alinhado

- **As 17 variáveis do backend**, nome por nome e obrigatoriedade por
  obrigatoriedade (AD-011).
- **`VITE_API_URL`** no frontend, mesmo nome, mesmo fallback, mesmos três
  arquivos.
- **Os dois `Dockerfile-production`**, incluindo o comentário sobre o binário
  nativo e a ausência de `ENTRYPOINT`.
- **Os dois `.dockerignore`** e o `pnpm-workspace.yaml` de cada lado.
- **`frontend-old/scripts/check-chunk-cycles.mjs`**, o guarda de leitura antecipada
  entre chunks em ciclo.

Ou seja: o pedido "mesmos nomes de env" já estava satisfeito no backend e no
frontend. O que faltava era a camada de compose e o `.github/`.

### 4.2 O que mudou

**`.github/workflows/` — cinco arquivos criados, dois reescritos.**

| Arquivo | Antes | Depois |
|---|---|---|
| `main.yml` | não existia | orquestrador de 5 jobs |
| `main-check-backend.yml` | não existia | lint, tipos, OpenAPI e **suíte** |
| `main-docker-backend.yml` | não existia | `adacaibs-api:latest` |
| `main-docker-frontend.yml` | não existia | `adacaibs-app:latest` |
| `main-deploy-coolify.yml` | não existia | dois `curl` |
| `ci.yml` | só frontend | ganhou `backend-check` |
| `main-build-frontend.yml` | `push` + filtro de `paths` | `workflow_call` |

O `main-build-frontend.yml` trazia um comentário dizendo que respondia ao push
porque "a cadeia de deploy ainda não existe neste projeto". A cadeia passou a
existir, e dois gatilhos para o mesmo build rodariam o mesmo trabalho duas
vezes; o comentário foi substituído pelo motivo novo.

**`backend-old/docker-compose.yml`** — as três portas passaram de número cravado
para `${DB_PORT:-5433}`, `${STORAGE_PORT:-9002}` e
`${STORAGE_CONSOLE_PORT:-9003}`, e o serviço `database` ganhou `env_file: .env`.
O valor publicado não mudou: quem não declarar nada continua em 5433/9002/9003.

**`backend-old/.env`, `.env.example` e `.env.test`** — reescritos como espelho dos
da referência: mesma ordem, mesmos cabeçalhos de seção, mesmo texto de
comentário, trocando só o valor. O `.env` local, que aqui havia virado cópia do
`.env.example`, voltou a ser a versão enxuta de 29 linhas que a referência
mantém — a prosa mora no `.env.example`.

As quatro variáveis de compose (`DB_PORT`, `STORAGE_PORT`,
`STORAGE_CONSOLE_PORT`, `STORAGE_CORS_ORIGIN`) **não** são declaradas no
`.env.example`, porque a referência também não as declara: o compose as
interpola com default e quem não mexer não precisa saber que existem. Os
defaults daqui já são 5433/9002/9003.

**`backend-old/infra/r2-cors.json`** — criado. O `simple-hub` tem, o adacaibs não
tinha. Sem essa política, o upload presigned multipart em produção morre no
preflight do `PUT`: o navegador envia cada parte direto ao bucket. Não é
aplicado por deploy — é colado à mão no painel do provedor.

## 5. Divergências deliberadas contra a referência

A regra do projeto é que o código da referência vence a doc e vence "o jeito
melhor". Ela tem uma exceção já registrada em AD-050: quando seguir a referência
**pioraria** o código, o motivo escrito vale mais que a cópia. Estes são os
quatro casos.

**pnpm 11.21.0, e não 11.13.0.** A referência crava `11.13.0` no
`pnpm/action-setup` e no `corepack prepare` do Dockerfile, enquanto os dois
`package.json` dela declaram `packageManager: pnpm@11.21.0`. CI e imagem rodam
num pnpm diferente do declarado. O adacaibs usa 11.21.0 nos três lugares.

**`pnpm test` roda no CI.** A referência não invoca teste em workflow nenhum,
embora os dois lados tenham suíte. No adacaibs o frontend já rodava `pnpm test`
no `ci.yml`, e o backend passou a rodar dentro da reusable de check — que é
compartilhada entre PR e push, então a suíte reprova os dois caminhos.

**O bloco `env` do check fica no passo, e não no job.** Na referência ele é de
job, o que é inofensivo lá porque não há passo de teste. Aqui haveria: variável
de processo tem precedência sobre arquivo, então um `DATABASE_URL` de job
venceria o `.env.test` e a suíte apontaria para um banco que não existe. O
passo de OpenAPI leva os nove placeholders; o de teste leva só as cinco que o
`.env.test` não traz.

**O hook de pre-commit permanece.** A referência não tem `.husky/`. O adacaibs
tem, rodando `lint && typecheck && openapi:generate --check && test`. Tirá-lo
para ficar igual removeria uma barreira sem ganhar nada — e o CI cobre o mesmo
terreno depois, não antes.

E uma divergência que não é escolha: **as portas 5433/9002/9003** (AD-013), pelo
`simple-hub` rodar na mesma máquina.

## 6. O que se configura fora do repositório

### 6.1 Secrets do GitHub

Três, os mesmos da referência. Em *Settings → Secrets and variables → Actions*:

| Secret | Onde é usado |
|---|---|
| `DOCKERHUB_USERNAME` | login **e** namespace da tag das duas imagens |
| `DOCKERHUB_TOKEN` | login no Docker Hub |
| `COOLIFY_TOKEN` | `Authorization: Bearer` dos dois `curl` |

Nenhuma `vars.*`.

### 6.2 Os UUIDs do Coolify

`main-deploy-coolify.yml` está no repositório com dois marcadores:
`COOLIFY_UUID_API_ADACAIBS` e `COOLIFY_UUID_APP_ADACAIBS`.

**O UUID é da aplicação, não da instância.** A instância é a mesma do
`simple-hub` (`coolify.simple.tec.br`), mas cada aplicação tem o seu — e usar os
da referência faz cada push em `main` do adacaibs redeployar o `simple-hub`. O
valor está na URL da aplicação no painel:

```
https://coolify.simple.tec.br/project/<projeto>/application/<UUID>
```

Enquanto os marcadores estiverem lá, o passo falha em 404 e nada é implantado —
que é o comportamento certo para um valor que ninguém preencheu.

### 6.3 Variáveis de produção da API, no Coolify

Os nomes são os da §3.1, e a aplicação não sobe sem os exigidos. Os que pedem
atenção:

- `HOST=0.0.0.0`. Em container, `localhost` só aceita conexão de dentro do
  próprio container, e o proxy nunca chega.
- `APP_KEY` — gerada com `node ace generate:key`, nunca a de build.
- `CORS_ORIGIN` — precisa conter o domínio do frontend. Curinga não é opção: a
  API usa cookie, e o protocolo recusa `*` quando a requisição leva credencial.
- `STORAGE_CDN_URL` — sem ela a `url` derivada de cada arquivo aponta para a API
  S3, que exige requisição assinada, e responde 401 dentro de um `<img>`.
- `STORAGE_FORCE_PATH_STYLE=false` em bucket gerenciado; `true` só no MinIO.
- `DATABASE_SSL` — decisão de onde o banco está, não de ambiente. Banco na mesma
  rede privada normalmente não fala TLS; gerenciado normalmente exige.

O **frontend não recebe variável de ambiente em runtime**. `VITE_API_URL` é
embutida no bundle a partir do `frontend-old/.env.production` versionado; mudar o
endereço da API é editar aquele arquivo e refazer a imagem.

### 6.4 Pré-deploy e CORS do bucket

Comando de pré-deploy da aplicação da API, no Coolify:

```
node ace migration:run --force
```

Fica na plataforma porque o `Dockerfile-production` não tem `ENTRYPOINT` de
propósito: subir uma réplica não pode ser o mesmo evento que alterar o schema.

E a política CORS do bucket de produção, de `backend-old/infra/r2-cors.json`, colada
no painel do provedor (R2, S3, Spaces). Sem ela, o preflight do `PUT` de cada
parte morre antes de qualquer byte sair.

## 7. Passo a passo, na ordem

1. **Criar os três secrets** no repositório (§6.1). Sem eles o `main.yml`
   reprova no primeiro job de imagem.
2. **Criar as duas aplicações no Coolify** e substituir os dois marcadores em
   `main-deploy-coolify.yml` pelos UUIDs (§6.2).
3. **Preencher as variáveis de produção** da aplicação da API (§6.3) e o comando
   de pré-deploy (§6.4).
4. **Colar a política CORS** no bucket de produção (§6.4).
5. **Conferir `frontend-old/.env.production`** — hoje aponta para
   `https://api.adacaibs.com.br`. Se o domínio da API for outro, é aqui que se
   corrige, antes do primeiro build de imagem.
6. **Abrir um PR** e ver o `ci.yml` verde com os dois jobs. É a prova barata da
   metade da cadeia: a reusable de backend que o PR usa é a mesma do deploy.
7. **Merge em `main`.** O `main.yml` roda os cinco jobs; os dois primeiros já
   foram provados no passo anterior.

## 8. Verificação

| # | O que rodar | O que tem de acontecer |
|---|---|---|
| 1 | `cd backend && docker compose up -d` | portas 5433, 9002 e 9003 publicadas, como antes |
| 2 | `DB_PORT=5434 docker compose up -d` | Postgres em 5434; prova que a variável é lida |
| 3 | `cd backend && pnpm test` | suíte verde contra o compose, depois do mexido no YAML |
| 4 | `cd backend && node ace openapi:generate --check` | passa; é o mesmo passo do CI |
| 5 | `actionlint .github/workflows/*.yml` | sem achado |
| 6 | PR contra `main` | **dois** jobs no check, `backend-check` chegando ao teste verde |
| 7 | push em `main` | os cinco jobs; o de deploy só depois dos UUIDs preenchidos |

O item 7 é o único que não se prova localmente, e é o que pede os UUIDs certos
antes de rodar.
