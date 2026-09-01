# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Slice sem spec Japa não conta como entregue: storages, authentication e account passaram no lint e no typecheck sem nenhuma rota exercitada.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `backend/app/features` · harmful: 0
- features: migracao-simple-hub
- evidence: backend/app/features/storages/create.use-case.ts:1 (backend/app/features)
- last seen: 2026-09-01T12:32:52Z

### L-002 - Decisão travada na tabela do plano (fila de e-mail) some quando nenhuma fase a nomeia como tarefa; toda decisão precisa aparecer numa fase.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `planejamento` · harmful: 0
- features: migracao-simple-hub
- evidence: /home/jhollyfer/.claude/plans/concurrent-skipping-wall.md:1 (planejamento)
- last seen: 2026-09-01T12:32:52Z

### L-003 - Um .gitignore herdado de outro stack pode esconder arquivo que o plano manda versionar; conferir git ls-files contra a referência, e não só o conteúdo do arquivo.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `infra` · harmful: 0
- features: migracao-simple-hub
- evidence: .gitignore:34 (infra)
- last seen: 2026-09-01T13:04:08Z

### L-004 - Antes de escrever teste novo, listar os arquivos de teste da referência: o layout e o nome do grupo são padrão tanto quanto o código.
- signal: `spec_deviation` · recurrence: 1 feature(s) · scope: `testes` · harmful: 0
- features: migracao-simple-hub
- evidence: backend/tests/functional:1 (testes)
- last seen: 2026-09-01T13:04:08Z

### L-005 - Contar arquivos de teste esconde ação sem cobertura; contar ação por recurso (paginate/show/create/update/archive/unarchive/delete) é o que acha o buraco.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `testes` · harmful: 0
- features: migracao-simple-hub
- evidence: backend/app/features/administrator/enrollments/paginate.use-case.ts:59 (testes)
- last seen: 2026-09-01T13:38:27Z

### L-006 - Regra de autorização escrita só em JSDoc não falha quando alguém a quebra; toda linha de role() precisa do par 'quem pode' e 'quem não pode'.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `seguranca` · harmful: 0
- features: migracao-simple-hub
- evidence: backend/start/routes.ts:259 (seguranca)
- last seen: 2026-09-01T13:38:27Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
