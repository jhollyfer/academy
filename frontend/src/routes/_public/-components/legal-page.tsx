import type * as React from 'react'

/**
 * A casca das páginas legais.
 *
 * `prose` do plugin de tipografia: são páginas de texto corrido, e estilizar
 * cada `<h2>` e cada `<p>` à mão seria reescrever o que o plugin já faz - com a
 * diferença de que a versão à mão esquece o `<ul>` na primeira revisão de texto.
 *
 * `max-w-[68ch]` sobre o `prose` padrão: o corpo do site já usa essa medida, e
 * linha de 80 caracteres num tema escuro cansa mais que num claro.
 */
export function LegalPage({
  title,
  updatedAt,
  children,
}: {
  title: string
  /** A data da última revisão. Página legal sem data é página legal sem valor. */
  updatedAt: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
      <h1 className="display-title text-display-md font-semibold sm:text-display-lg">
        {title}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Última atualização: {updatedAt}
      </p>

      <div className="prose mt-12 max-w-[68ch] dark:prose-invert prose-a:text-foreground">
        {children}
      </div>
    </div>
  )
}
