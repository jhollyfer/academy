import type * as React from 'react'

/**
 * A casca das páginas legais.
 *
 * `prose` do plugin de tipografia: são páginas de texto corrido, e estilizar
 * cada `<h2>` e cada `<p>` à mão seria reescrever o que o plugin já faz - com a
 * diferença de que a versão à mão esquece o `<ul>` na primeira revisão de texto.
 *
 * O `<h1>` usa a tipografia da marca, como todo título do site. Ele fica numa
 * linha só e sem a segunda cor: "Termos de uso" e "Política de privacidade" não
 * se partem em duas metades com sentido, e forçar a quebra ali seria decoração.
 *
 * `max-w-[68ch]` sobre o `prose` padrão: o corpo do site já usa essa medida, e
 * linha de 80 caracteres num tema escuro cansa mais que num claro.
 *
 * Sem `dark:prose-invert` e sem `prose-a:*`: as cores do `prose` estão amarradas
 * às variáveis da casa em `styles.css`, e elas já viram com o tema. O que estava
 * aqui pintava o link com a cor do texto - um link que não se distingue do
 * parágrafo não é um link.
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
      <h1 className="brand-title text-display-md text-foreground sm:text-display-lg">
        {title}
      </h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Última atualização: {updatedAt}
      </p>

      <div className="prose mt-12 max-w-[68ch]">{children}</div>
    </div>
  )
}
