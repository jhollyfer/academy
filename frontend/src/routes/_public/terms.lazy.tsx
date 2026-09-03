import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { LegalPage } from './-components/legal-page'
import { ADDRESS, WHATSAPP_NUMBER } from '#/lib/site'
import { formatPhone } from '#/lib/format'

export const Route = createLazyFileRoute('/_public/terms')({
  component: RouteComponent,
})

/**
 * Os termos de uso.
 *
 * TODO jurídico: revisar antes de publicar, principalmente a política de
 * cancelamento e devolução da inscrição.
 */
function RouteComponent(): React.JSX.Element {
  return (
    <LegalPage title="Termos de uso" updatedAt="setembro de 2026">
      <p>
        Ao enviar uma matrícula pelo site da Maiyu Academy, você concorda com as
        regras abaixo.
      </p>

      <h2>A matrícula</h2>
      <p>
        Enviar o formulário reserva sua vaga, mas não a confirma. A vaga só é
        confirmada quando a secretaria conferir o comprovante da taxa de
        inscrição. Enquanto isso, sua matrícula fica como pendente, e você
        acompanha pelo número de protocolo que aparece na tela ao enviar.
      </p>

      <h2>Quando a turma está cheia</h2>
      <p>
        Se as vagas acabarem antes do seu envio, sua matrícula entra na fila de
        espera. Você não perde o lugar na fila, e a secretaria avisa se abrir
        vaga.
      </p>

      <h2>Pagamento</h2>
      <p>
        A taxa de inscrição é paga uma vez, no ato da matrícula. A mensalidade é
        paga durante os meses de curso. Os dois valores estão na página de cada
        curso e podem mudar entre uma turma e outra, mas nunca durante uma turma
        já iniciada.
      </p>

      <h2>As aulas</h2>
      <p>
        As aulas são presenciais, em {ADDRESS.city}/{ADDRESS.state}. A escola
        pode remanejar data de aula por motivo de força maior, avisando com
        antecedência.
      </p>

      <h2>Cancelamento</h2>
      <p>
        Você pode cancelar a matrícula falando com a secretaria. As condições de
        devolução da taxa de inscrição são combinadas no ato do cancelamento.
      </p>

      <h2>Dúvidas</h2>
      <p>WhatsApp {formatPhone(WHATSAPP_NUMBER.slice(2))}.</p>
    </LegalPage>
  )
}
