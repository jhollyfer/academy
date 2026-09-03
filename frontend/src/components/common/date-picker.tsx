import type * as React from 'react'
import { useState } from 'react'
import { CalendarBlankIcon } from '@phosphor-icons/react'
import { format, isValid, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '#/components/ui/button'
import { Calendar } from '#/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '#/components/ui/popover'
import { cn } from '#/lib/utils'

/** O formato que a API troca, e o único que atravessa este componente. */
const WIRE = 'yyyy-MM-dd'

/**
 * Converte `YYYY-MM-DD` para `Date` **sem passar por UTC**.
 *
 * `new Date('2026-07-31')` é interpretado como meia-noite UTC, e em qualquer
 * fuso negativo - o Brasil inteiro - isso vira 30 de julho no horário local. O
 * `parse` do `date-fns` monta a data no fuso local a partir dos componentes, que
 * é o que evita o campo mostrar sempre um dia a menos do que foi salvo.
 */
function fromWire(value: string | null | undefined): Date | undefined {
  if (!value) return undefined

  const parsed = parse(value.slice(0, 10), WIRE, new Date())
  if (!isValid(parsed)) return undefined

  return parsed
}

type DatePickerProps = {
  /** A data em `YYYY-MM-DD`, ou vazio. É o que vai no payload. */
  value: string | null | undefined
  onValueChange: (value: string) => void
  /** Repassado ao gatilho: os formulários daqui validam em `onTouched`. */
  onBlur?: () => void
  id?: string
  placeholder?: string
  disabled?: boolean
  'aria-invalid'?: boolean
  className?: string
  /**
   * O primeiro e o último mês que o seletor de ano oferece.
   *
   * Existem por causa da data de nascimento: sem limite o `dropdown` do
   * `react-day-picker` lista uma faixa arbitrária em volta do ano corrente, e
   * quem nasceu em 2008 precisa rolar para achar. Com os dois, a lista é a que
   * o campo aceita, e escolher o ano é um clique.
   *
   * A turma não passa nenhum dos dois: a data da primeira aula é sempre perto
   * de hoje, e limitar ali seria inventar uma regra que o backend não tem.
   */
  startMonth?: Date
  endMonth?: Date
}

/**
 * O campo de data: um botão que abre o calendário num popover.
 *
 * Não existe `date-picker` no shadcn para instalar - é esta composição de
 * `Popover` com `Calendar`, e por isso ela mora aqui em vez de em
 * `components/ui`.
 *
 * Voltou para `common/` quando ganhou o segundo consumidor: a turma, no painel,
 * e a data de nascimento, no formulário público de matrícula. Ele tinha descido
 * para a pasta da rota de turmas justamente por ter um só, e a regra do
 * `CLAUDE.md` corta nos dois sentidos.
 *
 * O valor que entra e sai é sempre a string `YYYY-MM-DD` que a API troca. O
 * `Date` só existe entre o `parse` e o `format`: guardá-lo no formulário
 * traria fuso e hora para dentro de um campo que é só um dia do calendário.
 *
 * `PopoverContent` tem `w-72` e `p-2.5` fixos, e o calendário tem largura
 * própria - daí o `w-auto p-0`.
 */
export function DatePicker({
  value,
  onValueChange,
  onBlur,
  id,
  placeholder = 'Escolha uma data',
  disabled,
  'aria-invalid': invalid,
  className,
  startMonth,
  endMonth,
}: DatePickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false)

  const selected = fromWire(value)

  let label = placeholder
  if (selected) label = format(selected, 'dd/MM/yyyy', { locale: ptBR })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid}
            onBlur={onBlur}
            className={cn(
              'w-full justify-start font-normal',
              !selected && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarBlankIcon />
            {label}
          </Button>
        }
      />

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

            onValueChange(format(day, WIRE))
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
