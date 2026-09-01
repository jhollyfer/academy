import * as React from 'react'
import { WhatsappLogo } from '@phosphor-icons/react'
import { whatsappUrl } from '#/lib/site'

/**
 * O botão flutuante de WhatsApp.
 *
 * Existe porque todo o material impresso manda o aluno para o WhatsApp, e o site
 * não pode competir com o canal que ele já usa - fecha o ciclo em vez de
 * disputá-lo.
 *
 * A mensagem já vem escrita, e diz de qual página a pessoa veio: um "Olá" solto
 * vira uma conversa que a secretaria tem de puxar, e o contexto economiza a
 * primeira troca inteira.
 *
 * `<a>` e não botão: é navegação para outro site, e um botão aqui quebraria o
 * abrir-em-nova-aba do meio do teclado.
 */
export function WhatsappFloat({
  message,
}: {
  message: string
}): React.JSX.Element {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noreferrer"
      // O rótulo acessível é obrigatório: sem ele o leitor de tela anuncia só
      // "link", e o ícone não diz nada a quem não o vê.
      aria-label="Conversar no WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <WhatsappLogo weight="fill" className="size-7" />
    </a>
  )
}
