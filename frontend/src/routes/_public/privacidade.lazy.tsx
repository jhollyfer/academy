import type * as React from 'react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { LegalPage } from './-components/legal-page'
import { ADDRESS, WHATSAPP_NUMBER } from '#/lib/site'
import { formatPhone } from '#/lib/format'

export const Route = createLazyFileRoute('/_public/privacidade')({
  component: RouteComponent,
})

/**
 * A política de privacidade.
 *
 * Escrita em português comum e não em juridiquês, porque o público inclui
 * adolescente e pai de adolescente decidindo se entrega o CPF do filho num
 * formulário. Uma política que ninguém lê não cumpre o que a LGPD pede dela.
 *
 * TODO jurídico: revisar antes de publicar, principalmente o tratamento de dado
 * de menor e o prazo de guarda.
 */
function RouteComponent(): React.JSX.Element {
  return (
    <LegalPage title="Política de privacidade" updatedAt="setembro de 2026">
      <p>
        Esta página explica o que a Maiyu Academy faz com os dados que você
        informa ao se matricular. Ela vale para o site inteiro.
      </p>

      <h2>Que dados coletamos</h2>
      <p>
        No formulário de matrícula pedimos nome, data de nascimento, CPF, e-mail
        e telefone do candidato. Quando o candidato tem menos de 18 anos,
        pedimos também nome, CPF e telefone do responsável legal. Se você enviar
        o comprovante do Pix, guardamos o arquivo que você anexou.
      </p>

      <h2>Para que usamos</h2>
      <p>
        Para processar a matrícula, confirmar o pagamento da inscrição e entrar
        em contato sobre a turma. Não usamos seus dados para outra coisa, não
        vendemos e não compartilhamos com terceiros para fins comerciais.
      </p>

      <h2>Dados de menores de idade</h2>
      <p>
        Quando o candidato é menor de 18 anos, o consentimento é dado pelo
        responsável legal, e é por isso que o formulário exige os dados dele. O
        responsável pode pedir acesso, correção ou exclusão dos dados do menor a
        qualquer momento pelos contatos abaixo.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <p>
        Enquanto durar o vínculo com a escola, e depois pelo prazo que a lei
        exigir para registros de matrícula. Matrícula que não se concretiza é
        apagada quando você pedir.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir para ver, corrigir ou apagar seus dados, e pode retirar
        o consentimento a qualquer momento. Basta falar com a secretaria.
      </p>

      <h2>Como falar com a gente</h2>
      <p>
        WhatsApp {formatPhone(WHATSAPP_NUMBER.slice(2))}, ou presencialmente na
        secretaria, em {ADDRESS.city}/{ADDRESS.state}.
      </p>
    </LegalPage>
  )
}
