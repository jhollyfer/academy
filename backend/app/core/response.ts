import Class from '#models/class'
import Course from '#models/course'
import CourseFaq from '#models/course_faq'
import CourseModule from '#models/course_module'
import Enrollment from '#models/enrollment'
import EnrollmentFile from '#models/enrollment_file'
import Storage from '#models/storage'
import User from '#models/user'
import {
  ACTIVE_STATUSES,
  CLASS_STATUSES,
  COURSE_ACCENTS,
  ENROLLMENT_FILE_KINDS,
  ENROLLMENT_STATUSES,
  SHIFTS,
  UPLOAD_STATUSES,
  USER_ROLES,
  WEEKDAYS,
} from '#core/entity'
import vine from '@vinejs/vine'
import type { FeatureResponse, ModelResource } from '#core/openapi/types'

/**
 * O contrato de resposta de toda a API, num lugar só.
 *
 * A alternativa seria um `_shared.response.ts` por feature, cada um
 * redescrevendo em VineJS o que o model já sabe. Duas declarações do mesmo
 * contrato divergem, e a divergência aparece como documentação errada - nunca
 * como erro de compilação.
 *
 * A resposta de um endpoint é o **model do Lucid serializado**, com as relações
 * que o use-case precarregou aninhadas como o `preload` as entrega. Então o que
 * este arquivo declara não é a forma da resposta: é o model e a lista de
 * relações. O resto - nome, visibilidade e tipo de cada campo - sai do próprio
 * Lucid e do TypeScript, em `#core/openapi/model-schema`.
 *
 * A chave é o **diretório da feature**, não o nome da rota: `administrator/
 * courses` cobre as sete ações daquele slice de uma vez.
 */

// ---------------------------------------------------------------------------
// Recursos reaproveitados
// ---------------------------------------------------------------------------

const STORAGE: ModelResource = {
  model: Storage,
  enums: { status: UPLOAD_STATUSES },
}

const USER: ModelResource = {
  model: User,
  enums: { role: USER_ROLES, status: ACTIVE_STATUSES },
  relations: { avatar: STORAGE },
}

const COURSE_MODULE: ModelResource = { model: CourseModule }

const COURSE_FAQ: ModelResource = { model: CourseFaq }

/**
 * O curso com a grade e o FAQ aninhados.
 *
 * Os dois vêm juntos porque nenhuma tela pede um curso sem eles: a página
 * pública mostra os dois, e a de edição no painel também. Uma segunda chamada
 * para buscar a grade seria um waterfall garantido em toda leitura.
 */
const COURSE: ModelResource = {
  model: Course,
  enums: { accent: COURSE_ACCENTS, status: ACTIVE_STATUSES },
  relations: { cover: STORAGE, modules: [COURSE_MODULE], faqs: [COURSE_FAQ] },
}

/**
 * A turma com o curso a que pertence.
 *
 * Sem a grade e sem o FAQ do curso: quem lista turmas quer o nome do curso na
 * coluna, não a ementa inteira em cada linha.
 */
const CLASS: ModelResource = {
  model: Class,
  enums: { weekday: WEEKDAYS, shift: SHIFTS, status: CLASS_STATUSES },
  relations: {
    course: {
      model: Course,
      enums: { accent: COURSE_ACCENTS, status: ACTIVE_STATUSES },
    },
  },
}

const ENROLLMENT_FILE: ModelResource = {
  model: EnrollmentFile,
  enums: { kind: ENROLLMENT_FILE_KINDS },
  relations: { storage: STORAGE },
}

/**
 * A matrícula com a turma, o curso da turma e os arquivos enviados.
 *
 * Os três níveis existem porque a tela da secretaria mostra os três: quem se
 * inscreveu, em que turma de que curso, e qual comprovante mandou. Buscar isso
 * em três chamadas seria um waterfall numa tela que é uma tabela.
 */
const ENROLLMENT: ModelResource = {
  model: Enrollment,
  enums: { status: ENROLLMENT_STATUSES },
  relations: { class: CLASS, files: [ENROLLMENT_FILE] },
}

// ---------------------------------------------------------------------------
// O que não deriva de model
// ---------------------------------------------------------------------------

function identifier() {
  return vine.string().uuid()
}

function timestamps() {
  return {
    createdAt: vine.date(),
    updatedAt: vine.date().nullable(),
    deletedAt: vine.date().nullable(),
  }
}

/** O arquivo como sai na resposta. Igual ao model - a `url` é `@computed`. */
function storageFields() {
  return {
    id: identifier(),
    filename: vine.string(),
    originalName: vine.string(),
    mimetype: vine.string(),
    size: vine.number(),
    path: vine.string(),
    status: vine.enum(UPLOAD_STATUSES),
    url: vine.string(),
    ...timestamps(),
  }
}

/**
 * O que o cliente precisa para subir o arquivo por conta própria: o registro, o
 * tamanho da parte e para onde mandar cada uma.
 *
 * A mesma forma serve `POST /storages` e `GET /storages/:id/parts`, porque
 * começar um upload e retomá-lo são a mesma pergunta - "para onde eu mando o
 * quê". Ao iniciar, `uploaded` vem vazio; ao retomar, ele diz o que o bucket já
 * tem e `parts` traz URL nova só para o que falta.
 *
 * Declarado em VineJS e não derivado de model porque não é um model: é um plano
 * de upload, e não existe tabela `upload_plans`.
 */
export const StorageUploadResponse = vine.create({
  storage: vine.object(storageFields()),
  /** Nulo quando o arquivo coube numa parte só e sobe por um `PUT` simples. */
  uploadId: vine.string().nullable(),
  partSize: vine.number(),
  totalParts: vine.number(),
  parts: vine.array(vine.object({ partNumber: vine.number(), url: vine.string() })),
  uploaded: vine.array(
    vine.object({
      partNumber: vine.number(),
      size: vine.number(),
      /** O que o `complete` exige de volta para conferir que a parte chegou. */
      etag: vine.string(),
    })
  ),
})

// ---------------------------------------------------------------------------
// Registro
// ---------------------------------------------------------------------------

export const RESPONSES: Record<string, FeatureResponse> = {
  'account': USER,
  'authentication': USER,

  'storages': STORAGE,

  'administrator/courses': COURSE,
  'administrator/classes': CLASS,
  'administrator/enrollments': ENROLLMENT,

  'storefront/courses': COURSE,
  'storefront/enrollments': ENROLLMENT,
}
