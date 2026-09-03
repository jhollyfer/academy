import type { VariantProps } from 'class-variance-authority'

import type { badgeVariants } from '#/components/ui/badge'

import type {
  ActiveStatus,
  ClassStatus,
  CourseAccent,
  EnrollmentStatus,
  Shift,
  StorageMimetype,
  UserRole,
  Weekday,
} from './entity'

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

/**
 * Os rótulos em português e as cores de cada enum do domínio.
 *
 * Separado de `validator.ts` de propósito: lá é o contrato com a API, e o valor
 * do enum é identificador, não texto de interface. Aqui é apresentação.
 *
 * Lookup object e não `if` espalhado por tela - e o mesmo objeto alimenta três
 * coisas: as opções do formulário, o texto da tabela e a variante do `Badge`.
 * Antes destas linhas cada tela trazia o seu: `ACCENT_LABELS` no formulário de
 * curso, `WEEKDAY_LABELS` e `SHIFT_LABELS` no de turma, e um `if` de situação
 * dentro da coluna da listagem - três donos para a mesma pergunta.
 *
 * A chave é `string` e o valor pode faltar porque o status chega da API como
 * `string` larga. O `satisfies` é o que mantém a cobrança de ter todos: valor
 * novo no enum sem rótulo aqui não compila. O acesso é sempre
 * `LABELS[valor] ?? valor`, que mostra o identificador cru em vez de quebrar.
 */

// ---------------------------------------------------------------------------
// Situação de curso (e de conta)
// ---------------------------------------------------------------------------

export const ACTIVE_STATUS_LABELS: Record<string, string | undefined> = {
  ACTIVE: 'No ar',
  INACTIVE: 'Fora do ar',
} satisfies Record<ActiveStatus, string>

export const ACTIVE_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
} satisfies Record<ActiveStatus, BadgeVariant>

/**
 * A cor sólida do status, para a bolinha do filtro.
 *
 * Separada de `*_VARIANTS`, que é o par fundo-pálido/tinta-escura do `Badge`: o
 * fundo pálido em 8px no meio de um campo branco não se enxerga. A bolinha usa a
 * **tinta** do mesmo par, que é sólida e sobrevive ao tamanho.
 */
export const ACTIVE_STATUS_DOTS: Record<string, string | undefined> = {
  ACTIVE: 'bg-badge-success-foreground',
  INACTIVE: 'bg-badge-neutral-foreground',
} satisfies Record<ActiveStatus, string>

/**
 * O mesmo enum na concordância de quem fala de pessoa: o curso está "No ar", a
 * conta está "Ativa". São dois rótulos para o mesmo valor, e é por isso que o
 * backend o guarda em inglês.
 */
export const ACCOUNT_STATUS_LABELS: Record<string, string | undefined> = {
  ACTIVE: 'Ativa',
  INACTIVE: 'Inativa',
} satisfies Record<ActiveStatus, string>

// ---------------------------------------------------------------------------
// Papel
// ---------------------------------------------------------------------------

export const USER_ROLE_LABELS: Record<string, string | undefined> = {
  OWNER: 'Dono',
  ADMINISTRATOR: 'Administrador',
} satisfies Record<UserRole, string>

export const USER_ROLE_VARIANTS: Record<string, BadgeVariant> = {
  OWNER: 'info',
  ADMINISTRATOR: 'neutral',
} satisfies Record<UserRole, BadgeVariant>

// ---------------------------------------------------------------------------
// Curso
// ---------------------------------------------------------------------------

/**
 * Sem `*_VARIANTS`: o acento não é estado, é a cor da identidade do curso na
 * vitrine. Pintar um `Badge` por ele competiria com a coluna de situação, que é
 * a que de fato muda.
 */
export const COURSE_ACCENT_LABELS: Record<string, string | undefined> = {
  WEB: 'Desenvolvimento web',
  ROBOTICS: 'Robótica',
} satisfies Record<CourseAccent, string>

// ---------------------------------------------------------------------------
// Turma
// ---------------------------------------------------------------------------

export const WEEKDAY_LABELS: Record<string, string | undefined> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
} satisfies Record<Weekday, string>

