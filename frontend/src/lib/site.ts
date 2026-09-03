/**
 * O que identifica o site nos metadados de toda rota.
 *
 * As constantes aparecem nos dois lados - no `head` da raiz, que é o padrão, e
 * no `head` das rotas que caem nele quando não têm metadado próprio.
 * Escrevê-las nos dois lugares garantiria que o cartão de link de uma página
 * anunciasse outra coisa que a home.
 */

/** O nome do produto, e o que fica no fim de todo título. */
export const SITE_TITLE = 'Maiyu Academy'

/**
 * O endereço público do site, sem barra no fim.
 *
 * Existe para o que precisa de URL **absoluta**: o sitemap, que é lido por um
 * rastreador de fora, e qualquer metadado de compartilhamento. Dentro do site
 * nada usa isto - link interno é caminho relativo, e cravar o domínio neles
 * quebraria a navegação em qualquer ambiente que não fosse produção.
 *
 * Não vem de variável de ambiente de propósito: o domínio do site é fixo, e uma
 * variável a mais seria mais uma coisa para configurar errado no dia do deploy.
 */
export const SITE_URL = 'https://academy.maiyu.com.br'

/**
 * A imagem do cartão de link, absoluta.
 *
 * PNG e não o SVG que a gerou: WhatsApp, Telegram e o cartão do X não
 * renderizam SVG, e é justamente neles que o link desta escola circula. O
 * arquivo é gerado do `public/og.svg` e vive versionado ao lado dele.
 *
 * Absoluta porque quem lê é um rastreador de fora: caminho relativo em
 * `og:image` resolve contra o domínio de quem raspa, e não contra o nosso.
 *
 * Para regerar depois de mexer no SVG:
 *   node -e "require('sharp')('public/og.svg',{density:144})\
 *     .resize(1200,630,{fit:'fill'}).png().toFile('public/og.png')"
 */
export const SITE_IMAGE = `${SITE_URL}/og.png`

/** O caminho vira endereço absoluto, para `canonical` e `og:url`. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`
}

/**
 * A descrição da raiz, herdada por rota que não escreva a sua.
 *
 * Nomeia a cidade de propósito: a busca que traz aluno é local ("curso de
 * robótica Benjamin Constant"), e uma descrição genérica sobre "aprender
 * programação" concorre com o mundo inteiro e não ganha de ninguém.
 */
export const SITE_DESCRIPTION =
  'Escola de tecnologia no Alto Solimões, em Benjamin Constant. Cursos presenciais de robótica ' +
  'e desenvolvimento web, aos sábados, para a juventude da região.'

/**
 * O título da raiz, que é o nome mais o posicionamento.
 *
 * Separado de `SITE_TITLE` de propósito: este é o título da aba na home e o
 * fallback de quem não define o seu; `SITE_TITLE` é o sufixo curto que as rotas
 * de detalhe concatenam, e repetir o subtítulo em cada uma deixaria o título
 * longo demais para o que o buscador mostra.
 */
export const SITE_TAGLINE =
  'Maiyu Academy · Escola de Tecnologia em Benjamin Constant'

/**
 * O WhatsApp da secretaria, só dígitos com o código do país.
 *
 * Todo material impresso manda o aluno para cá, e é o canal que ele já usa. O
 * site fecha o ciclo em vez de competir com ele: o botão flutuante e os CTAs
 * abrem uma conversa com a mensagem já escrita.
 */
export const WHATSAPP_NUMBER = '5597984317149'

/**
 * A cidade da escola, para o JSON-LD e para o texto que só precisa dizer onde
 * ela fica.
 *
 * Sem logradouro de propósito - e agora sem nem o campo. A escola ocupa dois
 * prédios, as aulas num e a inscrição presencial noutro, e um `street` só teria
 * de escolher qual dos dois mentir. Quem precisa nomear o prédio lê `CAMPUS` ou
 * `ENROLLMENT_DESK`; quem precisa só da cidade lê daqui.
 */
export const ADDRESS = {
  city: 'Benjamin Constant',
  state: 'AM',
  country: 'BR',
} as const

/**
 * Onde as aulas acontecem.
 *
 * Sem logradouro: o prédio tem nome, e é por ele que se pergunta na cidade.
 * Anunciar um número errado é pior que não anunciar nenhum, porque alguém vai
 * até lá.
 */
export const CAMPUS = {
  name: 'CETI Aristélio Sabino de Oliveira',
  city: 'Benjamin Constant',
  state: 'AM',
} as const

/**
 * Onde a inscrição presencial é feita - e **não** é onde as aulas acontecem.
 *
 * São duas portas para a mesma vaga: o formulário deste site e o balcão. Elas
 * ficam em prédios diferentes, e todo texto que cita uma precisa dizer isso: a
 * página já afirmou o contrário, e quem leu aquilo iria ao prédio errado.
 */
export const ENROLLMENT_DESK = {
  name: 'FAMETRO, unidade Benjamin Constant',
  city: 'Benjamin Constant',
  state: 'AM',
} as const

/**
 * Monta o link de conversa com a mensagem já preenchida.
 *
 * A mensagem entra pronta porque o candidato que chega do anúncio não sabe o
 * que perguntar: um "Olá" solto vira uma conversa que a secretaria tem de
 * puxar, e dizer de qual curso ele veio economiza a primeira troca inteira.
 */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
