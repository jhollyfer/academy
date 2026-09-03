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
anteriores. O compose sobe também um Redis, na 6382, que só é usado se você
definir `REDIS_URL`: sem ela a fila roda em modo `sync` e o e-mail sai na
própria requisição.

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

As imagens saem com duas tags, `:latest` e `:<sha>`. A segunda existe para haver
a que voltar: com `:latest` sozinha, um rollback não tem alvo.

### O que a plataforma precisa fazer, e o repositório não faz

Três coisas moram no painel do Coolify e não no código. Nenhuma delas falha
barulhento - as três falham em silêncio.

- **`COOKIE_DOMAIN=.maiyu.com.br` no serviço da API.** Sem ela o cookie de
  sessão nasce host-only de `api-academy.maiyu.com.br`, e o SSR do frontend -
  que roda em `academy.maiyu.com.br` e é quem chama a API na primeira navegação
  - nunca o recebe. O sintoma é todo F5 em rota privada voltar para o login.
- **A migration, antes de subir o container novo.** O `Dockerfile-production`
  não tem `ENTRYPOINT` de propósito: quem migra é o comando de pré-deploy da
  plataforma, `node ace migration:run --force`.
- **Um segundo serviço rodando o worker**, com o mesmo `.env` da API e o comando
  `node ace queue:work`. Ele só é necessário quando `REDIS_URL` está definida -
  e aí é obrigatório: `mail.sendLater()` enfileira, e sem ninguém consumindo o
  convite de acesso nunca sai. Uma família fica esperando um link que não vem.
