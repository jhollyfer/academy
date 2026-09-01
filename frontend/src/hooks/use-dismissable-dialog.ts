import * as React from 'react'

/**
 * Fecha um Dialog/Sheet uncontrolled a partir do sucesso de uma mutation, sem
 * `useState` nem `open`/`onOpenChange`. Ancore o `closeRef` no botão de fechar
 * **visível** do footer (`<DialogClose render={<Button ref={closeRef}>…</Button>} />`)
 * e chame `close()` após `await onSubmit(...)` / no `onSuccess`.
 */
export function useDismissableDialog(): {
  closeRef: React.RefObject<HTMLButtonElement | null>
  close: () => void
} {
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const close = React.useCallback(() => closeRef.current?.click(), [])
  return { closeRef, close }
}
