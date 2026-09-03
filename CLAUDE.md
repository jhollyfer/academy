# Maiyu Academy

Escola de tecnologia em Benjamin Constant, no Alto Solimões. Cursos presenciais
de robótica e desenvolvimento web, aos sábados.

Dois projetos independentes num repositório, no padrão de `simple-hub` e
`adacaibs`: cada um com o próprio `package.json`, lockfile e Dockerfile. **Não
há workspace na raiz**, e é de propósito.

| Diretório   | O que é                                                     |
| ----------- | ----------------------------------------------------------- |
| `backend/`  | API em AdonisJS 7, vertical slice por feature                |
| `frontend/` | TanStack Start (React 19) sobre Vite e Nitro                 |

## A regra zero

**A referência é a régua, e o código dela vence a documentação sobre ela.**
Antes de escrever um arquivo, abra o equivalente em `../simple-hub` ou
`../adacaibs` e leia inteiro. Onde as duas divergirem: `adacaibs` para o core
(`app/core/openapi`, config de banco, cobertura de teste), `simple-hub` para
arquitetura de features em escala.

Divergência deliberada vai para o JSDoc do arquivo, não só para o commit.

## Comandos

```bash
# raiz
pnpm dev:backend / dev:frontend      pnpm test:backend / test:frontend
pnpm check:backend / check:frontend  # lint + typecheck

# backend
docker compose up -d                 # Postgres 5434, MinIO 9004/9005, Redis 6382
node ace migration:fresh --seed      # dois cursos e a turma de estreia
node ace openapi:generate            # artefato commitado; o CI reprova sem
node ace test                        # funcional, contra Postgres e MinIO reais
node ace queue:work                  # o worker da fila de e-mail

# frontend
pnpm build                           # regenera routeTree.gen.ts, que é commitado
pnpm check-cycles                    # lê .output/, então roda depois do build
```

Portas próprias (AD-013): `simple-hub` ocupa 5432/9000-9001/6379 e `adacaibs`
5433/9002-9003 na mesma máquina.

O painel entra em `/authentication`. O dono nasce do seeder:
`administrator@mail.com` / `Administrator1!`.

## Backend

### Forma de uma feature

`app/features/<módulo>/<recurso>/<ação>.{controller,use-case}.ts`, **um arquivo
por ação**. Sem validator, policy ou serializer por pasta: o schema mora em
`#core/validator`, a resposta em `#core/response`.

- **Use-case**: `type Payload` e `type Response = Either<HTTPException, X>` no
  topo, `@inject()`, um método `execute`. Falha de negócio é
  `left(HTTPException.Fábrica('msg', 'CODE'))`, **nunca** `throw`. O `catch`
  final loga com `logger.error` e devolve `InternalServerError`.
- **Controller**: `static docs = defineDocs({...})` com prosa em português.
  **Não** declara `errors` — `openapi/introspect.ts` colhe os códigos do
  use-case irmão por AST. Importa o irmão com caminho relativo e extensão
  (`./sign-in.use-case.ts`).

### O que é gerado e commitado

`database/schema.ts` (por `migration:run`), `.adonisjs/**` (pelo hook `init` de
qualquer comando ace) e `openapi.json` (por `openapi:generate`). Mexeu em rota
ou controller, regenere no **mesmo** commit — o CI roda `--check` e os testes
nem compilam sem o registry do Tuyau.

### Autenticação

Guard próprio por **cookie**, não Bearer: `cookie-access-tokens.guard.ts` lê o
token do cookie `httpOnly`, confere `name === 'access-token'` e recusa conta
`deletedAt` ou `status !== ACTIVE`. Access dura 1 dia, refresh 7, e
`POST /authentication/refresh` **rotaciona com reivindicação atômica** — quem
apaga a linha do refresh usado ganha o direito de emitir o par novo.

`role()` vai no **grupo**, nunca no endpoint, e sempre depois de `auth()`: sem
sessão o papel é desconhecido, e a resposta certa é 401 e não 403. Regra por
registro que `role()` não expressa vai para `app/policies/` (Bouncer).

`/account` edita a própria conta e é o único caminho para trocar a própria
senha — exige `currentPassword`, e trocar e-mail ou senha revoga todas as
sessões. O update de usuários recusa `password` de propósito.

### Escrita anônima

