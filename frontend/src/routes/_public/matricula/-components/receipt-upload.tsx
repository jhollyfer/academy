import * as React from 'react'
import { toast } from 'sonner'
import { Paperclip, Spinner } from '@phosphor-icons/react'
import { useMultipartUpload } from '#/hooks/use-multipart-upload'
import { useEnrollmentAttach } from '#/integrations/tanstack-query/mutations'
import { Button } from '#/components/ui/button'
import { IMAGE_MIMETYPES, isStorageMimetype } from '#/lib/entity'
import { UPLOAD_MAX_SIZE } from '#/lib/validator'

/**
 * O envio do comprovante do Pix.
 *
 * Duas etapas encadeadas: o binário sobe direto ao bucket pelo multipart
 * assinado, e só o `id` do arquivo é anexado à matrícula. O arquivo nunca passa
 * pela API.
 *
 * O caminho é `/storefront/enrollments/:protocol/uploads`, e não `/storages`:
 * quem envia não tem sessão, e a credencial é o próprio protocolo.
 *
 * Aceita imagem e PDF, que é o que sai de um aplicativo de banco - print da tela
 * ou comprovante em PDF.
 */
const ACCEPTED = [...IMAGE_MIMETYPES, 'application/pdf']

export function ReceiptUpload({
  protocol,
  onAttached,
}: {
  protocol: string
  onAttached: () => Promise<void> | void
}): React.JSX.Element {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [progress, setProgress] = React.useState<number | null>(null)

  const { upload } = useMultipartUpload({
    basePath: `/storefront/enrollments/${protocol}/uploads`,
  })

  const attach = useEnrollmentAttach(protocol, {
    onSuccess: async function () {
      toast.success('Comprovante enviado')
      await onAttached()
    },
    onError: function (error) {
      toast.error(error.message)
    },
  })

  async function pick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    // Limpa o input logo: sem isto, escolher o mesmo arquivo de novo depois de
    // um erro não dispara `change`, e a tela fica parada sem explicação.
    event.target.value = ''

    if (!file) return

    if (!isStorageMimetype(file.type) || !ACCEPTED.includes(file.type)) {
      toast.error('Envie uma imagem ou um PDF do comprovante.')
      return
    }

    if (file.size > UPLOAD_MAX_SIZE) {
      toast.error('Arquivo muito grande. O limite é 32 MB.')
      return
    }

    const controller = new AbortController()
    setProgress(0)

    try {
      const storage = await upload(file, setProgress, controller.signal)

      attach.mutate({ storageId: storage.id })
    } catch (error) {
      // O erro do upload é do transporte, não da API: mostra a mensagem dele em
      // vez de uma genérica, que não diria se foi tipo, tamanho ou rede.
      const message = error instanceof Error ? error.message : 'Não deu para enviar o arquivo.'

      toast.error(message)
    } finally {
      setProgress(null)
    }
  }

  const busy = progress !== null || attach.isPending

  return (
    <div className="grid gap-3">
      {/*
        O input fica escondido e o botão o aciona por `ref`. É o único caso em
        que um gatilho invisível se justifica: `<input type="file">` não é
        estilizável, e a alternativa seria um controle nativo que não parece
        parte da página. O botão visível continua sendo o que recebe foco.
      */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={pick}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />

      <Button
        type="button"
        variant="outline"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="w-fit"
      >
        {busy && <Spinner className="animate-spin" />}
        {!busy && <Paperclip />}
        {busy ? 'Enviando...' : 'Anexar comprovante'}
      </Button>

      {progress !== null && (
        <p aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
          {progress}% enviado
        </p>
      )}

      <p className="text-xs text-muted-foreground">Imagem ou PDF, até 32 MB.</p>
    </div>
  )
}
