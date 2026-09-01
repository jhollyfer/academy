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
 * A descrição da raiz, herdada por rota que não escreva a sua.
 *
 * Nomeia a cidade de propósito: a busca que traz aluno é local ("curso de
 * robótica Benjamin Constant"), e uma descrição genérica sobre "aprender
 * programação" concorre com o mundo inteiro e não ganha de ninguém.
 */
export const SITE_DESCRIPTION =
  'Escola de tecnologia em Benjamin Constant, no Amazonas. Cursos presenciais de robótica e ' +
  'desenvolvimento web, aos sábados, na FAMETRO.'

/**
 * O título da raiz, que é o nome mais o posicionamento.
 *
 * Separado de `SITE_TITLE` de propósito: este é o título da aba na home e o
 * fallback de quem não define o seu; `SITE_TITLE` é o sufixo curto que as rotas
 * de detalhe concatenam, e repetir o subtítulo em cada uma deixaria o título
 * longo demais para o que o buscador mostra.
 */
export const SITE_TAGLINE = 'Maiyu Academy - Escola de Tecnologia em Benjamin Constant'

/**
 * O WhatsApp da secretaria, só dígitos com o código do país.
 *
 * Todo material impresso manda o aluno para cá, e é o canal que ele já usa. O
 * site fecha o ciclo em vez de competir com ele: o botão flutuante e os CTAs
 * abrem uma conversa com a mensagem já escrita.
 */
export const WHATSAPP_NUMBER = '5597984600872'

/** O endereço da unidade, para o bloco de matrícula presencial e o JSON-LD. */
export const ADDRESS = {
  street: 'FAMETRO',
  city: 'Benjamin Constant',
  state: 'AM',
  country: 'BR',
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
