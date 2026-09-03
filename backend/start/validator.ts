/*
|--------------------------------------------------------------------------
| Validator file
|--------------------------------------------------------------------------
|
| The validator file is used for configuring global transforms for VineJS.
| The transform below converts all VineJS date outputs from JavaScript
| Date objects to Luxon DateTime instances, so that validated dates are
| ready to use with Lucid models and other parts of the app that expect
| Luxon DateTime.
|
*/

import { DateTime } from 'luxon'
import vine, { SimpleMessagesProvider, VineDate } from '@vinejs/vine'

declare module '@vinejs/vine/types' {
  interface VineGlobalTransforms {
    date: DateTime
  }
}

VineDate.transform((value) => DateTime.fromJSDate(value))

/*
|--------------------------------------------------------------------------
| Mensagens de validação
|--------------------------------------------------------------------------
|
| Sem isto, o VineJS responde no default em inglês, e a 422 sai bilíngue: o
| envelope de `app/exceptions/handler.ts` é português ("Dados inválidos") e os
| valores de `errors` vinham em inglês, porque `toFieldErrors` copia a mensagem
| verbatim. Todo erro de negócio dos use-cases já era pt-BR - só o erro de
| validação, que é o mais frequente, destoava.
|
| Espelha `frontend/src/lib/validator-messages.ts`, com as mesmas chaves e os
| mesmos textos, mais os campos que só existem aqui e nunca passam por
| formulário. São duas declarações do mesmo conteúdo pelo mesmo motivo dos
| validators: o backend não publica os seus como pacote.
|
| Do lado do frontend há um teste que percorre os validators e cobra rótulo para
| todo campo - foi ele que encontrou os que faltavam aqui. Como os dois mapas
| são o mesmo conteúdo, vale rodá-lo depois de mexer neste arquivo.
|
| Duas armadilhas, se for mexer:
|
| - O segundo mapa troca só o `{{ field }}` **exibido**. A chave do erro segue
|   sendo o caminho do campo (`address.cep`), e é ela que o frontend usa para
|   marcar o input certo. Renomear chave quebra o wizard de cadastro.
| - Não configure `vine.errorReporter`. `toFieldErrors` depende do formato de
|   array `{ field, rule, message }` do `SimpleErrorReporter`.
|
*/

/**
 * O nome amigável de cada campo, na forma que cai bem depois de "Informe".
 *
 * É exportado, e não escrito direto na chamada abaixo, porque o teste de
 * rótulos precisa importá-lo pelo nome - sem depender da ordem dos argumentos
 * do `SimpleMessagesProvider`.
 */
export const FIELD_LABELS = {
  // ── Identidade e conta ───────────────────────────────────────────────
  'name': 'o nome',
  'email': 'o e-mail',
  'password': 'a senha',
  'passwordConfirmation': 'a confirmação da senha',
  'token': 'o link do convite',
  'phone': 'o telefone',
  'role': 'o papel',
  'status': 'o status',
  'notes': 'as observações',
  'avatarId': 'o avatar',
  'id': 'o identificador',

  // ── Empresa e organização ────────────────────────────────────────────
  'kind': 'o tipo',

  // ── Catálogo e produto ───────────────────────────────────────────────
  'slug': 'o slug',
  'description': 'a descrição',
  'position': 'a posição',
  'coverId': 'a imagem de capa',

  // ── Origem e rastreabilidade ─────────────────────────────────────────
  'storageId': 'o arquivo',
  'location': 'o local',

  // ── Impacto ──────────────────────────────────────────────────────────
  'title': 'o título',

  // ── Anexo. Estes não passam por formulário do frontend. ──────────────
  'fileName': 'o nome do arquivo',
  'mimetype': 'o tipo do arquivo',
  'size': 'o tamanho',
  'parts': 'as partes',
  'partNumber': 'o número da parte',
  'etag': 'o ETag',

  // ── Listagem e vitrine ───────────────────────────────────────────────
  'page': 'a página',
  'perPage': 'o total por página',
  'search': 'a busca',
  'sort': 'a ordenação',
  'direction': 'a direção da ordenação',
  'trashed': 'o filtro de arquivados',

  // ── Cursos ───────────────────────────────────────────────────────────
  'accent': 'o tema',
  'tagline': 'a chamada',
  'workloadHours': 'a carga horária',
  'durationMonths': 'a duração',
  'enrollmentFeeInCents': 'o valor da inscrição',
  'monthlyFeeInCents': 'a mensalidade',
  'minimumAge': 'a idade mínima',
  'requirements': 'os pré-requisitos',
  'projectOutcome': 'o projeto final',
  'modules': 'os encontros',
  'faqs': 'as perguntas',
  'faqs.question': 'a pergunta',
  'faqs.answer': 'a resposta',

  // ── Turmas ───────────────────────────────────────────────────────────
  'courseId': 'o curso',
  'classId': 'a turma',
  'weekday': 'o dia da semana',
  'shift': 'o turno',
  'startsAt': 'a data de início',
  'endsAt': 'a data de término',
  'startsAtTime': 'o horário de início',
  'endsAtTime': 'o horário de término',
  'capacity': 'a quantidade de vagas',

  // ── Matrículas ───────────────────────────────────────────────────────
  'protocol': 'o protocolo',
  'studentId': 'o aluno',
  'studentName': 'o nome do aluno',
  'studentBirthDate': 'a data de nascimento',
  'studentDocument': 'o CPF do aluno',
  'guardianName': 'o nome do responsável',
  'guardianDocument': 'o CPF do responsável',
  'guardianPhone': 'o telefone do responsável',
  'termsAccepted': 'o aceite dos termos',
  'lgpdConsent': 'o consentimento de dados',

  // ── Conta ────────────────────────────────────────────────────────────
  'currentPassword': 'a senha atual',
}

