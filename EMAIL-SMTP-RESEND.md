# E-mail: SMTP, Resend e o convite de acesso

Como o envio de e-mail funciona neste projeto, o que precisa estar configurado
para ele sair, e por que ele pode falhar sem dar erro nenhum.

O código de envio já está pronto e correto. O que faz e-mail não chegar aqui é
quase sempre **ambiente ou DNS**, e o modo de falha é silencioso de propósito —
é o que este documento existe para tornar visível.

---

## 1. O que o Resend é, e como falamos com ele

Resend é um serviço de **entrega transacional**. Não é caixa postal: é um cano
por onde a aplicação empurra e-mail, e ele cuida de reputação de IP, assinatura,
retentativa e relatório. Por baixo, na nossa conta, ele entrega via Amazon SES
na região `sa-east-1` — dá para ver isso nos próprios registros que ele pede
(`feedback-smtp.sa-east-1.amazonses.com`).

Ele aceita dois caminhos, e o projeto usa o segundo:

| | API HTTP | **SMTP** |
|---|---|---|
| Como | SDK `resend`, `POST /emails` | protocolo padrão de e-mail |
| Prende ao fornecedor | sim | **não** |
| Este projeto | — | ✅ |

SMTP porque é o denominador comum: Gmail, Zoho, Brevo, Resend e o servidor da
própria hospedagem falam SMTP. Trocar de fornecedor é trocar quatro variáveis,
e não trocar de código — a mesma razão pela qual o bloco de armazenamento tem
prefixo `STORAGE_` e não o nome de um fornecedor. A justificativa está inteira
no JSDoc de `backend/config/mail.ts`.

**A autenticação SMTP do Resend é peculiar**, e vale escrever: o usuário é
literalmente a palavra `resend`, e a senha é a API key (`re_...`). Não é o seu
e-mail e a sua senha da conta.

---

## 2. Enviar e receber são coisas diferentes

Este é o ponto que mais confunde, e a origem de quase todo problema que tivemos.

| | Quem cuida | Precisa de qual registro | Temos? |
|---|---|---|---|
| **Enviar** (`MAIL_FROM`) | Resend | DKIM + SPF | ✅ sim |
| **Receber** (`MAIL_TO`) | um provedor de caixa postal | **MX** | ❌ **não** |

O Resend **não verifica destinatário** — ele entrega para qualquer endereço.
Quem precisa existir é a caixa do outro lado.

### Por que ele obriga a verificar o domínio

Qualquer um pode escrever `De: nao-responda@maiyu.com.br` num e-mail; o
protocolo não impede. O que impede é o Gmail perguntar ao DNS do domínio se
aquele servidor tem autorização. É isso que os registros fazem:

- **SPF** (`TXT` em `send.<domínio>`) — quais servidores podem enviar pelo domínio.
- **DKIM** (`TXT` em `resend._domainkey.<domínio>`) — chave pública. O Resend
  assina cada mensagem com a privada; o destinatário confere. Prova que a
  mensagem não foi forjada nem alterada no caminho.
- **DMARC** (`TXT` em `_dmarc`) — o que fazer quando os dois falham. Opcional.
  `p=none` só monitora, e é o começo certo.

### "Partially verified" no painel não é problema

O painel mostra duas seções por domínio. Em `academy.maiyu.com.br`:

- **Enable Sending** → DKIM `verified`, SPF `verified` ✅
- **Enable Receiving** → MX `inbound-smtp` `pending` ⏳

O "partially" é o *receber* pendurado, e receber no Resend não é caixa de
entrada — é ele aceitar e-mail e devolver por webhook para a aplicação
processar. **Não precisamos disso.** Aquele registro MX pode ser ignorado.

> ⚠️ Nunca aponte o MX do domínio raiz `maiyu.com.br` para o Resend. Isso
> derrubaria o e-mail corporativo inteiro.

---

## 3. O estado real do DNS

Consultado em três resolvedores (local, `8.8.8.8`, `1.1.1.1`):

```
MX  maiyu.com.br                          → NENHUM registro
MX  academy.maiyu.com.br                  → NENHUM registro

TXT send.maiyu.com.br                     → v=spf1 include:amazonses.com ~all
MX  send.maiyu.com.br                     → feedback-smtp.sa-east-1.amazonses.com
TXT resend._domainkey.maiyu.com.br        → p=MIGfMA0GCS... (DKIM presente)

TXT send.academy.maiyu.com.br             → v=spf1 include:amazonses.com ~all
MX  send.academy.maiyu.com.br             → feedback-smtp.sa-east-1.amazonses.com
TXT resend._domainkey.academy.maiyu.com.br → p=MIGfMA0GCS... (DKIM presente)
```

Duas conclusões, e as duas importam:

