/**
 * Vocabulário do domínio: os enums e a forma da resposta paginada.
 *
 * Tudo aqui é consumido pelas duas pontas - a migration, que grava, e o
 * validator, que recusa. Manter numa fonte só é o que impede o banco e a
 * validação de divergirem sem ninguém notar.
 */

// ---------------------------------------------------------------------------
// Tipos utilitários
// ---------------------------------------------------------------------------

/**
 * Junta dois tipos objeto num só, achatado.
 *
 * `A & B` funciona e lê mal: o editor mostra a cadeia de interseção em vez do
 * tipo final, e chave repetida vira `never` silenciosamente. Mapear as chaves
 * resolve as duas coisas - o hover mostra o objeto resultante, campo a campo.
 *
 * É o que os use-cases usam para somar o escopo da sessão ao payload validado:
 * `Merge<AdministratorCourseCreatePayload, { userId: string }>`.
 */
export type Merge<A, B> = { [K in keyof (A & B)]: (A & B)[K] }

// ---------------------------------------------------------------------------
// Papéis
// ---------------------------------------------------------------------------

/**
 * O papel do usuário. Lookup object em vez de union solto: a chave nomeia o
 * papel no código, o valor é o que vai para o banco e para a API, e o tipo sai
 * derivado - não há literal repetido para divergir.
 *
 * `database/schema.ts` é gerado a partir do banco e entrega todo enum como
 * `string`, então sem este tipo um typo (`'ADMNISTRATOR'`) compilaria e só
 * apareceria quando o Postgres recusasse o insert.
 *
 * São quatro papéis, em dois grupos que não se misturam:
 *
 * - **Quem opera** a escola: `OWNER` e `ADMINISTRATOR`. O dono não é gerenciável
 *   por endpoint nenhum, nasce só pelo seeder, e é quem cadastra o resto.
 * - **Quem é atendido** por ela: `RESPONSIBLE` e `STUDENT`. Nascem pelo painel
 *   ou pelo convite que sai na confirmação da matrícula.
 *
 * `OWNER` fica fora de `MANAGEABLE_USER_ROLES` para que ninguém se promova a
 * dono por um POST. Isso é metade da regra: a outra metade é a policy, que
 * recusa alguém alterando o próprio papel - o validator sozinho não vê quem
 * está chamando.
 */
export const UserRoles = {
  OWNER: 'OWNER',
  ADMINISTRATOR: 'ADMINISTRATOR',
  RESPONSIBLE: 'RESPONSIBLE',
  STUDENT: 'STUDENT',
} as const

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles]

export const USER_ROLES = Object.values(UserRoles)

/**
 * Os papéis que um endpoint pode atribuir. `OWNER` fica de fora pelo motivo
 * acima.
 */
export const MANAGEABLE_USER_ROLES = USER_ROLES.filter(function (role) {
  return role !== UserRoles.OWNER
})

/**
 * Quem opera o painel da secretaria, e quem é atendido por ele.
 *
 * Os dois grupos existem como constante e não como literal na rota porque é
 * `middleware.role(...)` que os consome, e um papel novo precisa entrar em um
 * dos dois - esquecer disso é abrir ou fechar um módulo inteiro sem perceber.
 */
export const STAFF_USER_ROLES: ReadonlyArray<UserRole> = [UserRoles.OWNER, UserRoles.ADMINISTRATOR]

export const PORTAL_USER_ROLES: ReadonlyArray<UserRole> = [UserRoles.RESPONSIBLE, UserRoles.STUDENT]

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

/**
 * Status de conta e de curso - os dois usam os mesmos valores.
 *
 * Chave e valor em caixa alta: o valor do enum é identificador, não texto de
 * interface. O rótulo em português é do frontend.
 *
 * Num curso, `INACTIVE` é o que o tira da vitrine sem apagá-lo - diferente de
 * `deletedAt`, que é a lixeira. Um curso pode sair do ar entre duas turmas e
 * voltar, e isso não é remoção.
 */
export const ActiveStatuses = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const

export type ActiveStatus = (typeof ActiveStatuses)[keyof typeof ActiveStatuses]

export const ACTIVE_STATUSES = Object.values(ActiveStatuses)

// ---------------------------------------------------------------------------
// Curso
// ---------------------------------------------------------------------------

/**
 * O acento visual do curso. É dado e não CSS: a landing pinta o card, o hero e
 * a página do curso a partir daqui, e a escola cadastra curso novo pelo painel
 * sem ninguém tocar em folha de estilo.
 *
 * Dois valores hoje porque são dois cursos. Um terceiro entra nesta lista e no
 * mapa de tokens do frontend, e mais nada.
 */
export const CourseAccents = {
  WEB: 'WEB',
  ROBOTICS: 'ROBOTICS',
} as const

