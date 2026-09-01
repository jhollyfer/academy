import type { JSONSchema7 } from 'json-schema'
import type { LucidModel } from '@adonisjs/lucid/types/model'

/**
 * Vocabulário do gerador de documentação.
 *
 * O tipo central é `OperationDocs`: o que cada controller declara sobre a
 * própria operação. Só entra aqui o que o código não conta sozinho - rota,
 * método, parâmetros de caminho, segurança e os erros de infraestrutura são
 * derivados do router em `document.ts`.
 */

/** Um nó de JSON Schema, como o VineJS emite e como o OpenAPI 3.1 consome. */
export type SchemaObject = JSONSchema7

/**
 * Um validator do VineJS, visto só pelo que o gerador precisa dele.
 *
 * Estrutural em vez de `VineValidator<any, any>`: o gerador guarda validators de
 * formatos diferentes na mesma lista, e o genérico só serviria para ser apagado
 * com `any`. Declarar os dois métodos usados diz mais e não mente.
 *
 * `toJSONSchema()` entrega o schema publicável. `toJSON()` entrega a árvore
 * interna, que é o único lugar onde o subtipo de um campo sobrevive - é dela que
 * `schema.ts` descobre que um `{}` vazio era um `vine.date()`.
 */
export type DocumentedValidator = {
  toJSONSchema(): SchemaObject
  toJSON(): { schema: unknown }
}

/**
 * Um recurso derivado de um model do Lucid.
 *
 * A resposta de um endpoint é o model serializado com as relações que o
 * use-case precarregou. Declarar o model e as relações é declarar o contrato
 * inteiro - nome, visibilidade e tipo de cada campo saem do próprio Lucid e do
 * TypeScript, em `model-schema.ts`.
 *
 * Relação **não** declarada em `relations` não entra: listar toda relação do
 * model prometeria dado que nenhum `preload` traz.
 */
export type ModelResource = {
  model: LucidModel
  relations?: RelationMap
  /**
   * O `enum` de uma coluna. `database/schema.ts` é gerado das colunas e tipa
   * todo enum de banco como `string`; sem isto o documento diria texto onde o
   * endpoint aceita quatro valores.
   */
  enums?: Record<string, readonly string[]>
  /** O que nem o AST nem o Lucid contam. Sobrescreve o derivado. */
  fields?: Record<string, SchemaObject>
}

/** As relações aninhadas de um recurso. `[recurso]` é lista; sem colchete, um. */
export type RelationMap = Record<string, ModelResource | [ModelResource]>

/** Uma resposta que é uma lista crua, sem envelope de paginação. */
export type ListResource = { kind: 'list'; item: ModelResource }

export function list(item: ModelResource): ListResource {
  return { kind: 'list', item }
}

export function isModelResource(value: unknown): value is ModelResource {
  return typeof value === 'object' && value !== null && 'model' in value
}

export function isListResource(value: unknown): value is ListResource {
  return typeof value === 'object' && value !== null && 'kind' in value && value.kind === 'list'
}

/**
 * Resposta paginada. Marcador em vez de schema pronto porque `Paginated<T>` tem
 * forma fixa (`app/core/entity.ts`): o gerador monta o envelope e referencia
 * `PaginationMeta` uma vez só, em vez de repeti-lo em cada listagem.
 */
export type PaginatedResponse = {
  kind: 'paginated'
  item: DocumentedValidator | ModelResource
}

export function paginated(item: DocumentedValidator | ModelResource): PaginatedResponse {
  return { kind: 'paginated', item }
}

/** O que uma feature declara como resposta: recurso de model ou schema VineJS. */
export type FeatureResponse = ModelResource | ListResource | DocumentedValidator

/** O que uma operação pode devolver num dado status. */
export type ResponseBody =
  DocumentedValidator | PaginatedResponse | ModelResource | ListResource | 'no-content'

/**
 * O contrato público de uma operação, declarado como `static docs` no
 * controller.
 *
 * `errors` mapeia status para o(s) `code` que aquela operação pode devolver
 * naquele status. Os codes viram um `enum` no schema da resposta, que é o que
 * torna a lista de falhas exaustiva para quem gera cliente a partir do
 * documento. Os automáticos - 401 com `auth`, 403 com `role`, 422 com qualquer
 * validator, 500 sempre - não precisam ser declarados.
 *
 * `overrides` é a saída de emergência para o que o VineJS não expressa: o campo
 * companheiro de `.confirmed()`, que existe em runtime mas não aparece no schema
 * gerado, é o caso concreto. É feito merge por último, sobre o schema derivado.
 */
export type OperationDocs = {
  /**
   * Todo campo é opcional, e a maioria dos controllers só usa `description`.
   *
   * O gerador deriva resumo, payload, resposta, status e erros do próprio
   * código (`introspect.ts`). Este bloco existe para o que o código não diz -
   * a prosa que explica a regra de negócio - e para corrigir uma derivação
   * errada. Nunca é obrigatório: rota sem ele sai documentada do mesmo jeito.
   */
  summary?: string
  description?: string
  /** Sobrescreve a tag derivada do caminho. Raro. */
  tag?: string
  body?: DocumentedValidator
  query?: DocumentedValidator
  params?: DocumentedValidator
  responses?: Record<number, ResponseBody>
  errors?: Record<number, string | string[]>
  overrides?: {
    body?: SchemaObject
    responses?: Record<number, SchemaObject>
  }
  deprecated?: boolean
}

/**
 * Identidade tipada. Existe para dar inferência e autocomplete na declaração
 * dentro do controller, sem custo em runtime.
 */
export function defineDocs(docs: OperationDocs): OperationDocs {
  return docs
}

/** Um controller visto pelo gerador: pode ou não ter declarado sua documentação. */
export type DocumentedController = {
  docs?: OperationDocs
}

// ---------------------------------------------------------------------------
// Documento
// ---------------------------------------------------------------------------

export type OpenAPIOperation = {
  operationId: string
  summary: string
  description?: string
  tags: string[]
  deprecated?: boolean
  security?: Array<Record<string, string[]>>
  parameters?: OpenAPIParameter[]
  requestBody?: {
    required: boolean
    content: Record<string, { schema: SchemaObject }>
  }
  responses: Record<string, OpenAPIResponse>
}

export type OpenAPIParameter = {
  name: string
  in: 'path' | 'query'
  required: boolean
  description?: string
  schema: SchemaObject
}

export type OpenAPIResponse = {
  description: string
  content?: Record<string, { schema: SchemaObject }>
}

export type OpenAPIDocument = {
  openapi: string
  info: Record<string, unknown>
  servers: Array<Record<string, unknown>>
  tags: Array<{ name: string; description: string }>
  paths: Record<string, Record<string, OpenAPIOperation>>
  components: {
    securitySchemes: Record<string, Record<string, string>>
    schemas: Record<string, SchemaObject>
  }
}
