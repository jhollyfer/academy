import QRCode from 'qrcode'

/**
 * O QR do Pix da matrícula.
 *
 * Trazido do `qrcode.service.ts` do `simple-hub`, com uma diferença registrada:
 * lá o QR do passaporte vira linha em `storages`, porque é anexo de uma peça e
 * a `url` dele vai na resposta. Aqui não vira - e o próprio comentário de lá diz
 * por quê: "o da página pública não [precisa], ele é função pura do `slug`, e
 * gravar um arquivo por entidade seria manter um cache que ninguém invalida".
 *
 * O QR do Pix é função pura do BR Code, que por sua vez é função da chave da
 * escola e do valor do curso. Gravar um PNG por matrícula seria criar um cache
 * que a troca da chave Pix invalidaria em silêncio - e ninguém sairia apagando
 * os arquivos antigos.
 *
 * PNG e não SVG, como no irmão: o QR é aberto no celular de quem vai pagar,
 * muitas vezes salvo na galeria para abrir no aplicativo do banco, e PNG abre
 * em qualquer coisa.
 */
export default class QRCodeService {
  /** O lado do PNG, em pixels. Suficiente para ler na tela de um celular. */
  static readonly SIZE = 512

  /**
   * O PNG de um conteúdo, sem gravar nada.
   *
   * Correção de erro média (`M`): o código é lido de tela, não de etiqueta
   * impressa - não vai amassar nem sujar, então os 30% de recuperação do nível
   * `H` só deixariam o desenho mais denso à toa. O BR Code com valor já é uma
   * string longa, e cada módulo a mais custa legibilidade em tela pequena.
   */
  async toBuffer(content: string): Promise<Buffer> {
    return QRCode.toBuffer(content, {
      type: 'png',
      width: QRCodeService.SIZE,
      errorCorrectionLevel: 'M',
      // Margem de 2 módulos e não a de 4 do padrão: a página já dá respiro em
      // volta, e a borda branca do padrão só encolhe o desenho útil.
      margin: 2,
    })
  }
}
