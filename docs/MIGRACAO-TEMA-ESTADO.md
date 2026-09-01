# Estado da migração de tema — vitrine + painel

> Arquivo de retomada. Se a sessão cair, comece lendo daqui.
> Branch: `migracao-simple-hub`

## Onde parou

- [x] **Fase A** — tokens em `frontend/src/styles.css`
- [ ] **Fase B** — vitrine: reconstruir os CTAs em `common/` e trocar os nomes
      de marca pelos semânticos, rota por rota
- [ ] **Fase B-fim** — cai o `className="light"` de `_public/layout.tsx:36`
- [ ] **Fase C** — painel com a casca de sidebar do simple-hub

## As regras que valem

1. **`components/ui/` é território do shadcn.** Nunca editar. O que o projeto
   precisa de diferente mora em `components/common/`, como no simple-hub, no
   adacaibs e no lowcodejs.
2. **Zero token de marca.** Só os nomes que o shadcn define. A paleta oficial
   entra como *valor* deles.
3. Usar o máximo possível de `components/ui/` nas rotas e em `common/`.

## Já pronto

- `5e63872` — CETI (aulas) separado do balcão da FAMETRO (inscrição); curso de
  web sem JavaScript, só HTML/CSS.
- `eb577f5` — `@custom-variant dark` + bloco `.dark`, paleta oficial,
  `ThemeToggle` no painel. Deixou a vitrine trancada no claro.
- `96deb1f` — `components/ui/` de volta ao registry do shadcn. **Apagou** as
  variantes `pill`, `pill-green`, `pill-outline`, `pill-outline-light` de
  `button.tsx`, as `green`/`ink` de `badge.tsx` e o `border-line` de `card.tsx`.
  Trouxe 30+ componentes (entre eles `sidebar` e `breadcrumb`) e 6 dependências.
- **Fase A** — `styles.css` sem nenhum token de marca.

## O mapa da Fase B

| Nome morto | Nome semântico |
| --- | --- |
| `bg-cream` | `bg-background` |
| `bg-paper` | `bg-card` |
| `text-ink` | `text-foreground` |
| `text-ink-soft` | `text-muted-foreground` |
| `border-line` | `border-border` |
| `border-line-strong` / `bg-line-strong` | `border-input` / `bg-input` |
| `bg-green` | `bg-primary` |
| `text-neon-ink` | `text-foreground` ou `text-muted-foreground` |
| `bg-ink text-cream` | `bg-foreground text-background` |
| `variant="pill"` e irmãs | componente em `common/`, compondo o `<Button>` de fábrica |
| `<Badge variant="green">` | `<Badge>` de fábrica (`default` já é `bg-primary`) |

## Os números (calculados)

`--primary` é `#88ff9a` **nos dois temas**, com `--primary-foreground` `#272221`
nos dois. O verde é preenchimento, não tinta.

| Par | Claro | Escuro |
| --- | --- | --- |
| primary-foreground sobre primary | 12,58:1 | 12,58:1 |
| primary sobre background (borda do botão) | **1,20:1 — fraca, aceito** | 12,58:1 |
| ring / accent-foreground / chart-1 sobre background | 4,55:1 (#178528) | 12,58:1 (#88FF9A) |
| foreground sobre background | 15,05:1 | 15,05:1 |
| background sobre foreground (bloco invertido) | 15,05:1 | 15,05:1 |
| background/70 sobre foreground | 8,04:1 | 5,71:1 |
| background/60 sobre foreground | 6,33:1 | **4,19:1 — reprova** |

Consequência: **o rodapé perde a escada de opacidade**. `text-cream/60` e
`text-cream/50` viram `text-background/70`, um nível só, que passa nos dois
temas. `text-ink/5` (pétala) e `text-ink/50` (sparkle) continuam — são
decorativos, não texto.

## Riscos anotados

- Os três blocos escuros (`footer.tsx:23`, `course-cards.tsx:53`,
  `what-you-get.tsx:110`) **invertem**: no escuro o rodapé vira placa clara.
  Decidir olhando.
- `whatsapp-float.tsx:32` usa `var(--accent-fg)`, **que não existe**. Bug.
- `legal-page.tsx:32` tem `prose-invert` em bloco claro. Resquício.
- `astronaut-illustration.tsx:120` tem `stroke="white"` cravado.
- `matricula/index.lazy.tsx:329,338` usam `var(--neon-ink)`, que morreu.
- `enrollment-cta.tsx:57` passa `variant='pill'`, que não existe mais.

## A oferta (dado, não visual)

Cinco turmas, todas aos sábados, todas com 40 vagas, **começando em 12/09/2026**:

| Curso | Hora | Turno | Local |
| --- | --- | --- | --- |
| Programação | 08h–10h | MORNING | Sala 01 — Laboratório de Informática |
| Programação | 10h–12h | MORNING | Sala 01 — Laboratório de Informática |
| Robótica | 13h–15h | AFTERNOON | Laboratório de Robótica |
| Robótica | 15h–17h | AFTERNOON | Laboratório de Robótica |
| Robótica | 18h–20h | NIGHT | Laboratório de Robótica |

Aulas no CETI Aristélio Sabino de Oliveira; inscrição presencial no balcão da
FAMETRO, unidade Benjamin Constant.
