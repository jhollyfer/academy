import { cva } from 'class-variance-authority'

/**
 * O estilo dos links de navegação da vitrine: os do painel do celular e os do
 * rodapé.
 *
 * Ele mora aqui, ao lado de `header.tsx` e `footer.tsx`, e não em
 * `components/common/`: quem o usa é esta rota, e `common/` é para o que mais
 * de uma rota compartilha.
 *
 * Existe por dois motivos que são o mesmo. A string do rodapé estava copiada
 * **sete** vezes e a do painel **duas**, então mexer na cor de um link era
 * mexer em nove lugares e esquecer um. E a altura precisava mudar: os links do
 * rodapé tinham ~20px, menos da metade dos 44px que a WCAG 2.5.5 pede para um
 * alvo de toque, e os de contato eram `inline-flex` - a área clicável era a
 * largura do texto e nada mais.
 *
 * `min-h-11` e não `h-11` porque um link do rodapé pode quebrar em duas linhas
 * numa tela estreita, e uma altura fixa cortaria a segunda.
 */
export const navLinkVariants = cva('transition-colors', {
  variants: {
    tone: {
      /**
       * O painel do celular. Já estava nos 44px (`text-base` de 24px mais
       * `py-2.5`), e é por isso que a medida está escrita como está: trocar
       * para `py-2` ou para `text-sm` derruba o alvo abaixo do mínimo.
       */
      sheet:
        'flex items-center rounded-md px-3 py-2.5 text-base text-muted-foreground hover:bg-foreground/5 hover:text-foreground',
      /**
       * O rodapé, sobre a placa escura. O `gap-2` só aparece nos links que têm
       * ícone; nos de texto puro não há segundo filho para separar.
       */
      footer:
        'inline-flex min-h-11 items-center gap-2 text-background/70 hover:text-background dark:text-muted-foreground dark:hover:text-card-foreground',
    },
  },
  defaultVariants: {
    tone: 'footer',
  },
})
