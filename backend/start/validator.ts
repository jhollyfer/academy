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
  'cpf': 'o CPF',
  'cnpj': 'o CNPJ',
  'role': 'o papel',
  'status': 'o status',
  'notes': 'as observações',
  'avatarId': 'o avatar',
  'userId': 'o usuário',
  'customerId': 'o cliente',
  'id': 'o identificador',
  'identifier': 'o identificador',
  'code': 'o código',
  'publicCode': 'o código público',

  // ── Empresa e organização ────────────────────────────────────────────
  'legalName': 'a razão social',
  'tradeName': 'o nome fantasia',
  'logoId': 'o logotipo',
  'companyId': 'a empresa',
  'organizationId': 'a organização',
  'mission': 'a missão',
  'kind': 'o tipo',
  'stage': 'o estágio',
  'foundedAt': 'o ano de fundação',
  'membersCount': 'o total de membros',
  'womenLed': 'a liderança feminina',
  'managedArea': 'a área manejada',
  'commissionRate': 'a comissão',
  'cooperativeRate': 'o repasse à cooperativa',

  // ── Endereço, no nível de cima e aninhado no sign-up ─────────────────
  'cep': 'o CEP',
  'logradouro': 'o logradouro',
  'number': 'o número',
  'complement': 'o complemento',
  'neighborhood': 'o bairro',
  'city': 'a cidade',
  'uf': 'a UF',
  'address': 'o endereço',
  'addressId': 'o endereço',
  'isDefault': 'o endereço padrão',
  'address.cep': 'o CEP',
  'address.logradouro': 'o logradouro',
  'address.number': 'o número',
  'address.complement': 'o complemento',
  'address.neighborhood': 'o bairro',
  'address.city': 'a cidade',
  'address.uf': 'a UF',
  'address.label': 'o rótulo',
  'address.isDefault': 'o endereço padrão',

  // ── Catálogo e produto ───────────────────────────────────────────────
  'slug': 'o slug',
  'description': 'a descrição',
  'icon': 'o ícone',
  'parentId': 'o registro pai',
  'position': 'a posição',
  'sku': 'o SKU',
  'barcode': 'o código de barras',
  'price': 'o preço',
  'discountedPrice': 'o preço promocional',
  'producerPrice': 'o preço do produtor',
  'chargeTax': 'a cobrança de imposto',
  'stock': 'o estoque',
  'weight': 'o peso',
  'categoryId': 'a categoria',
  'subcategoryIds': 'as subcategorias',
  'imageIds': 'as imagens',
  'coverId': 'a imagem de capa',
  'brand': 'a marca',
  'color': 'a cor',
  'features': 'as características',
  'story': 'a história',
  'symbolism': 'o significado',
  'variants': 'as variações',
  'variantId': 'a variação',
  'label': 'o rótulo',

  // ── Origem e rastreabilidade ─────────────────────────────────────────
  'producerId': 'o produtor',
  'producers': 'os produtores',
  'craft': 'o ofício',
  'bio': 'a biografia',
  'joinedAt': 'a data de entrada',
  'imageConsentAt': 'a data do consentimento de imagem',
  'photoId': 'a foto',
  'territoryId': 'o território',
  'communityId': 'a comunidade',
  'materialId': 'a matéria-prima',
  'materials': 'as matérias-primas',
  'techniqueId': 'a técnica',
  'techniques': 'as técnicas',
  'detail': 'o detalhe da técnica',
  'storyBlocks': 'a história em blocos',
  'body': 'o texto do bloco',
  'credit': 'o crédito',
  'storageId': 'o arquivo',
  'url': 'o link',
  'originType': 'o tipo de origem',
  'isNative': 'a origem nativa',
  'harvest': 'a safra',
  'volume': 'o volume',
  'market': 'o mercado',
  'latitude': 'a latitude',
  'longitude': 'a longitude',
  'location': 'o local',
  'traceability': 'a rastreabilidade',
  'happenedAt': 'a data do evento',
  'actor': 'o responsável',
  'documentId': 'o documento',
  'evidenceId': 'a evidência',

  // ── Selos ────────────────────────────────────────────────────────────
  'certificationId': 'o selo',
  'certificationIds': 'os selos',
  'issuer': 'o emissor',
  'issuedAt': 'a data de emissão',
  'expiresAt': 'a data de validade',
  'supersedesId': 'o selo substituído',
  'scope': 'o escopo',

  // ── Impacto ──────────────────────────────────────────────────────────
  'impactProjectId': 'o projeto de impacto',
  'title': 'o título',
  'summary': 'o resumo',
  'narrative': 'a narrativa',
  'startedAt': 'a data de início',
  'endedAt': 'a data de término',
  'effectiveFromAt': 'o início da vigência',
  'periodStartAt': 'o início do período',
  'periodEndAt': 'o fim do período',
  'basis': 'a base de cálculo',
  'shareRate': 'o percentual',
  'amountInCents': 'o valor',
  'beneficiariesCount': 'o total de beneficiários',
  'sdgIds': 'os ODS',

  // ── Blockchain ───────────────────────────────────────────────────────
  'onchain': 'o registro em blockchain',
  'network': 'a rede',
  'contractAddress': 'o endereço do contrato',
  'tokenId': 'o token',
  'txHash': 'o hash da transação',
  'wallet': 'a carteira',
  'explorerUrl': 'o link do explorador',
  'registeredAt': 'a data do registro',

  // ── Pedido e avaliação ───────────────────────────────────────────────
  'items': 'os itens',
  'productId': 'o produto',
  'quantity': 'a quantidade',
  'paymentMethod': 'a forma de pagamento',
  'paymentStatus': 'o status do pagamento',
  'cancellationReason': 'o motivo do cancelamento',
  'rating': 'a nota',
  'comment': 'o comentário',

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
  'categorySlug': 'a categoria',
  'subcategorySlug': 'a subcategoria',
  'companySlug': 'a empresa',
  'certificationSlug': 'o selo',
  'territorySlug': 'o território',
  'communitySlug': 'a comunidade',
  'organizationSlug': 'a organização',
  'producerSlug': 'o produtor',
  'techniqueSlug': 'a técnica',
  'minPrice': 'o preço mínimo',
  'maxPrice': 'o preço máximo',
  'available': 'a disponibilidade',
  'published': 'a publicação',
  'linked': 'o vínculo com login',
  'current': 'a vigência',
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
