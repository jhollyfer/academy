import env from '#start/env'

/**
 * O "copia e cola" do Pix, montado aqui em vez de vir pronto de um PSP.
 *
 * O que o aplicativo do banco lê - do campo colado ou do QR - é o **BR Code**,
 * o padrão EMV® que o Banco Central especificou no Manual de Padrões para
 * Iniciação do Pix. Ele não é a chave: é uma sequência de campos
 * `id + tamanho + valor` que carrega a chave dentro, mais o nome de quem
 * recebe, a cidade e um dígito verificador no fim. Colar a chave crua num QR
 * não funciona - o aplicativo não a reconhece como cobrança.
 *
 * Mora no servidor, e não no navegador, pelo mesmo motivo que o
 * `qrcode.service.ts` do `simple-hub` mora: a chave de quem recebe é dado da
 * escola, e montar o código no cliente significaria embutir chave, nome e
 * cidade no bundle - onde trocar a chave passa a exigir rebuild da imagem.
 *
 * Estático e não dinâmico: o BR Code dinâmico exige uma URL de payload servida
 * pelo PSP, com certificado. O estático resolve sem nenhuma integração
 * bancária, que é o que uma escola de curso livre tem.
 */

/** Os identificadores do EMV que este arquivo escreve. */
const ID = {
  PAYLOAD_FORMAT: '00',
  MERCHANT_ACCOUNT: '26',
  MERCHANT_CATEGORY: '52',
  CURRENCY: '53',
  AMOUNT: '54',
  COUNTRY: '58',
  MERCHANT_NAME: '59',
  MERCHANT_CITY: '60',
  ADDITIONAL_DATA: '62',
  CRC: '63',
} as const

/** Os identificadores de dentro do bloco 26, que é aninhado. */
const MERCHANT = {
  GUI: '00',
  KEY: '01',
} as const

/** O identificador de dentro do bloco 62, também aninhado. */
const ADDITIONAL = {
  TXID: '05',
} as const

/**
 * O domínio que marca o bloco 26 como Pix. Fixo pelo manual do Bacen, e não
 * uma escolha nossa.
 */
const PIX_GUI = 'BR.GOV.BCB.PIX'

/** `986` é o real, na ISO 4217. */
const CURRENCY_BRL = '986'

/**
 * Sem categoria de estabelecimento. O manual aceita `0000` para quem não se
 * enquadra, e curso livre não tem MCC próprio.
 */
const MERCHANT_CATEGORY_NONE = '0000'

const COUNTRY_BR = 'BR'

/** BR Code estático: o mesmo código serve para vários pagamentos. */
const PAYLOAD_FORMAT_INDICATOR = '01'

/**
 * Os tetos do manual. Nome e cidade **têm** de caber: o aplicativo do banco
 * recusa o código inteiro quando um campo estoura, e a falha aparece só na hora
 * de pagar.
 */
const LIMIT = {
  NAME: 25,
  CITY: 15,
  TXID: 25,
} as const

/**
 * Um campo do EMV: identificador, tamanho em dois dígitos, valor.
 *
 * O tamanho é o do valor, sempre com dois dígitos - `5` vira `05`. Um campo com
 * tamanho errado desalinha a leitura de tudo o que vem depois, e o aplicativo
 * não diz onde errou.
 */
function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, '0')}${value}`
}

/**
 * Acentuação fora, maiúsculas dentro.
 *
 * O manual restringe nome e cidade ao ASCII imprimível, e um `ç` no nome do
 * recebedor é recusado por parte dos aplicativos - e aceito por outra parte, o
 * que é pior, porque aí o defeito só aparece em alguns celulares.
 */
function ascii(value: string, limit: number): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .slice(0, limit)
    .toUpperCase()
}

/**
 * O CRC-16/CCITT-FALSE do payload, que fecha o código.
 *
 * Polinômio `0x1021` e semente `0xFFFF`, os dois fixados pelo manual. É
 * calculado sobre a string **incluindo** `6304` - o identificador e o tamanho
 * do próprio CRC. Esse detalhe é o que costuma passar despercebido: calcular
 * antes de acrescentá-los dá um dígito que nenhum banco aceita.
 */
export function crc16(payload: string): string {
  let crc = 0xffff

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8

    for (let bit = 0; bit < 8; bit += 1) {
      const overflow = (crc & 0x8000) !== 0

      crc <<= 1

      if (overflow) crc ^= 0x1021

      crc &= 0xffff
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0')
}

type PayloadOptions = {
  /**
   * O valor, em centavos. Ausente, o código sai **sem** valor e o aplicativo
   * pergunta quanto pagar.
   */
  amountInCents?: number | null
  /**
   * O identificador da transação - aqui, o protocolo da matrícula. `***` é o
   * que o manual manda usar quando não há um.
   */
  txid?: string
}

export default class PixService {
  /**
   * A chave, o nome e a cidade de quem recebe.
   *
   * Em `env` e não constante no código: trocar a chave Pix da escola é
   * operação de secretaria, não de deploy. Os defaults são os valores em uso,
   * para o ambiente de desenvolvimento não precisar de configuração nenhuma.
   */
  get key(): string {
    return env.get('PIX_KEY', '47.338.696/0001-24')
  }

  get merchant(): string {
    return env.get('PIX_MERCHANT', 'Maiyu Academy')
  }

  get city(): string {
    return env.get('PIX_CITY', 'Benjamin Constant')
  }

  /**
   * O BR Code completo, pronto para o QR e para o "copia e cola".
   *
   * A ordem dos campos não é livre: o manual a fixa por identificador
   * crescente, e o CRC é sempre o último.
   */
  payload({ amountInCents, txid = '***' }: PayloadOptions = {}): string {
    const account = field(MERCHANT.GUI, PIX_GUI) + field(MERCHANT.KEY, this.key.trim())

    let payload =
      field(ID.PAYLOAD_FORMAT, PAYLOAD_FORMAT_INDICATOR) +
      field(ID.MERCHANT_ACCOUNT, account) +
      field(ID.MERCHANT_CATEGORY, MERCHANT_CATEGORY_NONE) +
      field(ID.CURRENCY, CURRENCY_BRL)

    // Só entra quando há valor: um `5400` não é a mesma coisa que "sem valor",
    // e parte dos aplicativos recusa o primeiro.
    if (amountInCents && amountInCents > 0) {
      payload += field(ID.AMOUNT, (amountInCents / 100).toFixed(2))
    }

    payload +=
      field(ID.COUNTRY, COUNTRY_BR) +
      field(ID.MERCHANT_NAME, ascii(this.merchant, LIMIT.NAME)) +
      field(ID.MERCHANT_CITY, ascii(this.city, LIMIT.CITY)) +
      field(ID.ADDITIONAL_DATA, field(ADDITIONAL.TXID, ascii(txid, LIMIT.TXID)))

    // `6304` entra antes do cálculo: o CRC cobre o próprio cabeçalho.
    const withoutDigit = `${payload}${ID.CRC}04`

    return `${withoutDigit}${crc16(withoutDigit)}`
  }
}
