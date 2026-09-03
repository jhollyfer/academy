import type * as React from 'react'
import { useState } from 'react'
import { CalendarBlankIcon } from '@phosphor-icons/react'
import { ptBR } from 'date-fns/locale'
import { useMaskInput } from 'use-mask-input'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import {
  fromWire,
  parseDisplay,
  toDisplay,
  toWire,
  withinRange,
} from '#/lib/date-field'

type DatePickerProps = {
  /** A data em `YYYY-MM-DD`, ou vazio. É o que vai no payload. */
  value: string | null | undefined
  onValueChange: (value: string) => void
  /** Repassado ao campo: os formulários daqui validam em `onTouched`. */
  onBlur?: () => void
  id?: string
  placeholder?: string
  disabled?: boolean
  'aria-invalid'?: boolean
  className?: string
  /** Repassado ao input, para o navegador oferecer o preenchimento certo. */
  autoComplete?: string
  /**
   * O primeiro e o último mês que o campo aceita.
   *
   * Existem por causa da data de nascimento: sem limite o `dropdown` do
   * `react-day-picker` lista uma faixa arbitrária em volta do ano corrente, e
   * quem nasceu em 2008 precisa rolar para achar. Com os dois, a lista é a que
   * o campo aceita, e escolher o ano é um clique.
   *
   * Valem também para o que se digita: um limite que o clique respeita e o
   * teclado ignora seriam duas regras no mesmo campo.
   *
   * A turma não passa nenhum dos dois: a data da primeira aula é sempre perto
   * de hoje, e limitar ali seria inventar uma regra que o backend não tem.
   */
  startMonth?: Date
  endMonth?: Date
}

/**
 * O campo de data: escreve-se `dd/mm/aaaa`, ou escolhe-se no calendário.
 *
 * Era só o calendário, e isso bastava para a primeira aula de uma turma, que
 * fica sempre perto de hoje. Para a data de nascimento não bastava: quem nasceu
 * em 1998 abria o seletor de ano e rolava vinte e oito posições para chegar
 * onde a digitação chega em oito teclas. Agora o input é a via principal e o
 * calendário continua ali, no botão ao lado, para quando a pessoa quiser ver o
 * mês.
 *
 * Não existe `date-picker` no shadcn para instalar - é esta composição, e por
 * isso ela mora aqui em vez de em `components/ui`.
 *
 * O valor que entra e sai é sempre a string `YYYY-MM-DD` que a API troca. O
 * `Date` só existe entre o `parse` e o `format`: guardá-lo no formulário traria
 * fuso e hora para dentro de um campo que é só um dia do calendário. As
 * conversões estão em `lib/date-field.ts`, com teste.
 *
 * O texto é estado local porque digitar é um caminho de mão dupla: o formulário
 * só recebe data completa e válida, e o que está no meio - `07/03/` - precisa
 * ficar na tela sem virar valor. Sincronizar durante o render, e não num
 * `useEffect`: com o React Compiler ligado, o efeito seria uma renderização a
 * mais e uma fonte de laço.
 *
 * `PopoverContent` tem `w-72` e `p-2.5` fixos, e o calendário tem largura
 * própria - daí o `w-auto p-0`.
 */
export function DatePicker({
  value,
  onValueChange,
  onBlur,
  id,
  placeholder = 'dd/mm/aaaa',
  disabled,
  'aria-invalid': invalid,
  className,
  autoComplete,
  startMonth,
  endMonth,
}: DatePickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(() => toDisplay(value))
  const [lastValue, setLastValue] = useState(value)

  // O valor mudou por fora - o calendário, o `reset` do formulário, os
  // `defaultValues` da edição - e o texto acompanha.
  if (value !== lastValue) {
    setLastValue(value)
    setText(toDisplay(value))
  }

  const selected = fromWire(value)

  /**
   * A máscara `dd/mm/aaaa`. `date-br` é alias pronto do Inputmask, com o
   * formato e o placeholder já dentro - conferido no pacote instalado, porque a
   * lista do site está atrás do `.d.ts`.
   */
  const mask = useMaskInput({ mask: 'date-br' })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <InputGroup data-invalid={invalid} className={className}>
        <InputGroupInput
          ref={mask}
          id={id}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete={autoComplete}
          aria-invalid={invalid}
          onChange={(event) => {
            const raw = event.target.value

            setText(raw)

            if (!raw) {
              onValueChange('')
              return
            }

            const parsed = parseDisplay(raw)

            // Data incompleta ou impossível não mexe no valor. Limpar a cada
            // tecla faria o campo piscar de preenchido para vazio no meio da
            // digitação, e um `31/02` viraria 3 de março sem avisar.
            if (!parsed) return
            if (!withinRange(parsed, startMonth, endMonth)) return

            onValueChange(toWire(parsed))
          }}
          onBlur={() => {
            // Ao sair, o que não virou data limpa o valor: é o que faz o
            // validator acusar o campo em vez de deixar passar a data antiga.
            // O texto fica na tela, para a pessoa ver o que digitou.
            if (text && !parseDisplay(text)) onValueChange('')

            onBlur?.()
          }}
        />

        <InputGroupAddon align="inline-end">
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                // O rótulo do campo pertence ao input, que é quem carrega o
                // `id`. Este botão precisa do nome próprio, senão o leitor de
                // tela anuncia só "botão".
                aria-label="Abrir calendário"
              >
                <CalendarBlankIcon />
              </Button>
            }
          />
        </InputGroupAddon>
      </InputGroup>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          captionLayout="dropdown"
          autoFocus
          startMonth={startMonth}
          endMonth={endMonth}
          selected={selected}
          defaultMonth={selected ?? endMonth}
          onSelect={(day) => {
            // Dia nenhum escolhido é limpar o campo, e o vazio é `''` porque é
            // o que o resto dos formulários guarda - `null` faria o React
            // reclamar de campo controlado virando não-controlado.
            if (!day) {
              onValueChange('')
              return
            }

            onValueChange(toWire(day))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