1. **Os dois domínios podem enviar.** DKIM e SPF estão publicados nos dois. Não
   há razão para trocar `MAIL_FROM` de um para o outro.
2. **Nenhum dos dois pode receber.** Sem MX, `secretaria@maiyu.com.br`,
   `contato@academy.maiyu.com.br` e qualquer outro endereço nesses domínios
   **não existem como caixa postal**. E-mail enviado para eles volta como bounce.

---

## 4. A lista de supressão, e por que ela morde calado

Quando um e-mail volta (endereço inexistente) ou alguém marca como spam, o
Resend põe o endereço numa **lista de supressão** e não tenta mais entregar —
para proteger a reputação do IP, que é compartilhado.

O detalhe cruel: **envio para endereço suprimido retorna sucesso** e é
descartado. Do lado de cá parece que funcionou.

Foi o que aconteceu com `jhollyfer@academy.maiyu.com.br` e
`contato@academy.maiyu.com.br`: tentativa → bounce (domínio sem MX) → supressão.

**Regra prática:** `academy.maiyu.com.br` é de **onde** se manda. Nunca um
destino. Para testar, use um endereço externo real.

Para limpar: painel do Resend → *Suppressions* → remover.

---

## 5. As variáveis

Todas são opcionais na validação (`backend/start/env.ts`), e isso é deliberado:
sem `SMTP_HOST` a aplicação sobe igual e a matrícula continua funcionando. Um
e-mail não configurado não pode ser motivo para o site recusar uma inscrição.

### Produção

```bash
# Resend fala SMTP. O usuário é a palavra "resend"; a senha é a API key.
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USERNAME=resend
SMTP_PASSWORD=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Remetente: precisa ser de um domínio com DKIM + SPF publicados. Os dois nossos
# estão, então este valor está correto.
MAIL_FROM=nao-responda@maiyu.com.br

# Destinatário do aviso de matrícula. Precisa de uma caixa que EXISTA - ou seja,
# um domínio com MX. Enquanto maiyu.com.br não tiver, use um endereço externo.
MAIL_TO=jhollyfer.fr@gmail.com

# A base dos links de convite. É o endereço do SITE, não o da API (APP_URL).
# Sem esta variável o convite NÃO É ENVIADO - ver a seção 7.
FRONTEND_URL=https://academy.maiyu.com.br

# Sem Redis, sendLater() cai na fila em memória e perde e-mail em restart.
REDIS_HOST=...
REDIS_PORT=6379
```

### Desenvolvimento

Não aponte para o Resend em desenvolvimento: cada teste queima cota e um
endereço errado vira supressão permanente. Use um catch-all local (Mailpit,
`docker run -p 8025:8025 -p 1025:1025 axllent/mailpit`) ou o Mailtrap:

```bash
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
MAIL_FROM=nao-responda@maiyu.local
MAIL_TO=secretaria@maiyu.local
FRONTEND_URL=http://localhost:3000
```

### Sobre a porta

`backend/config/mail.ts` deriva o modo de conexão da porta:

```ts
secure: env.get('SMTP_PORT', 587) === 465
```

`secure` é TLS implícito, que só a 465 usa. Na **587** a conexão começa em claro
e sobe para TLS por STARTTLS — marcar `secure` ali trava o handshake. Não é um
descuido: é o comportamento correto para cada porta.

Se a hospedagem bloquear a 587, o Resend também atende em **2587** (STARTTLS) e
em **465 / 2465** (TLS implícito).

---

## 6. Provar que o SMTP funciona, sem subir o site

```bash
cd backend
node ace mail:check --to=voce@gmail.com
```

O comando manda uma mensagem única pelo mailer configurado e imprime o erro cru
do SMTP se falhar. Ele usa `mail.send()` e **não** `sendLater()` de propósito:
passar pela fila misturaria "a credencial está errada" com "o worker não está de
pé" na mesma ausência de e-mail.

Sem `--to`, ele usa `MAIL_TO`.

> **Aceito ≠ entregue.** O comando confirma que o servidor SMTP aceitou a
> mensagem. Um destinatário na lista de supressão é aceito e descartado. Confirme
> sempre na caixa de entrada e na aba de logs do Resend, onde o envio precisa
> aparecer como `delivered`, não `bounced`.

---

## 7. Onde o sistema manda e-mail

Dois gatilhos, ambos em `backend/app/services/`, ambos com `mail.sendLater()`.

| Quando | Vai para | Arquivo |
|---|---|---|
| Alguém se matricula pelo site | `MAIL_TO` (secretaria) | `notification.service.ts` |
| Secretaria cria conta sem senha | e-mail da pessoa | `invite.service.ts` |

**Os dois engolem erro de propósito.** Uma matrícula gravada com aviso não
enviado é um problema pequeno e recuperável pelo painel; uma matrícula recusada
porque o SMTP caiu é uma venda perdida. A decisão está documentada nos JSDoc.