export type CourseAccent = (typeof CourseAccents)[keyof typeof CourseAccents]

export const COURSE_ACCENTS = Object.values(CourseAccents)

// ---------------------------------------------------------------------------
// Turma
// ---------------------------------------------------------------------------

/**
 * O dia da semana em que a turma tem aula. As aulas são aos sábados, e mesmo
 * assim isto é dado: uma turma de contraturno entra sem migration.
 *
 * Valores em inglês e caixa alta como todo enum daqui; o rótulo "Sábado" é do
 * frontend.
 */
export const Weekdays = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const

export type Weekday = (typeof Weekdays)[keyof typeof Weekdays]

export const WEEKDAYS = Object.values(Weekdays)

/**
 * O turno da turma.
 */
export const Shifts = {
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
  NIGHT: 'NIGHT',
} as const

export type Shift = (typeof Shifts)[keyof typeof Shifts]

export const SHIFTS = Object.values(Shifts)

/**
 * O estado da turma quanto a receber matrícula.
 *
 * `FULL` é derivado, não digitado: quem o carimba é o use-case de matrícula
 * quando a última vaga é ocupada. `CLOSED` é decisão da secretaria - turma que
 * já começou, ou que não vai abrir. A diferença importa porque `FULL` volta a
 * `OPEN` sozinho se uma matrícula é cancelada, e `CLOSED` não volta sozinho.
 */
export const ClassStatuses = {
  OPEN: 'OPEN',
  FULL: 'FULL',
  CLOSED: 'CLOSED',
} as const

export type ClassStatus = (typeof ClassStatuses)[keyof typeof ClassStatuses]

export const CLASS_STATUSES = Object.values(ClassStatuses)

// ---------------------------------------------------------------------------
// Matrícula
// ---------------------------------------------------------------------------

/**
 * A máquina de estados da matrícula.
 *
 * `PENDING` é o que a matrícula virtual cria: dados enviados, vaga reservada,
 * pagamento da inscrição ainda não conferido. `CONFIRMED` é a secretaria dizendo
 * que viu o comprovante do Pix - não há gateway no v1, então a confirmação é
 * humana por definição.
 *
 * `WAITLIST` não é um estado pior que `PENDING`, é outro: quem entra aqui chegou
 * com a turma lotada e **não** ocupa vaga. É o que permite continuar recebendo
 * inscrição depois das 40 sem estourar a capacidade nem mandar o candidato
 * embora.
 *
 * `CANCELLED` é terminal e alcançável dos três. Cancelar devolve a vaga, e é por
 * isso que a contagem de ocupação olha `PENDING` e `CONFIRMED` e ignora o resto.
 */
export const EnrollmentStatuses = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  WAITLIST: 'WAITLIST',
  CANCELLED: 'CANCELLED',
} as const

export type EnrollmentStatus = (typeof EnrollmentStatuses)[keyof typeof EnrollmentStatuses]

export const ENROLLMENT_STATUSES = Object.values(EnrollmentStatuses)

/**
 * Os estados que ocupam vaga. A ocupação de uma turma é a contagem de
 * matrículas nesta lista - fila de espera e cancelada não contam.
 *
 * Uma constante e não um literal repetido em cada consulta: a pergunta "o que
 * conta como vaga ocupada?" tem uma resposta só, e ela mora aqui.
 */
export const SEAT_TAKING_ENROLLMENT_STATUSES: ReadonlyArray<EnrollmentStatus> = [
  EnrollmentStatuses.PENDING,
  EnrollmentStatuses.CONFIRMED,
]

/**
 * As transições que a aplicação aceita, por estado de origem.
 *
 * Um mapa, e não uma cadeia de `if`: a pergunta "de WAITLIST dá para ir a quê?"
 * se responde lendo uma linha, e um estado novo entra sem tocar em nenhuma
 * condição existente.
 *
 * `WAITLIST → PENDING` é a promoção quando uma vaga abre; ela passa por
 * `PENDING` e não direto para `CONFIRMED` porque o comprovante do Pix continua
 * pendente.
 */
export const ENROLLMENT_TRANSITIONS: Record<EnrollmentStatus, ReadonlyArray<EnrollmentStatus>> = {
  PENDING: [EnrollmentStatuses.CONFIRMED, EnrollmentStatuses.CANCELLED],
  WAITLIST: [EnrollmentStatuses.PENDING, EnrollmentStatuses.CANCELLED],
  CONFIRMED: [EnrollmentStatuses.CANCELLED],
  CANCELLED: [],
}

/**
 * A idade a partir da qual o candidato se matricula sozinho. Abaixo dela o
 * validator exige nome, documento e telefone do responsável legal - exigência da
 * LGPD para dado de menor, e não capricho de formulário.
 */
