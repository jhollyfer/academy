/**
 * O vocabulário do domínio - cópia de `backend/app/core/entity.ts`.
 *
 * Mora fora de `validator.ts`, e não por arrumação: aquele arquivo faz
 * `vine.messagesProvider = messages` e monta cada validator com `vine.create()`
 * no escopo do módulo. São efeitos no topo, e o Rollup não poda módulo com
 * efeito no topo - então **um** `import { CourseAccents }` arrastaria o VineJS
 * inteiro e todos os schemas para dentro do bundle de quem importou.
 *
 * A landing é justamente quem paga essa conta: ela lê `CourseAccents` para
 * pintar o card e não valida formulário nenhum. Uma biblioteca de validação de
 * servidor viajando para o celular de quem clicou no anúncio, para ler a string
 * `'ROBOTICS'`.
 *
 * Aqui não entra nada que dependa de `vine`. `validator.ts` reexporta tudo,
 * então quem já importava de lá continua funcionando - mas código novo que só
 * precisa do vocabulário importa **deste** arquivo.
 */

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
 * São dois papéis e não um porque o painel tem dono e tem operador: `OWNER` não
 * é gerenciável por endpoint nenhum, nasce só pelo seeder, e é quem cadastra os
 * `ADMINISTRATOR` da secretaria. Quem valida payload usa `manageableRole()`,
 * que exclui o valor - assim ninguém se promove a dono por um POST.
 *
 * São quatro, em dois grupos que não se misturam: quem **opera** a escola
 * (`OWNER`, `ADMINISTRATOR`) e quem é **atendido** por ela (`RESPONSIBLE`,
 * `STUDENT`). Os dois grupos entram em áreas diferentes do app, e é por isso que
 * o destino pós-login não pode ser fixo.
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
 * Quem opera o painel, e quem é atendido por ele. Cópia linha a linha do
 * `#core/entity` do servidor - o schema não atravessa a fronteira, mas a
 * expressão é a mesma.
 */
export const STAFF_USER_ROLES: Array<UserRole> = [UserRoles.OWNER, UserRoles.ADMINISTRATOR]

export const PORTAL_USER_ROLES: Array<UserRole> = [UserRoles.RESPONSIBLE, UserRoles.STUDENT]

/**
 * Onde cada papel entra depois do login.
 *
 * Existe como função e não como literal no `redirect` porque agora há **duas**
 * áreas: mandar todo mundo para `/administrator` faria o responsável convidado
 * por e-mail definir a senha, entrar, e cair num 403 - o servidor barra o
 * portal do painel e vice-versa. O convite levaria a uma porta que não abre.
 */
export function homeForRole(role: UserRole): '/administrator' | '/portal' {
  if (PORTAL_USER_ROLES.includes(role)) return '/portal'

  return '/administrator'
}

/**
 * Os papéis que um endpoint pode atribuir. `OWNER` fica de fora pelo motivo
 * acima.
 */
export const MANAGEABLE_USER_ROLES = USER_ROLES.filter(function (role) {
  return role !== UserRoles.OWNER
})

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

export type EnrollmentStatus =
  (typeof EnrollmentStatuses)[keyof typeof EnrollmentStatuses]

export const ENROLLMENT_STATUSES = Object.values(EnrollmentStatuses)

/**
 * Os estados que ocupam vaga. A ocupação de uma turma é a contagem de
 * matrículas nesta lista - fila de espera e cancelada não contam.
 *
 * Uma constante e não um literal repetido em cada consulta: a pergunta "o que
 * conta como vaga ocupada?" tem uma resposta só, e ela mora aqui.
 */
export const SEAT_TAKING_ENROLLMENT_STATUSES: ReadonlyArray<EnrollmentStatus> =
  [EnrollmentStatuses.PENDING, EnrollmentStatuses.CONFIRMED]

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
export const ENROLLMENT_TRANSITIONS: Record<
  EnrollmentStatus,
  ReadonlyArray<EnrollmentStatus>
> = {
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

export type EnrollmentFileKind =
  (typeof EnrollmentFileKinds)[keyof typeof EnrollmentFileKinds]

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
 * Os tipos que o backend aceita anexar, espelhando `STORAGE_MIMETYPES` de
 * `backend/app/core/validator.ts`, e a extensão que cada um ganha na chave do
 * objeto.
 *
 * Mora aqui e não em `validator.ts` pelo motivo do cabeçalho deste arquivo: o
 * campo de upload lê a lista para dizer *qual* arquivo não serve, e não valida
 * schema nenhum - se a lista morasse lá, ele arrastaria o VineJS junto.
 *
 * Existe para o cliente recusar antes de gastar uma requisição. A recusa que
 * vale continua sendo a do servidor.
 *
 * A observação original:
 *
 * O mapa existe porque o nome que o usuário enviou **não** é fonte confiável de
 * extensão - ele é rótulo , e `foto.png` pode ser um pdf. A extensão da
 * chave sai do `mimetype` declarado, que é o mesmo valor com que a URL é
 * assinada e que o bucket devolve na confirmação.
 *
 * `Record<Mimetype, string>` faz o compilador cobrar uma entrada por tipo:
 * acrescentar um mimetype na lista sem dizer que extensão ele tem quebra a
 * compilação, em vez de virar arquivo sem extensão no bucket.
 */
export const STORAGE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const

export type StorageMimetype = (typeof STORAGE_MIMETYPES)[number]

export const STORAGE_EXTENSIONS: Record<StorageMimetype, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

export function isStorageMimetype(value: string): value is StorageMimetype {
  return STORAGE_MIMETYPES.some((mimetype) => mimetype === value)
}

/**
 * O recorte de imagem de `STORAGE_MIMETYPES`, que é o padrão do campo de
 * imagem.
 *
 * Derivado por `filter` e não escrito à mão: acrescentar um formato ao backend
 * passa a valer aqui sozinho, e uma segunda lista seria a garantia de as duas
 * divergirem.
 */
export const IMAGE_MIMETYPES = STORAGE_MIMETYPES.filter((mimetype) =>
  mimetype.startsWith('image/'),
)
