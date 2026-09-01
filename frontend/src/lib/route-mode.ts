export type RouteMode = 'view' | 'create' | 'edit'

const MODES: Record<string, RouteMode> = {
  create: 'create',
  edit: 'edit',
  view: 'view',
}

/** Normaliza o search param `mode` das rotas de detalhe (lookup, sem ternário). */
export function resolveMode(value: unknown): RouteMode {
  return MODES[String(value)] ?? 'view'
}
