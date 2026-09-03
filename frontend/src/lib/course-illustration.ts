/**
 * A ilustração de cada curso, por `slug`.
 *
 * Um mapa e não uma coluna no banco: a arte é decisão de design e vive com o
 * design. Curso novo sem entrada aqui cai no fallback e não fica sem imagem.
 *
 * Em `lib/` e não junto de um dos componentes que o desenham: são duas rotas
 * que precisam da mesma arte - a vitrine da home e o primeiro passo da
 * matrícula -, e um dos dois teria que importar do `-components/` do outro.
 */
const ILLUSTRATIONS: Record<string, string> = {
  robotics: '/ilustracoes/robo-seguidor-de-linha.svg',
  'web-development': '/ilustracoes/notebook-com-codigo.svg',
}

const FALLBACK_ILLUSTRATION = '/ilustracoes/bancada-arduino.svg'

export function courseIllustration(slug: string): string {
  return ILLUSTRATIONS[slug] ?? FALLBACK_ILLUSTRATION
}
