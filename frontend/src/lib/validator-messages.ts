import { SimpleMessagesProvider } from '@vinejs/vine'

/**
 * As mensagens por regra.
 *
 * A busca do VineJS é do mais específico para o mais genérico - `campo.regra`,
 * depois `*.campo.regra`, depois `regra` - então a regra genérica cobre o caso
 * comum e só o que destoa ganha linha própria.
 *
 * `{{ field }}` é substituído pelo nome amigável de `FIELD_LABELS`, e só aparece
 * onde a frase começa por verbo. Os nomes amigáveis carregam artigo ("o
 * logradouro"), então campo no início da frase sairia em minúscula. Nas demais
 * regras o nome é omitido: o erro é renderizado sob o campo já rotulado.
 */
export const RULE_MESSAGES = {
  // ── Genéricas ──────────────────────────────────────────────────────
  required: 'Informe {{ field }}',
  string: 'Informe {{ field }}',
  enum: 'Selecione {{ field }}',
  email: 'Informe um e-mail válido',
  number: 'Informe um número válido',
  boolean: 'Informe verdadeiro ou falso',
  array: 'Informe uma lista',
  object: 'Informe um objeto',
  uuid: 'Selecione uma opção válida',
  minLength: 'Informe ao menos {{ min }} caracteres',
  maxLength: 'Informe no máximo {{ max }} caracteres',
  fixedLength: 'Informe {{ size }} caracteres',
  min: 'Informe um valor maior ou igual a {{ min }}',
  max: 'Informe um valor menor ou igual a {{ max }}',
  withoutDecimals: 'Informe um número inteiro',
  url: 'Informe um link válido',
  'array.maxLength': 'Informe no máximo {{ max }} itens',

  // ── Senha ──────────────────────────────────────────────────────────
  // Os quatro `.regex()` de `password()` reportam todos a chave
  // `password.regex`, e o VineJS para no primeiro que falha. Não há como dar
  // uma mensagem por classe de caractere, como o Zod dava - daí a mensagem
  // combinada, que lista as quatro exigências de uma vez.
  'password.regex':
    'A senha precisa de letra minúscula, maiúscula, número e caractere especial',
  'password.minLength': 'A senha deve ter ao menos {{ min }} caracteres',
  'password.maxLength': 'A senha deve ter no máximo {{ max }} caracteres',
  // `confirmed` roda em `password` mas reporta em `passwordConfirmation`.
  'passwordConfirmation.confirmed': 'As senhas não são iguais',

  // ── Documentos e endereço ──────────────────────────────────────────
  // Estas contam DÍGITOS, e não caracteres: `cpf()`, `cnpj()` e `cep()` fazem
  // `.parse()` tirando a máscara antes da regra de tamanho. A genérica
  // `fixedLength` diria "Informe 11 caracteres" para um CPF, o que é falso para
  // quem digitou "123.456.789-0" e contou treze.
  // A regra própria de `personName()`. Chave sem prefixo de campo de propósito:
  // vale para o nome do aluno e o do responsável, e para o próximo que vier.
  'personName': 'Informe um nome sem números',
  // A data de nascimento. A genérica falaria em "valor", e o que a pessoa
  // precisa ler é que a data que ela escolheu ainda não aconteceu.
  'date.beforeOrEqual': 'A data de nascimento não pode estar no futuro',
  'cpf.fixedLength': 'CPF deve ter 11 dígitos',
  // O `regex` de `phone()` roda sobre os dígitos já sem máscara, então a
  // mensagem fala de DDD e não de formato.
  'phone.regex': 'Informe um telefone com DDD, como (92) 99999-0000',
  'cpf.checkDigits': 'CPF inválido',

  // A regra própria de `endsAtTime`: a mensagem do report é genérica, e esta
  // é a que a tela mostra.
  'endsAtTime.afterTimeField':
    'O horário de término deve ser depois do de início',
  'cep.fixedLength': 'CEP deve ter 8 dígitos',
  'address.cep.fixedLength': 'CEP deve ter 8 dígitos',
  'uf.fixedLength': 'UF deve ter 2 letras',
  'uf.regex': 'UF deve ter 2 letras',
  'address.uf.fixedLength': 'Selecione a UF',
  'address.uf.regex': 'Selecione a UF',

  // ── Arquivo ────────────────────────────────────────────────────────
  'file.size': 'O arquivo deve ter no máximo {{ size }}',
  'file.extname': 'Formato não aceito. Use {{ extnames }}',
}