Duas rotas escrevem sem sessão: `POST /storefront/enrollments` e o upload por
`:protocol`. A credencial da segunda é o `protocol` — um uuid que só chegou a
quem se inscreveu — resolvido por `enrollment_protocol_middleware`, que valida
o **formato** antes de consultar (a coluna é `uuid`, e uma string qualquer faz
o Postgres recusar a query e virar 500). As quatro portas abertas têm teto de
tentativa em `start/limiter.ts`.

## Frontend

- **Guard único** em `_private/layout.tsx`, com `ensureQueryData` (não
  `prefetchQuery`, que engole o erro). Redireciona só em 401/403 — 5xx e queda
  de rede sobem para o `defaultErrorComponent`.
- **`getRouteApi('/rota')` no escopo do módulo**, nunca importar o `Route` de
  volta do arquivo de rota: o ciclo de chunk que isso cria devolve `undefined`
  no primeiro SSR, e `check-chunk-cycles.mjs` reprova.
- **Estado de listagem na URL**, via `withExtra([...] as const)`.
- **404 de negócio é `notFound()` no loader**; toda rota de detalhe declara o
  `notFoundComponent` próprio.
- **Formulários**: `useResourceForm` + VineJS, `mode: 'onTouched'`. Edição valida
  com o validator de **criação**. Todo campo usa
  `{...invalidProps(fieldState.invalid, name)}` e `<FieldError id={errorId(name)}>`
  — o par liga `aria-invalid` e `aria-describedby` junto, e é o que faz a regra
  `[aria-invalid='true']:focus-visible` do `styles.css` desempatar o anel de
  foco com a borda de erro.
- **`components/common/` mede o ancestral comum dos consumidores**, não o nível
  hierárquico: só sobe o que mais de uma rota alcança. O critério está em
  `src/components/common/CLAUDE.md`.
- **`components/ui/` é território do shadcn** — nunca editar à mão.

## Estilo de código

Quatro regras cobradas pelo ESLint, iguais nos três projetos: `no-ternary`,
`no-explicit-any`, `consistent-type-assertions: never` (nada de `as`),
`consistent-type-definitions: type` (nunca `interface`). Combine tipos com
`Merge`, não com `&`. Prefira lookup object a cadeia de `if`.

Comentário explica **por quê**, não o quê — e de preferência com o defeito que
ele evita. Comentário que descreve o código é ruído; o que registra a decisão é
o que sobrevive.

Commits em Conventional Commits, **em português**, com escopo de domínio:
`fix(turmas):`, `feat(sessao):`, `test(validacao):`. O assunto diz o efeito, não
o arquivo. Sempre `git commit -- <pathspec>` explícito.

## Redes que cobram o que ninguém lembra

| Spec | O que reprova |
| --- | --- |
| `documentacao.spec.ts` | rota fora do documento, operação sem resposta, id duplicado |
| `mensagens.spec.ts` | mensagem de validação que escapou em inglês |
| `validator.spec.ts` | campo de texto sem teto, campo sem rótulo pt-BR, rótulo órfão |
| `validator-messages.test.ts` | o mesmo, do lado do frontend |
| `check-chunk-cycles.mjs` | ciclo de chunk que quebra o SSR |

Campo novo sem rótulo e rótulo que sobrou de um recurso removido **não quebram
nada** — e é por isso que a cobrança precisa ser automática.

## Produção

O que a plataforma faz e o repositório não:

- **`COOKIE_DOMAIN=.maiyu.com.br`** no serviço da API. Sem ela o cookie nasce
  host-only e o SSR do frontend nunca o recebe: todo F5 em rota privada desloga.
- **`node ace migration:run --force`** como comando de pré-deploy. O
  `Dockerfile-production` não tem `ENTRYPOINT` de propósito.
- **Um segundo serviço com `node ace queue:work`**, obrigatório quando
  `REDIS_URL` existe: sem ele `mail.sendLater()` enfileira convites que ninguém
  consome.

O deploy sai por `POST` no Coolify com `curl -fsS`. **Não volte para `GET`**: a
rota responde 405 desde a v4.2, e sem `-f` o passo fica verde sem publicar nada.

`PIX_KEY`, `PIX_MERCHANT` e `PIX_CITY` têm default no `pix.service.ts` com o
valor em uso. Nome e cidade têm teto de 25 e 15 caracteres pelo manual do Bacen,
sem acento — estourar faz o aplicativo do banco recusar o código inteiro.
