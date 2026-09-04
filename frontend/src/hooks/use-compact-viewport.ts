import * as React from 'react'

/**
 * A largura abaixo da qual a tela é estreita para o painel.
 *
 * 1280px é o `xl` do Tailwind, e é onde a conta fecha: com a sidebar aberta
 * (256px) e o `p-4` da área de conteúdo, sobram cerca de 990px - menos que a
 * largura somada de qualquer uma das três tabelas do painel, que vai de 1086px
 * em Matrículas a 1186px em Cursos. Colapsada, a sidebar ocupa 48px e devolve
 * 208px, e as três passam a caber.
 *
 * As larguras das tabelas são fixas porque a grade é `table-layout: fixed` e
 * cada coluna declara `size` - nenhuma encolhe para caber, então a única saída
 * numa tela estreita seria rolar na horizontal. Rolar continua funcionando; o
 * defeito era precisar dele sempre.
 */
const COMPACT_BREAKPOINT = 1280

/**
 * A tela é estreita o bastante para o painel abrir mão da sidebar expandida?
 *
 * Existe porque `useIsMobile` responde outra pergunta: abaixo de 768px a
 * sidebar vira gaveta, e entre 768 e 1280 - toda a faixa dos notebooks - ela
 * não respondia a nada. Ficava aberta em 256px sobre uma tabela que já não
 * cabia, que foi o que o teste de aceitação relatou.
 *
 * Começa em `false` e só decide depois de montar, como `useIsMobile`: ler
 * `window` no inicializador daria um valor diferente do HTML do servidor e
 * quebraria a hidratação.
 */
export function useCompactViewport(): boolean {
  const [compact, setCompact] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT - 1}px)`)

    function sync(): void {
      setCompact(query.matches)
    }

    sync()
    query.addEventListener('change', sync)

    return () => query.removeEventListener('change', sync)
  }, [])

  return compact
}
