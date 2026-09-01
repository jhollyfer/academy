# Maiyu Academy

Escola de tecnologia em Benjamin Constant, no Amazonas. Cursos presenciais de
robótica e desenvolvimento web, aos sábados.

O repositório tem dois projetos independentes, no padrão de `simple-hub` e
`adacaibs`: cada um tem o próprio `package.json`, o próprio lockfile e o próprio
Dockerfile. Não há workspace na raiz, e é de propósito.

| Diretório   | O que é                                                              |
| ----------- | -------------------------------------------------------------------- |
| `backend/`  | API em AdonisJS, vertical slice. Landing, matrícula e painel          |
| `frontend/` | TanStack Start. Site público e painel da secretaria                   |

O produto anterior ("Tech Class") - `backend-old/`, `frontend-old/` e `aulas/` -
foi removido do repositório. Está no histórico, no commit anterior à remoção,
para quem precisar recuperar alguma coisa.

## Subindo local

O backend precisa de Postgres e MinIO. Os dois vêm do compose, nas portas 5434 e
9004/9005 - `simple-hub` e `adacaibs` rodam na mesma máquina e já ocupam as
anteriores.

```bash
cd backend
cp .env.example .env
docker compose up -d
pnpm install
node ace migration:fresh --seed   # cria os dois cursos e a turma de estreia
pnpm dev                          # http://localhost:3333
```

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev                          # http://localhost:3000
```

O painel entra em `/authentication`. O dono nasce do seeder:
`administrator@mail.com` / `Administrator1!`.

## Documentação da API

`http://localhost:3333/documentation`. O `openapi.json` é gerado por
`node ace openapi:generate` e commitado - o CI reprova quem mexe numa rota e não
o regenera.

## Testes

```bash
cd backend  && node ace test   # funcional, contra Postgres e MinIO de verdade
cd frontend && pnpm test
```

O banco de teste é separado do de desenvolvimento. Crie uma vez:

```bash
docker compose exec database createdb -U academy academy_test
```

## Deploy

Push em `main` dispara o `main.yml`: confere o backend, builda o frontend,
publica as duas imagens no Docker Hub e chama o deploy no Coolify. O endereço da
API vive em `frontend/.env.production` e é embutido no build - trocar de
endereço exige rebuild da imagem.
