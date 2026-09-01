# Migração para o padrão simple-hub — Validação

**Date**: 2026-09-01
**Spec**: `/home/jhollyfer/.claude/plans/concurrent-skipping-wall.md` (o plano faz papel de spec)
**Diff range**: `7226e1a..0cd041a` — duas rodadas de correção: sete commits na primeira, quatro na segunda
**Verifier**: passe independente fresh-eyes (sem sub-agentes, por instrução da sessão)

---

## Validation: migração para o padrão simple-hub — PASS

Os quatro gaps da primeira rodada foram fechados, mais dois achados que a
correção revelou. Resta um item, e ele não é código: a passagem ponta a ponta no
navegador, que é manual.

---

## Fases do plano

| Fase | Status | Evidência |
| ---- | ------ | --------- |
| F1 Fundação backend | ✅ | `backend/package.json:8` `pnpm@11.21.0`; `backend/adonisrc.ts:125` `httpControllers: 'app/features'`; `backend/docker-compose.yml:19` porta 5434; `backend/docker-compose.yml:63` 9004/9005 |
| F2 Migrations e models | ✅ | 10 migrations; `backend/database/migrations/1761885935168_create_users_table.ts:8` uuid PK via `uuid_generate_v4()` |
| F3 Piloto courses | ✅ | 7 ações em `backend/app/features/administrator/courses/`; `backend/tests/functional/administrator-courses.spec.ts:10` |
| F4 Resto do admin | ✅ | `classes`, `enrollments`, `storages`, `account`, `authentication`. Grade e FAQ sem recurso próprio: divergência justificada em `backend/app/features/_shared.syllabus.ts:7` |
| F5 Storefront público | ✅ | slices completos; aviso por e-mail em `backend/app/services/notification.service.ts:33`, disparado em `backend/app/features/storefront/enrollments/create.use-case.ts:124` |
| F6 Fundação frontend | ✅ | `frontend/tsconfig.json:22` só `#/*`; `frontend/components.json:4` `base-mira`; `frontend/vite.config.ts:34` `preset: 'node-server'` |
| F7 Landing pública | ✅ | 12 seções em `_public/-components/`; JSON-LD em `frontend/src/routes/_public/index.tsx`; sitemap em `frontend/src/routes/sitemap[.]xml.ts:22`; prerender em `frontend/vite.config.ts:47` |
| F8 Wizard de matrícula | ✅ | `frontend/src/routes/_public/matricula/index.tsx` + `$protocol.tsx`; multipart em `frontend/src/hooks/use-multipart-upload.ts` |
| F9 Painel admin | ✅ | `_private/` com dashboard, cursos, turmas e matrículas; guard em `_private/layout.tsx` |
| F10 CI/CD | ✅ | `main-check-backend.yml`, `ci.yml`, artefato `.output/`, `Dockerfile-production` nos dois projetos, seed em `backend/database/seeders/course_seeder.ts` |
| F11 Limpeza | ✅ | `backend-old/`, `frontend-old/`, `aulas/` e `base.md` removidos em `0a4793e` |

---

## Critérios de verificação do plano

| Critério (plano § Verificação) | Resultado esperado | Evidência | Resultado |
| ------------------------------ | ------------------ | --------- | --------- |
| 1. `node ace test` verde, com 401/403/404/409/422 por feature | todas passando | 98 testes. 401: `backend/tests/functional/storages.spec.ts:34`; **403**: `papeis.spec.ts:72`; 409 duplicata: `administrator-courses.spec.ts:48`; 409 não arquivado: `administrator-enrollments.spec.ts:305`; 422 em `?sort`: `administrator-courses.spec.ts:97`; 404: `storages.spec.ts:168` | ✅ |
| 2. Contrato OpenAPI bate com `start/routes.ts` | `openapi.json` gerado | `backend/openapi.json` presente e commitado | ✅ |
| 3. `pnpm build` + `pnpm lint` + `vitest` limpos no frontend | zero erro | build Nitro com 3 páginas prerenderizadas; eslint e `tsc --noEmit` limpos; 95 testes em 13 arquivos | ✅ |
| 4. Ponta a ponta local no navegador | fluxo completo home→admin | **não executado** — exige operação manual | ⏭️ |
| 5. Borda de capacidade → `WAITLIST` | turma cheia não estoura vaga | `backend/tests/functional/storefront-enrollments.spec.ts:69` | ✅ |
| 6. Auditoria de conformidade | deriva volta ao padrão, divergência vira JSDoc | deriva do layout de testes corrigida em `234bc91`; divergências em JSDoc: `backend/app/features/_shared.syllabus.ts:7`, `backend/start/routes.ts:137`, `backend/config/mail.ts:5` | ✅ |
| Menor de idade exige responsável | 422 com um erro por campo | `backend/tests/functional/storefront-enrollments.spec.ts:33` | ✅ |
| LGPD e aceite obrigatórios | 422 sem consentimento | `backend/tests/functional/storefront-enrollments.spec.ts:243` | ✅ |
| Upload presigned multipart | binário não passa pela API | `backend/tests/functional/storages.spec.ts:74` — `PUT` real no MinIO pela URL assinada | ✅ |
| Tamanho declarado é conferido | 422 e a linha morre junto | `backend/tests/functional/storages.spec.ts:107` | ✅ |
| Notificação para a secretaria | fila de e-mail | `backend/tests/functional/storefront-enrollments.spec.ts:307` — `sendLater` enfileira com o protocolo no corpo | ✅ |
| Allowlist de CORS | origem listada recebe o cabeçalho, e só ela | `backend/tests/functional/cors.spec.ts:17` e `:25` | ✅ |
| Sitemap | XML válido com as páginas e os cursos | `frontend/src/lib/sitemap.test.ts:12` | ✅ |

