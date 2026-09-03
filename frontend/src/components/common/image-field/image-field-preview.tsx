import type * as React from 'react'

import { useImageFieldContext } from './image-field-context'

import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { cn } from '#/lib/utils'
import type { Merge } from '#/lib/interfaces'

type ImageFieldPreviewProps = Merge<
  React.ComponentProps<typeof Avatar>,
  {
    /** O texto alternativo da imagem. Acessibilidade, não markup - segue prop. */
    alt: string
    /** A sigla que aparece enquanto não há imagem. */
    children: React.ReactNode
  }
>

/** O quadrado com a imagem atual, ou a sigla enquanto não há nenhuma. */
export function ImageFieldPreview({
  alt,
  className,
  children,
  ...props
}: ImageFieldPreviewProps): React.JSX.Element {
  const { shown } = useImageFieldContext('ImageFieldPreview')

  return (
    <Avatar
      data-slot="image-field-preview"
      className={cn('size-16 rounded-lg', className)}
      {...props}
    >
      {shown && <AvatarImage src={shown} alt={alt} />}
      {/* `text-foreground` pelo mesmo motivo do avatar da barra lateral:
          a sigla sobre `--muted` reprova AA no tema escuro por 0,26. */}
      <AvatarFallback className="rounded-lg text-foreground">
        {children}
      </AvatarFallback>
    </Avatar>
  )
}