/**
 * A frase de cada regra de validação.
 *
 * É exportado pelo mesmo motivo de `FIELD_LABELS` abaixo: o teste de mensagens
 * precisa importá-lo pelo nome, sem depender da ordem dos argumentos do
 * `SimpleMessagesProvider`. É o par de `RULE_MESSAGES` em
 * `frontend/src/lib/validator-messages.ts`, e os dois têm que sair iguais.
 */
export const RULE_MESSAGES = {
  // ── Genéricas ────────────────────────────────────────────────────────
  // O `{{ field }}` só aparece onde a frase começa por verbo. Os nomes
  // amigáveis do segundo mapa carregam artigo ("o preço"), então campo no
  // início da frase sairia em minúscula, e `'em {{ field }}'` sairia como
  // "em a senha". Nas demais regras o nome é omitido: o erro é renderizado
  // sob o campo rotulado, e na API vem indexado pelo nome dele.
  'required': 'Informe {{ field }}',
  'string': 'Informe {{ field }}',
  'enum': 'Selecione {{ field }}',
  'email': 'Informe um e-mail válido',
  'number': 'Informe um número válido',
  'boolean': 'Informe verdadeiro ou falso',
  'array': 'Informe uma lista',
  'object': 'Informe um objeto',
  'uuid': 'Selecione uma opção válida',
  'minLength': 'Informe ao menos {{ min }} caracteres',
  'maxLength': 'Informe no máximo {{ max }} caracteres',
  'fixedLength': 'Informe {{ size }} caracteres',
  'min': 'Informe um valor maior ou igual a {{ min }}',
  'max': 'Informe um valor menor ou igual a {{ max }}',
  'withoutDecimals': 'Informe um número inteiro',
  'url': 'Informe um link válido',
  'array.maxLength': 'Informe no máximo {{ max }} itens',

  // ── Senha ────────────────────────────────────────────────────────────
  // Os quatro `.regex()` de `password()` reportam todos a chave
  // `password.regex`, e o VineJS para na primeira que falha - não há como dar
  // uma mensagem por classe de caractere. Daí a mensagem combinada.
  'password.regex': 'A senha precisa de letra minúscula, maiúscula, número e caractere especial',
  'password.minLength': 'A senha deve ter ao menos {{ min }} caracteres',
  'password.maxLength': 'A senha deve ter no máximo {{ max }} caracteres',
  // `confirmed` roda em `password` mas reporta em `passwordConfirmation`.
  'passwordConfirmation.confirmed': 'As senhas não são iguais',

  // ── Convite ──────────────────────────────────────────────────────────
  // O token vem da URL, e não de um campo que alguém preencheu. "Informe 64
  // caracteres" não diria nada a quem clicou num link truncado pelo cliente de
  // e-mail - o que a pessoa precisa saber é que o caminho é pedir outro.
  'token.fixedLength': 'Link de convite inválido. Peça um novo à secretaria',
  'token.string': 'Link de convite inválido. Peça um novo à secretaria',

  // ── Documentos e endereço ────────────────────────────────────────────
  // Estas contam DÍGITOS, e não caracteres: `cpf()`, `cnpj()` e `cep()` fazem
  // `.parse()` tirando a máscara antes da regra de tamanho. A genérica
  // `fixedLength` diria "Informe 11 caracteres" para um CPF, o que é falso
  // para quem digitou "123.456.789-0" e contou treze.
  'cpf.fixedLength': 'CPF deve ter 11 dígitos',
  // O `regex` de `phone()` roda sobre os dígitos já sem máscara, então a
  // mensagem fala de DDD e não de formato.
  'phone.regex': 'Informe um telefone com DDD, como (92) 99999-0000',
  'cnpj.fixedLength': 'CNPJ deve ter 14 dígitos',
  'cnpj.regex': 'CNPJ inválido',
  'cnpj.checkDigits': 'CNPJ inválido',
  'cpf.checkDigits': 'CPF inválido',

  // A regra própria de `endsAtTime`: a mensagem do report é genérica, e esta
  // é a que a tela mostra.
  'endsAtTime.afterTimeField': 'O horário de término deve ser depois do de início',
  'cep.fixedLength': 'CEP deve ter 8 dígitos',
  'address.cep.fixedLength': 'CEP deve ter 8 dígitos',
  'uf.regex': 'UF deve ter 2 letras',
  'uf.fixedLength': 'UF deve ter 2 letras',
  'address.uf.regex': 'Selecione a UF',
  'address.uf.fixedLength': 'Selecione a UF',

  // ── Arquivo ──────────────────────────────────────────────────────────
  'file.size': 'O arquivo deve ter no máximo {{ size }}',
  'file.extname': 'Formato não aceito. Use {{ extnames }}',
}

vine.messagesProvider = new SimpleMessagesProvider(RULE_MESSAGES, FIELD_LABELS)
