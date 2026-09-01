import { cn } from '#/lib/utils'

/**
 * Um número grande com rótulo - a barra de fatos abaixo do hero.
 *
 * O número é `<dd>` e o rótulo é `<dt>`, dentro de um `<dl>` que quem usa
 * fornece: é literalmente uma lista de definições, e usar `<div>` desperdiçaria
 * a única semântica do HTML que descreve exatamente isto.
 *
 * A ordem visual é invertida por `flex-col-reverse`, e não trocando as tags: o
 * número aparece primeiro na tela e o termo continua vindo primeiro no
 * documento, que é o que a leitura em voz alta precisa - "4 meses" sozinho não
 * diz nada.
 */
export function StatItem({
  value,
  label,
  className,
  ...rest
}: {
  value: string
  label: string
} & React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div className={cn('flex flex-col-reverse gap-1', className)} {...rest}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-display text-3xl leading-none font-extrabold text-neon italic sm:text-4xl">
        {value}
      </dd>
    </div>
  )
}