/**
 * Em caixa alta na inicial, para começo de frase e opção de formulário. O
 * minúsculo de meio de frase - "sábado de manhã" - é do `SHIFT_LABELS` de
 * `enrollment-state.ts`, que nasceu dentro de uma sentença.
 */
export const SHIFT_LABELS: Record<string, string | undefined> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  NIGHT: 'Noite',
} satisfies Record<Shift, string>

export const CLASS_STATUS_LABELS: Record<string, string | undefined> = {
  OPEN: 'Aberta',
  FULL: 'Lotada',
  CLOSED: 'Fechada',
} satisfies Record<ClassStatus, string>

/**
 * `FULL` é aviso e não erro: a turma está saudável, só não cabe mais ninguém -
 * e quem chega entra na fila de espera. `CLOSED` é neutro porque é decisão da
 * secretaria, não um problema.
 */
export const CLASS_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  OPEN: 'success',
  FULL: 'warning',
  CLOSED: 'neutral',
} satisfies Record<ClassStatus, BadgeVariant>

export const CLASS_STATUS_DOTS: Record<string, string | undefined> = {
  OPEN: 'bg-badge-success-foreground',
  FULL: 'bg-badge-warning-foreground',
  CLOSED: 'bg-badge-neutral-foreground',
} satisfies Record<ClassStatus, string>

// ---------------------------------------------------------------------------
// Matrícula
// ---------------------------------------------------------------------------

export const ENROLLMENT_STATUS_LABELS: Record<string, string | undefined> = {
  PENDING: 'Aguardando',
  CONFIRMED: 'Confirmada',
  WAITLIST: 'Fila de espera',
  CANCELLED: 'Cancelada',
} satisfies Record<EnrollmentStatus, string>

/**
 * `WAITLIST` é `info` e não `warning`: quem está na fila não pede providência
 * da secretaria, está esperando uma vaga abrir. Quem pede providência é o
 * `PENDING`, que tem um comprovante de Pix aguardando conferência humana.
 */
export const ENROLLMENT_STATUS_VARIANTS: Record<string, BadgeVariant> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  WAITLIST: 'info',
  CANCELLED: 'neutral',
} satisfies Record<EnrollmentStatus, BadgeVariant>

export const ENROLLMENT_STATUS_DOTS: Record<string, string | undefined> = {
  PENDING: 'bg-badge-warning-foreground',
  CONFIRMED: 'bg-badge-success-foreground',
  WAITLIST: 'bg-badge-info-foreground',
  CANCELLED: 'bg-badge-neutral-foreground',
} satisfies Record<EnrollmentStatus, string>

// ---------------------------------------------------------------------------
// Arquivo
// ---------------------------------------------------------------------------

export const STORAGE_MIMETYPE_LABELS: Record<string, string | undefined> = {
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'image/gif': 'GIF',
  'application/pdf': 'PDF',
} satisfies Record<StorageMimetype, string>

/**
 * As iniciais de um nome, para o `AvatarFallback` de quem não tem foto.
 *
 * Primeira e última, e não as duas primeiras: "Maria Aparecida Souza" é MS, que
 * é como a pessoa assina, e não MA.
 */
export function initials(name: string | undefined | null): string {
  if (!name?.trim()) return ''

  const parts = name.trim().split(/\s+/)
  const first = parts.at(0)?.at(0) ?? ''

  let last = ''
  if (parts.length > 1) last = parts.at(-1)?.at(0) ?? ''

  return first.concat(last).toUpperCase()
}

/**
 * O tamanho de um arquivo em unidade legível.
 *
 * Base 1024 e uma casa decimal, que é o que o `backend` conta em
 * `UPLOAD_MAX_SIZE` e o que os gerenciadores de arquivo mostram. Para de subir
 * em MB de propósito: o teto por arquivo do projeto está longe do gigabyte, e
 * uma unidade que nunca aparece é um ramo que nunca é exercido.
 *
 * Mora aqui, e não na fila de upload que a estreou: quem mostra tamanho de
 * arquivo é o campo de imagem e a lista de anexos, e duas implementações
 * divergiriam na primeira mudança de arredondamento.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`

  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`

  return `${(kb / 1024).toFixed(1)} MB`
}