---

## Gaps da primeira rodada, e o que fechou cada um

| # | Gap | Fechamento |
| - | --- | ---------- |
| 1 | Fila de e-mail não existia | `73c3c42` — `@adonisjs/mail` com um mailer SMTP, `sendLater`, tudo opcional. Sem configuração, a matrícula segue e o aviso vira log |
| 2 | 4 slices sem teste | `8e47cdc` e `4f577a2` — storages (multipart real contra o MinIO), autenticação, conta, export CSV e a allowlist de CORS. 51 → 77 testes |
| 3 | F11 não executada | `0a4793e` — os quatro caminhos removidos, com o README ajustado |
| 4 | Sitemap e prerender ausentes | `8146765` — `/sitemap.xml` como rota de servidor e prerender de `/sobre`, `/termos` e `/privacidade` |
| 5 | `better-sqlite3` sobrando | **Leitura errada da primeira rodada.** Os dois repos de referência mantêm a dependência e o bloco sqlite comentado. Não era deriva; nada a fazer |

---

## Achados que a correção revelou

| Achado | Consequência | Fechamento |
| ------ | ------------ | ---------- |
| `.gitignore` da raiz era sobra do Next e trazia `.env*` | `frontend/.env.production` nunca foi versionado, e o `VITE_API_URL` é embutido em tempo de build: o build do CI sairia sem endereço de API | `090adac` — o arquivo sai inteiro (nenhuma referência tem `.gitignore` na raiz) e os quatro `.env` de exemplo entram |
| `.env.test` citava um `cors.spec.ts` que nunca existiu | A allowlist que decide se o cookie sobe do site para a API não tinha teste | `4f577a2` — o spec foi escrito, no formato do de adacaibs |
| Specs em pastas por papel, com grupo repetindo a rota | Deriva do padrão: as duas referências usam arquivo plano hifenizado e grupo `assunto > recorte` em pt-BR | `234bc91` — camada de teste achatada e renomeada |

---

## Discriminação (segunda rodada, sobre o código novo)

Worktree temporário em `HEAD`; árvore real intocada.

| # | File:line | Mutação | Morto? |
| - | --------- | ------- | ------ |
| 1 | `backend/app/services/notification.service.ts:37` | inverte o guard de "e-mail não configurado" — o aviso nunca sai | ✅ Morto (2 falhas) |
| 2 | `frontend/src/lib/sitemap.ts:30` | remove o escape de `&` | ✅ Morto (1 falha) |
| 3 | `backend/app/features/administrator/enrollments/export.use-case.ts:51` | remove o escape do separador no CSV | ✅ Morto (1 falha) |

Da primeira rodada, ainda válidos: idade legal (`create.use-case.ts:66`), vaga
(`_shared.seats.ts:62`) e ciclo de vida (`courses/delete.use-case.ts:29`) —
3/3 mortos.

**Resultado**: 6/6 mortos — ✅ PASS.

---

## Gate

| Gate | Comando | Resultado |
| ---- | ------- | --------- |
| Backend testes | `node ace test` | 98 passaram, 0 falharam (era 49 na auditoria inicial) |
| Backend tipos | `pnpm typecheck` | limpo |
| Backend lint | `pnpm lint` | limpo |
| Frontend tipos | `pnpm typecheck` | limpo |
| Frontend lint | `pnpm lint` | limpo |
| Frontend testes | `pnpm test` | 95 passaram, 13 arquivos (era 89) |
| Frontend build | `pnpm build` | `.output/` gerado, 3 páginas prerenderizadas |

Nenhum teste pulado, nenhuma asserção enfraquecida, nenhum teste removido.

---

## Divergências deliberadas (não são deriva)

