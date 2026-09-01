import env from '#start/env'

/**
 * Configuração do documento OpenAPI.
 *
 * Só o que não dá para derivar do código mora aqui. Rota, método, parâmetros de
 * caminho, exigência de autenticação e papéis saem do próprio router em tempo de
 * geração (`app/core/openapi/document.ts`); payload e resposta saem dos schemas
 * VineJS. O que sobra é identidade do documento e rótulo humano de tag.
 */

/**
 * Nome do esquema de segurança referenciado por toda operação autenticada.
 *
 * É `apiKey` em cookie, não `bearer`: o guard da aplicação lê o token de
 * `request.cookie('access-token')` e não tem fallback para o header
 * `Authorization` (`app/guards/cookie-access-tokens.guard.ts`). Documentar
 * bearer aqui faria o "Test Request" do Scalar falhar sempre.
 */
export const SECURITY_SCHEME = 'cookieAuth'

/**
 * Cookie que carrega o token de acesso. Espelha `COOKIE_TOKEN.ACCESS` de
 * `app/services/cookie.service.ts`.
 */
export const SECURITY_COOKIE = 'access-token'

/**
 * Rótulo de um grupo de operações na barra lateral do Scalar.
 *
 * O casamento é por prefixo de caminho, não por nome de rota: o subgrupo de
 * ciclo de vida do painel é `.as('lifecycle')`, então o nome da rota de apagar
 * empresa é `administrator.lifecycle.companies.purge` e agruparia junto com
 * apagar categoria. O caminho (`/administrator/companies/:id`) não tem esse
 * problema.
 */
export type TagRule = {
  prefix: string
  name: string
  description: string
  /**
   * O substantivo do recurso, usado para montar o resumo de cada operação:
   * `create` + `curso` → "Criar curso". Escrever o par uma vez por grupo
   * cobre as cinco operações dele, em vez de um resumo por controller.
   */
  singular?: string
  plural?: string
}

const tags: TagRule[] = [
  {
    prefix: '/authentication',
    name: 'Autenticação',
    description:
      'Entrada e saída da secretaria. O par de tokens viaja em cookie `httpOnly`, então estas ' +
      'rotas respondem `204` sem corpo - o que importa é o `Set-Cookie`.',
    singular: 'sessão',
    plural: 'sessões',
  },
  {
    prefix: '/storefront/courses',
    name: 'Site · Cursos',
    description:
      'Os cursos como o candidato os vê, sem autenticação. Só curso `ACTIVE` e não removido, ' +
      'com a grade, o FAQ, a próxima turma e as vagas restantes. É o que a landing consome.',
    singular: 'curso',
    plural: 'cursos',
  },
  {
    prefix: '/storefront/enrollments',
    name: 'Site · Matrícula',
    description:
      'A matrícula virtual, sem autenticação - quem se inscreve não tem conta e não vai ter. ' +
      'A criação devolve um `protocol`, e é só por ele que o candidato acompanha o próprio ' +
      'pedido depois. Turma lotada não recusa a inscrição: ela entra como `WAITLIST`.',
    singular: 'matrícula',
    plural: 'matrículas',
  },
  {
    prefix: '/storages',
    name: 'Arquivos',
    description:
      'Upload presigned multipart: o binário vai do navegador direto ao bucket e nunca ' +
      'atravessa esta API. `POST /storages` abre a sessão de upload, `/parts` assina as ' +
      'partes, `/complete` fecha. Só arquivo `UPLOADED` pode ser anexado a uma matrícula.',
    singular: 'arquivo',
    plural: 'arquivos',
  },
  {
    prefix: '/account',
    name: 'Conta',
    description: 'O perfil de quem está autenticado no painel.',
    singular: 'conta',
    plural: 'contas',
  },
  {
    prefix: '/administrator/courses',
    name: 'Painel · Cursos',
    description:
      'O curso e o que pende dele - a grade dos sábados e o FAQ. Arquivar tira da vitrine e ' +
      'da lixeira; apagar só aceita o que já está arquivado, e recusa curso com turma.',
    singular: 'curso',
    plural: 'cursos',
  },
  {
    prefix: '/administrator/classes',
    name: 'Painel · Turmas',
    description:
      'As turmas de cada curso: data de início, dia, turno, local e capacidade. A ocupação é ' +
      'derivada das matrículas que tomam vaga, não digitada - por isso não há campo para ela.',
    singular: 'turma',
    plural: 'turmas',
  },
  {
    prefix: '/administrator/enrollments',
    name: 'Painel · Matrículas',
    description:
      'A fila da secretaria. A confirmação é humana por definição: não há gateway no v1, ' +
      'então alguém confere o comprovante do Pix e move o estado. Exporta CSV.',
    singular: 'matrícula',
    plural: 'matrículas',
  },
]

const openapi = {
  info: {
    title: 'Maiyu Academy API',
    version: '1.0.0',
    description:
      'API da Maiyu Academy, escola de tecnologia em Benjamin Constant/AM.\n\n' +
      'São duas audiências no mesmo documento: as rotas de `/storefront` e `/storages` são ' +
      'públicas e sustentam a landing e a matrícula virtual; as de `/administrator` exigem ' +
      'sessão e são o painel da secretaria.\n\n' +
      'A sessão viaja em cookie `httpOnly` (`access-token`), emitido por ' +
      '`POST /authentication/sign-in`. ' +
      'Toda falha devolve o mesmo corpo: `{ message, status, code, errors? }`, onde `code` é ' +
      'o identificador de máquina e `errors` mapeia campo para mensagem quando a falha é por campo.',
  },

  servers: [{ url: env.get('APP_URL'), description: 'Servidor atual' }],

  /** Caminhos que nunca entram no documento: não são operação de API. */
  ignore: ['/', '/documentation', '/openapi.json', '/health'],

  tags,
}

export default openapi