export const LEGAL_AGE = 18

/**
 * O que um arquivo anexado a uma matrícula é.
 *
 * `PAYMENT_RECEIPT` é o comprovante do Pix da inscrição, o único obrigatório no
 * fluxo. `DOCUMENT` é RG/CPF, opcional, e existe porque a secretaria pode passar
 * a pedir - a coluna já aceita sem migration nova.
 */
export const EnrollmentFileKinds = {
  PAYMENT_RECEIPT: 'PAYMENT_RECEIPT',
  DOCUMENT: 'DOCUMENT',
} as const

export type EnrollmentFileKind = (typeof EnrollmentFileKinds)[keyof typeof EnrollmentFileKinds]

export const ENROLLMENT_FILE_KINDS = Object.values(EnrollmentFileKinds)

// ---------------------------------------------------------------------------
// Arquivos
// ---------------------------------------------------------------------------

/**
 * O estado de um arquivo enquanto ele sobe. Existe porque o binário não passa
 * por esta aplicação: `POST /storages` grava a linha e devolve URLs assinadas,
 * o navegador sobe as partes direto no bucket, e só depois
 * `POST /storages/:id/complete` confirma. Entre uma coisa e outra a linha existe
 * sem binário íntegro, e é isso que `PENDING` nomeia.
 *
 * Só `UPLOADED` pode ser anexado a alguma coisa - o serviço de storage recusa o
 * resto, para que ninguém confirme uma matrícula com o comprovante pela metade.
 */
export const UploadStatuses = {
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
} as const

export type UploadStatus = (typeof UploadStatuses)[keyof typeof UploadStatuses]

export const UPLOAD_STATUSES = Object.values(UploadStatuses)

// ---------------------------------------------------------------------------
// Listagem
// ---------------------------------------------------------------------------

/**
 * O recorte de lixeira das listagens. Ausente é o de sempre - só ativos -,
 * então nenhuma leitura muda de resposta para quem não pediu.
 *
 * Não confundir com `ActiveStatuses.INACTIVE`, que é estado de publicação do
 * curso. Aqui é `deletedAt`, a remoção lógica que vale para toda tabela.
 */
export const TrashedModes = {
  /** Só o que está na lixeira. É a listagem da tela de restauração. */
  ONLY: 'only',
  /** Ativos e removidos juntos. */
  WITH: 'with',
} as const

export type TrashedMode = (typeof TrashedModes)[keyof typeof TrashedModes]

export const TRASHED_MODES = Object.values(TrashedModes)

/**
 * O sentido da ordenação de uma listagem. Ausente é `asc`, que é a ordem que
 * as listagens já tinham antes de aceitarem o parâmetro.
 */
export const SortDirections = {
  ASC: 'asc',
  DESC: 'desc',
} as const

export type SortDirection = (typeof SortDirections)[keyof typeof SortDirections]

export const SORT_DIRECTIONS = Object.values(SortDirections)

/**
 * A ordem que a consulta vai usar: o que o payload pediu, ou o padrão do
 * recurso. Feito para ser espalhado - `query.orderBy(...sortOrder(payload,
 * 'name'))`.
 *
 * O `fallback` é a ordem que a listagem já tinha antes de aceitar o parâmetro, e
 * é por isso que ele é obrigatório: quem não manda `?sort` recebe exatamente a
 * mesma resposta de antes.
 *
 * A coluna não é conferida aqui - quem fecha a lista é o `sortFields()` do
 * validator, antes de o payload chegar ao use-case.
 */
export function sortOrder<TColumn extends string>(
  payload: { sort?: TColumn; direction?: SortDirection },
  fallback: TColumn
): [TColumn, SortDirection] {
  return [payload.sort ?? fallback, payload.direction ?? SortDirections.ASC]
}

// ---------------------------------------------------------------------------
// Paginação
// ---------------------------------------------------------------------------

/**
 * A resposta paginada como ela sai no fio, tipada.
 *
 * O paginator do Lucid não serve para isso: `ModelPaginatorContract.toJSON()`
 * devolve `{ meta: any; data: ModelObject[] }` - perde o tipo do item e ainda
 * traz um `any`. Devolver o paginator cru também não serve: o registry do Tuyau
 * infere a resposta do retorno do controller, e o front receberia o tipo da
 * classe (com `serialize`, `toJSON` e mais 55 membros) em vez do JSON.
 *
 * Montar `{ meta: paginator.getMeta(), data: paginator.all() }` resolve os dois:
 * `all()` mantém `T[]`, e o `any` de `getMeta()` morre nesta fronteira.
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

export type Paginated<T> = {
  meta: PaginationMeta
  data: T[]
}