| Divergência | Onde está justificada |
| ----------- | --------------------- |
| Grade e FAQ sincronizados no `POST`/`PUT` do curso | `backend/app/features/_shared.syllabus.ts:7` |
| Upload público escopado por `:protocol` | `backend/start/routes.ts:137` |
| `DELETE` exige `role(['OWNER'])` por verbo | `backend/start/routes.ts:213` |
| E-mail, que nenhuma referência tem | `backend/config/mail.ts:5` e `backend/app/services/notification.service.ts:9` |
| Sitemap e prerender, que nenhuma referência tem | `frontend/src/routes/sitemap[.]xml.ts:8` e `frontend/vite.config.ts:39` |
| `paraglide` não instalado | `frontend/vite.config.ts:14` |
| Tabela `users` com `role`, e não `admins` | segue a referência; a regra zero manda o código de referência vencer |

---

## Qualidade de código

| Princípio | Status |
| --------- | ------ |
| Sem funcionalidade além do pedido | ✅ |
| Sem abstração de uso único | ✅ |
| Só tocou o necessário | ✅ |
| Casa com o padrão de referência | ✅ |
| Testes mapeiam critérios do plano, não a implementação | ✅ |
| Valor afirmado bate com o resultado definido no plano | ✅ |
| Cobertura por camada: domínio 1:1, rotas com feliz + borda + erro | ✅ (na primeira rodada esta linha passou generosa: contava arquivos de teste, não ações exercitadas — corrigido na segunda) |
| Todo teste mapeia um requisito do plano | ✅ |

---

## Segunda rodada — o que a contagem por ação revelou

A primeira rodada marcou a cobertura por camada como ✅ contando **arquivos** de teste. Contando
**ação por ação**, dois buracos apareceram, e um deles escondia um defeito em produção.

| Achado | Consequência | Fechamento |
| ------ | ------------ | ---------- |
| **Zero `assertStatus(403)` na suíte inteira** | A matriz de papel de `start/routes.ts:241` — administrador arquiva, só o dono apaga — vivia só em JSDoc. Trocar `role(['OWNER'])` por `role(['OWNER','ADMINISTRATOR'])` passaria por teste, typecheck e lint | `84454ac` — `papeis.spec.ts` e a `database/factories/` que as referências têm e este repositório não tinha (sem uma segunda conta não existe o outro lado da asserção) |
| **`?search` na listagem de matrículas respondia 500** | `protocol` é `uuid` e o Postgres não tem `ILIKE` para o tipo: `operator does not exist: uuid ~~*` derrubava o `OR` inteiro. Qualquer busca do painel — por nome, e-mail ou protocolo — falhava. O JSDoc do use-case chama a busca por protocolo de "caso mais comum do balcão" | `cab9b05` — `protocol::text ILIKE ?`, mais a cobertura de `paginate` que teria pego isto no dia em que foi escrito |
| `administrator/enrollments` com `paginate`, `archive`, `unarchive` e `delete` sem um teste | O recurso central do painel era o menos coberto; `show` e `update` estavam no arquivo da vitrine desde o achatamento | `cab9b05` |
| `administrator/classes` sem `archive`/`unarchive` e sem merge parcial | As mesmas rotas de `courses`, no mesmo grupo, sem exercício | `0cd041a` |

### Discriminação (terceira rodada)

| # | Mutação | Morto? |
| - | ------- | ------ |
| 1 | `start/routes.ts:259` — `DELETE` de curso passa a aceitar `ADMINISTRATOR` | ✅ Morto |
| 2 | `enrollments/paginate.use-case.ts:28` — listagem deixa de filtrar a lixeira | ✅ Morto |
| 3 | `enrollments/delete.use-case.ts:28` — `DELETE` aceita linha viva | ✅ Morto |
| 4 | `enrollments/paginate.use-case.ts:59` — busca por protocolo volta ao `ILIKE` sem cast | ✅ Morto |

4/4 mortos. Somando as três rodadas: **10/10**.

---

## Pendência

**Passagem ponta a ponta no navegador** (item 4 da verificação do plano):
`docker compose up` → `node ace migration:fresh --seed` → home → curso → wizard
com aluno menor → protocolo → comprovante no MinIO → painel → `CONFIRMED` →
contador de vagas. É operação manual e depende de quem opera.

---

## Resumo

**Geral**: ✅ Pronto, com uma passagem manual pendente.

**O que funciona**: onze commits de correção em duas rodadas; 98 testes de
backend e 95 de frontend verdes; tipos e lint limpos nos dois projetos; build
Nitro com prerender; sensor 10/10; e-mail, sitemap, limpeza, cobertura e matriz
de papel fechados; camada de teste no formato das referências.

**Próximo passo**: rodar o fluxo no navegador uma vez antes do deploy, e definir
`SMTP_HOST`/`MAIL_TO` no painel do Coolify para o aviso sair de verdade.