/**
 * O nome amigável de cada campo, na forma que cai bem depois de "Informe".
 *
 * Campo fora deste mapa aparece com o nome cru - a tela pede "Selecione
 * categoryId" em vez de "Selecione a categoria". Não quebra nada, só deixa a
 * mensagem feia, e por isso passou meses sem ninguém notar: a entrada era
 * `category` enquanto o campo se chama `categoryId`. `validator-messages.test.ts`
 * percorre os validators e cobra a lista inteira, para que a próxima falta seja
 * um teste vermelho e não um relatório de QA.
 *
 * A chave é o caminho do campo e nada mais - o provider é global e não sabe qual
 * validator está rodando. `name` é o mesmo `name` na categoria, no produto e no
 * cliente, e por isso a mensagem é "Informe o nome" e não "Informe o nome da
 * categoria": o título do dialog já diz de quem é o nome.
 */
export const FIELD_LABELS = {
  // ── Identidade e conta ─────────────────────────────────────────────
  name: 'o nome',
  email: 'o e-mail',
  password: 'a senha',
  passwordConfirmation: 'a confirmação da senha',
  currentPassword: 'a senha atual',
  phone: 'o telefone',
  status: 'a situação',
  role: 'o papel',
  avatarId: 'a foto',
  notes: 'as observações',

  // ── Curso ──────────────────────────────────────────────────────────
  slug: 'o endereço',
  tagline: 'a chamada',
  description: 'a descrição',
  accent: 'o tema do curso',
  workloadHours: 'a carga horária',
  durationMonths: 'a duração em meses',
  minimumAge: 'a idade mínima',
  requirements: 'os requisitos',
  projectOutcome: 'o projeto final',
  enrollmentFeeInCents: 'a taxa de inscrição',
  monthlyFeeInCents: 'a mensalidade',
  coverId: 'a imagem de capa',
  position: 'a posição',
  modules: 'a grade',
  faqs: 'as perguntas frequentes',
  title: 'o título',
  question: 'a pergunta',
  answer: 'a resposta',

  // ── Turma ──────────────────────────────────────────────────────────
  courseId: 'o curso',
  classId: 'a turma',
  startsAt: 'a data de início',
  endsAt: 'a data de término',
  weekday: 'o dia da semana',
  shift: 'o turno',
  startsAtTime: 'a hora de início',
  endsAtTime: 'a hora de término',
  location: 'o local',
  capacity: 'o número de vagas',

  // ── Matrícula ──────────────────────────────────────────────────────
  studentName: 'o nome do aluno',
  studentBirthDate: 'a data de nascimento',
  studentDocument: 'o CPF do aluno',
  guardianName: 'o nome do responsável',
  guardianDocument: 'o CPF do responsável',
  guardianPhone: 'o telefone do responsável',
  termsAccepted: 'o aceite do contrato',
  lgpdConsent: 'o consentimento de uso dos dados',
  protocol: 'o protocolo',

  // ── Arquivos ───────────────────────────────────────────────────────
  storageId: 'o arquivo',
  fileName: 'o nome do arquivo',
  mimetype: 'o tipo do arquivo',
  size: 'o tamanho do arquivo',
  kind: 'o tipo',
  parts: 'as partes do envio',
  partNumber: 'o número da parte',
  etag: 'a identificação da parte',

  // ── Listagem ───────────────────────────────────────────────────────
  page: 'a página',
  perPage: 'o total por página',
  search: 'a busca',
  sort: 'a coluna de ordenação',
  direction: 'o sentido da ordenação',
  trashed: 'o recorte de lixeira',
  id: 'o registro',
}

/**
 * Mensagens de validação em português, num lugar só.
 *
 * O VineJS não aceita mensagem inline por campo como o Zod aceitava: a mensagem
 * vem daqui, por chave.
 *
 * Espelha `backend/start/validator.ts`, com as mesmas chaves e os mesmos textos.
 * São duas declarações do mesmo conteúdo pelo mesmo motivo dos validators: o
 * backend não publica o seu como pacote.
 */
export const messages = new SimpleMessagesProvider(RULE_MESSAGES, FIELD_LABELS)
