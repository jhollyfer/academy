/**
 * Os corpos de resposta da API, espelhando `backend/app/core/response.ts`.
 *
 * São `type` e não validators: o que sai do backend já passou pelo VineJS de
 * lá, e validar de novo aqui criaria uma segunda fonte de verdade sobre o mesmo
 * dado, sem nada em troca. Validator no frontend é para o que o **usuário**
 * digita, e mora em `lib/validator.ts`.
 */

import type {
  ActiveStatus,
  ClassStatus,
  CourseAccent,
  EnrollmentFileKind,
  EnrollmentStatus,
  Shift,
  UploadStatus,
  UserRole,
  Weekday,
} from '#/lib/entity'

/**
 * O envelope da listagem paginada, espelhando `PaginationMeta` de
 * `backend/app/core/entity.ts`.
 *
 * Este é o único corpo escrito à mão: o controller o monta na mão
 * (`{ meta: paginator.getMeta(), data: paginator.all() }`) para não passar pelo
 * `metadata` fixo do transformer, e por isso a forma não é derivável do
 * registry.
 */
export type PaginationMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl: string | null
  previousPageUrl: string | null
}

export type Paginated<TItem> = {
  meta: PaginationMeta
  data: Array<TItem>
}

/** O arquivo, quando existe. `null` é registro sem anexo. */
export type StorageResponse = {
  id: string
  filename: string
  originalName: string
  mimetype: string
  size: number
  path: string
  status: UploadStatus
  url: string
  // Não são opcionais: as colunas saem sempre no JSON, nulas ou não.
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

/**
 * O plano de upload: o registro, o tamanho da parte e para onde mandar cada uma.
 *
 * A mesma forma sai de `POST /storages` e de `GET /storages/:id/parts`, porque
 * começar um upload e retomá-lo são a mesma pergunta. Ao começar, `uploaded`
 * vem vazio; ao retomar, ele diz o que o bucket já tem e `parts` traz URL nova
 * só para o que falta.
 *
 * `parts` pode ser menor que `totalParts`: as URLs saem em lotes, e o próximo
 * lote é pedido no mesmo endpoint da retomada.
 */
export type StorageUploadResponse = {
  storage: StorageResponse
  /** Nulo quando o arquivo cabe numa parte só e sobe por um `PUT` simples. */
  uploadId: string | null
  partSize: number
  totalParts: number
  parts: Array<{ partNumber: number; url: string }>
  uploaded: Array<{ partNumber: number; size: number; etag: string }>
}

/**
 * A conta de quem opera o painel.
 *
 * `password` nunca vem: o model o marca com `serializeAs: null`.
 */
export type AccountResponse = {
  id: string
  name: string
  email: string
  role: UserRole
  status: ActiveStatus
  phone: string | null
  avatarId: string | null
  avatar: StorageResponse | null
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

/** Um encontro da grade. A ordem é `position`, não a de cadastro. */
export type CourseModuleResponse = {
  id: string
  courseId: string
  position: number
  title: string
  description: string | null
  createdAt: string
  updatedAt: string | null
}

/** Uma pergunta frequente. `courseId` nulo é o FAQ da home. */
export type CourseFaqResponse = {
  id: string
  courseId: string | null
  position: number
  question: string
  answer: string
  createdAt: string
  updatedAt: string | null
}

/**
 * A turma como ela chega aninhada num curso ou numa matrícula.
 *
 * `seatsTaken` e `seatsRemaining` são `@computed` do backend e **somem** das
 * leituras que não contaram - por isso são opcionais aqui, e não
 * `number | null`. Ausente é "esta resposta não contou"; zero seria mentira.
 */
export type ClassResponse = {
  id: string
  courseId: string
  name: string
  startsAt: string
  endsAt: string | null
  weekday: Weekday
  shift: Shift
  /**
   * A hora da aula, `"HH:MM:SS"` como o Postgres devolve. `null` enquanto a
   * secretaria não fechou o horário - o que `weekday` e `shift` não separam,
   * estas duas separam: duas turmas de web no mesmo sábado de manhã.
   */
  startsAtTime: string | null
  endsAtTime: string | null
  location: string
  capacity: number
  status: ClassStatus
  seatsTaken?: number
  seatsRemaining?: number
  course?: CourseResponse
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

export type CourseResponse = {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string
  accent: CourseAccent
  workloadHours: number
  durationMonths: number
  minimumAge: number | null
  requirements: string | null
  projectOutcome: string | null
  enrollmentFeeInCents: number
  monthlyFeeInCents: number
  coverId: string | null
  cover?: StorageResponse | null
  position: number
  status: ActiveStatus
  modules?: Array<CourseModuleResponse>
  faqs?: Array<CourseFaqResponse>
  /** Some da listagem do painel que não contou; `null` é curso sem turma. */
  classesCount?: number
  /**
   * A próxima turma anunciada, só na página pública do curso. `null` é "não há
   * turma anunciada" - diferente de ausente, que é "esta leitura não a buscou".
   */
  nextClass?: ClassResponse | null
  /**
   * Todas as turmas anunciadas do curso, na vitrine e na matrícula. `nextClass`
   * é a primeira desta lista; esta é a oferta inteira, que é o que o candidato
   * escolhe. Ausente é "esta leitura não as buscou".
   */
  announcedClasses?: Array<ClassResponse>
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}

export type EnrollmentFileResponse = {
  id: string
  enrollmentId: string
  storageId: string
  kind: EnrollmentFileKind
  storage?: StorageResponse
  createdAt: string
  updatedAt: string | null
}

export type EnrollmentResponse = {
  id: string
  classId: string
  /** A credencial de quem não tem conta. É por ele que a URL de acompanhamento
   * é montada, e é o que o candidato dita no WhatsApp. */
  protocol: string
  status: EnrollmentStatus
  studentName: string
  studentBirthDate: string
  studentDocument: string | null
  email: string
  phone: string
  guardianName: string | null
  guardianDocument: string | null
  guardianPhone: string | null
  termsAcceptedAt: string
  lgpdConsentAt: string
  /**
   * A anotação da secretaria. Sempre `null` na leitura pública por protocolo: é
   * sobre o candidato, não para ele.
   */
  notes: string | null
  /** A idade **na data do envio**, não hoje - o backend a deriva de `createdAt`. */
  ageAtEnrollment: number
  requiresGuardian: boolean
  class?: ClassResponse
  files?: Array<EnrollmentFileResponse>
  createdAt: string
  updatedAt: string | null
  deletedAt: string | null
}
