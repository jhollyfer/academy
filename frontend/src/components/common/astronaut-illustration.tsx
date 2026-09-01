import type * as React from 'react'

import { cn } from '#/lib/utils'

type AstronautIllustrationProps = {
  className?: string
}

/**
 * Ilustração decorativa de um astronauta flutuando, em estilo line-art.
 * Usada como overlay sobre o "404" na página de erro.
 */
export function AstronautIllustration({
  className,
}: AstronautIllustrationProps): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      // `text-border` e não `gray-300`: o traço é desenhado em `currentColor`,
      // e um cinza fixo some no tema escuro - era a última cor do projeto que
      // não trocava com o tema.
      className={cn('pointer-events-none text-border select-none', className)}
    >
      {/* estrelas */}
      <circle cx="34" cy="46" r="1.6" fill="currentColor" opacity="0.7" />
      <circle cx="162" cy="58" r="2" fill="currentColor" opacity="0.9" />
      <circle cx="150" cy="150" r="1.6" fill="currentColor" opacity="0.5" />
      <circle cx="40" cy="150" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="24" cy="110" r="1.4" fill="currentColor" opacity="0.6" />

      {/* mangueira ondulada saindo do capacete */}
      <path
        d="M78 62 C 50 70, 46 92, 66 100 C 86 108, 82 130, 56 132 C 38 133.5, 30 122, 34 112"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* jetpack */}
      <rect
        x="86"
        y="96"
        width="14"
        height="30"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* braços */}
      <path
        d="M92 104 C 78 108, 70 118, 74 130"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M124 106 C 138 112, 142 124, 134 134"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* pernas */}
      <path
        d="M104 140 C 98 152, 96 162, 104 170"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M118 140 C 126 150, 130 160, 124 170"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* torso */}
      <rect
        x="92"
        y="98"
        width="34"
        height="46"
        rx="14"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M99 112 h20 M99 122 h20"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.6"
      />

      {/* colar / conexão com capacete */}
      <path
        d="M100 98 q 9 -8 18 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* capacete */}
      <circle cx="109" cy="72" r="23" stroke="currentColor" strokeWidth="2" />
      <ellipse
        cx="112"
        cy="72"
        rx="14"
        ry="16"
        fill="currentColor"
        opacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M102 64 q 8 -6 16 0"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  )
}
