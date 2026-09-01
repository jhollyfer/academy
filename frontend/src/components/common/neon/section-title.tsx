import { cn } from '#/lib/utils'

/**
 * O título de seção das artes: primeira linha branca, segunda no acento.
 *
 * Duas props e não `children`, ao contrário do resto do kit: aqui as duas linhas
 * têm papéis **diferentes** - uma é o assunto, a outra é o que se afirma sobre
 * ele -, e um `children` livre deixaria cada seção decidir sozinha qual é qual.
 * O gesto é a identidade, e identidade que cada tela reinventa deixa de ser
 * identidade.
 *
 * `eyebrow` é o rótulo pequeno em caixa alta acima do título. Opcional, e
 * **raro**: um por bloco de três seções, no máximo. Um rótulo acima de cada
 * título é o que faz uma página inteira ter o mesmo ritmo em todas as seções, e
 * o efeito de "gerado" vem daí. Na dúvida, o título sozinho basta - a posição da
 * seção na página já a categoriza.
 */
export function SectionTitle({
  eyebrow,
  first,
  second,
  align = 'start',
  className,
  ...rest
}: {
  eyebrow?: string
  first: string
  second?: string
  align?: 'start' | 'center'
} & React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      className={cn('flex flex-col gap-3', align === 'center' && 'items-center text-center', className)}
      {...rest}
    >
      {eyebrow && (
        <span className="font-mono text-xs tracking-[0.18em] text-neon uppercase">{eyebrow}</span>
      )}
      {/*
        Um `<h2>` só, com a segunda linha dentro. Dois títulos irmãos dariam ao
        leitor de tela dois cabeçalhos de mesmo nível para uma frase só, e a
        navegação por cabeçalhos passaria a listar metades de frase.
      */}
      <h2 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight text-balance italic sm:text-4xl lg:text-5xl">
        {first}
        {second && (
          <>
            {' '}
            <span className="text-neon">{second}</span>
          </>
        )}
      </h2>
    </div>
  )
}
