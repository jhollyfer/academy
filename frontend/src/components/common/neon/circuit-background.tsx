import type { Merge } from '#/lib/interfaces'
import { cn } from '#/lib/utils'

/**
 * As trilhas de circuito que ficam atrás de tudo, das artes.
 *
 * SVG inline e não imagem: são quatro caminhos e um padrão, uns 700 bytes
 * depois do gzip. Um PNG a cobriria com dezenas de KB numa página cujo alvo é
 * LCP abaixo de 2,5s em 4G - e ainda pixelaria no monitor grande.
 *
 * `aria-hidden` e `pointer-events-none`: é textura. Leitor de tela não tem o que
 * anunciar aqui, e o elemento não pode roubar clique do que está por cima.
 */
export function CircuitBackground({
  className,
  ...rest
}: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      {...rest}
    >
      <svg className="h-full w-full" width="100%" height="100%">
        <defs>
          <pattern
            id="maiyu-circuit"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/*
              Opacidade baixíssima de propósito. Nas artes a trilha é sentida,
              não lida: qualquer coisa acima disso compete com o texto branco
              por cima e derruba o contraste do que importa.
            */}
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-neon opacity-[0.07]"
            >
              <path d="M0 24 H44 L60 40 H120" />
              <path d="M0 88 H28 L44 72 H84 L100 88 H120" />
              <path d="M60 0 V40" />
              <path d="M84 120 V72" />
            </g>
            <g fill="currentColor" className="text-neon opacity-[0.14]">
              <circle cx="60" cy="40" r="2.5" />
              <circle cx="44" cy="72" r="2.5" />
              <circle cx="100" cy="88" r="2.5" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#maiyu-circuit)" />
      </svg>
      {/*
        O halo verde que as artes têm no topo. `radial-gradient` num elemento
        próprio, e não no `body`: assim ele acompanha a seção em que o
        componente foi posto, em vez de pintar a página inteira.
      */}
      <div className="absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(ellipse_at_center,var(--glow),transparent_70%)] opacity-40" />
    </div>
  )
}

export type CircuitBackgroundProps = Merge<React.ComponentProps<'div'>, {}>