A consequência é que **falha de e-mail nunca aparece na tela**. Ela aparece no
log, e é isto que se procura:

```
[notification > enrollment-created][skipped] e-mail não configurado
[invite > send][skipped] e-mail não configurado
[invite > issue][error]
```

### As condições exatas de pular o envio

```ts
// notification.service.ts
if (!env.get('MAIL_TO') || !env.get('SMTP_HOST')) → pula

// invite.service.ts
if (!env.get('FRONTEND_URL') || !env.get('SMTP_HOST')) → pula
```

`FRONTEND_URL` é a que mais dói, porque não é óbvia: **sem ela, nenhum convite
sai**, a conta é criada, o token vai para o banco, e nada acontece.

### A fila

`start/mail.ts` liga o `sendLater()` à fila do Redis quando `REDIS_HOST` existe.
Sem Redis, o comportamento volta a ser a fila **em memória** do próprio pacote,
que perde o que estiver pendente num restart. Um convite perdido num deploy é
uma família sem senha esperando um e-mail que não vem.

---

## 8. O fluxo do convite, ponta a ponta

A secretaria nunca escolhe a senha de uma família: ela cadastra a conta, e quem
define a credencial é o titular, pelo link.

```
painel cria usuário sem senha
   └─ InviteService.issue()
        ├─ consome convite aberto anterior (dois links válidos seria pior)
        ├─ token = string.random(64), gravado como SHA-256
        ├─ expira em 7 dias
        └─ e-mail com FRONTEND_URL + /authentication/invite/<token>
                                     │
   pessoa clica ─────────────────────┘
        ├─ GET  /authentication/invite/:token   → 204 se serve
        └─ POST /authentication/invite/:token   → grava a senha,
                                                   marca consumed_at,
                                                   marca email_verified_at,
                                                   e ABRE A SESSÃO
```

Quem acabou de definir a senha entra direto — não é mandado para o login
digitá-la de novo.

**O token é guardado como SHA-256, e não com `hash.make()`.** A pilha de senha
(scrypt) sala cada chamada, então o hash nunca se repete e o convite não poderia
ser encontrado a partir do token — o índice `unique` de `token_hash` jamais
dispararia. O que o scrypt compra é resistência a dicionário, e não há dicionário
a resistir: são 64 caracteres sorteados, não uma senha escolhida por gente.

As recusas são distintas de propósito, cada uma manda a pessoa a um lugar:

| `code` | Significa | O que a tela diz |
|---|---|---|
| `INVITE_NOT_FOUND` | link inexistente | peça um novo |
| `INVITE_ALREADY_USED` | conta já ativada | entre com e-mail e senha |
| `INVITE_EXPIRED` | passou dos 7 dias | peça um novo |
| `INVITE_ACCOUNT_UNAVAILABLE` | conta inativa/removida | procure a secretaria |

---

## 9. Checklist de quando "não chega e-mail"

1. `SMTP_HOST` está definido? Sem ele os dois services pulam calados.
2. `FRONTEND_URL` está definida? Sem ela **o convite** pula (o aviso de
   matrícula não depende dela).
3. `node ace mail:check --to=<seu gmail>` passa?
4. O destinatário está na lista de supressão do Resend?
5. O domínio do destinatário tem MX? (`dig MX dominio.com`) Sem MX, nenhum
   e-mail chega ali — nunca.
6. `MAIL_FROM` é de um domínio com DKIM e SPF publicados?
7. Nos logs do Resend, o envio aparece como `delivered` ou `bounced`?
8. `REDIS_HOST` está definido? Sem ele, a fila é em memória e um restart no
   momento errado descarta o que estava pendente.

---

## 10. Pendências

- **Caixa postal própria.** Enquanto `maiyu.com.br` não tiver MX (Google
  Workspace, Zoho, Titan…), `MAIL_TO` precisa apontar para um endereço externo, e
  ninguém consegue responder a partir de `@maiyu.com.br`.
- **DMARC.** `_dmarc` não está publicado em nenhum dos dois domínios. É opcional,
  mas `v=DMARC1; p=none;` dá relatório sem risco de bloquear nada.

---

## 11. Rotação de credenciais

As credenciais abaixo foram expostas em transcript de conversa e **precisam ser
trocadas**:

- [ ] API key do Resend (`SMTP_PASSWORD`)
- [ ] Senha do Postgres no Neon (`DATABASE_URL`)
- [ ] `STORAGE_SECRET` e `STORAGE_KEY` do Cloudflare R2
- [ ] `APP_KEY` da aplicação

> Trocar o `APP_KEY` invalida todas as sessões abertas: todo mundo é deslogado, e
> é isso mesmo que se quer depois de uma exposição.
