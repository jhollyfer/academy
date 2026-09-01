import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { applyHTTPErrorToForm, applyMutationError } from './form-errors'
import { HTTPError } from '#/integrations/tanstack-query/http'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

type FormValues = { name: string; slug: string }

const FIELDS = ['name', 'slug'] as const

/** Só `setError` é usado; o resto do formulário não entra nesta conta. */
function formStub() {
  const setError = vi.fn()

  return {
    setError,
    form: { setError } as unknown as UseFormReturn<FormValues & FieldValues>,
  }
}

function httpError(errors?: Record<string, string>, status = 422) {
  return new HTTPError({
    message: 'Dados inválidos',
    status,
    code: 'VALIDATION_ERROR',
    errors,
  })
}

describe('applyHTTPErrorToForm', () => {
  it('marca o campo que o backend acusou', () => {
    const { form, setError } = formStub()

    const handled = applyHTTPErrorToForm({
      form,
      error: httpError({ name: 'Categoria já existe' }),
      fields: FIELDS,
    })

    expect(handled).toBe(true)
    expect(setError).toHaveBeenCalledWith('name', {
      message: 'Categoria já existe',
    })
  })

  it('leva `root` para o formulário, e não para um campo', () => {
    const { form, setError } = formStub()

    applyHTTPErrorToForm({
      form,
      error: httpError({ root: 'Credenciais inválidas' }),
      fields: FIELDS,
    })

    expect(setError).toHaveBeenCalledWith('root', {
      message: 'Credenciais inválidas',
    })
  })

  it('não engole chave desconhecida: ela vira mensagem do formulário', () => {
    const { form, setError } = formStub()

    const handled = applyHTTPErrorToForm({
      form,
      error: httpError({ campoQueNinguemConhece: 'Valor inesperado' }),
      fields: FIELDS,
    })

    expect(handled).toBe(true)
    expect(setError).toHaveBeenCalledWith('root', {
      message: 'Valor inesperado',
    })
  })

  it('devolve false quando não há nada atribuível - aí a tela decide', () => {
    const { form, setError } = formStub()

    const handled = applyHTTPErrorToForm({
      form,
      error: httpError(undefined, 500),
      fields: FIELDS,
    })

    expect(handled).toBe(false)
    expect(setError).not.toHaveBeenCalled()
  })
})

describe('applyMutationError', () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear()
  })

  it('erro de campo para aqui: nem aviso, nem mensagem de rodapé', () => {
    const { form, setError } = formStub()

    applyMutationError({
      form,
      error: httpError({ name: 'Categoria já existe' }),
      fields: FIELDS,
      retry: { id: 'x', onClick: vi.fn() },
    })

    expect(setError).toHaveBeenCalledWith('name', {
      message: 'Categoria já existe',
    })
    expect(setError).not.toHaveBeenCalledWith('root', expect.anything())
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('5xx com `retry`: aviso com a ação, e nada no rodapé', () => {
    const { form, setError } = formStub()
    const onClick = vi.fn()

    applyMutationError({
      form,
      error: httpError(undefined, 500),
      fields: FIELDS,
      retry: { id: 'category-create-error', onClick },
    })

    expect(setError).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Dados inválidos', {
      id: 'category-create-error',
      action: { label: 'Tentar de novo', onClick },
    })
  })

  it('5xx sem `retry`: cai no rodapé como qualquer outro', () => {
    const { form, setError } = formStub()

    applyMutationError({
      form,
      error: httpError(undefined, 500),
      fields: FIELDS,
    })

    expect(toast.error).not.toHaveBeenCalled()
    expect(setError).toHaveBeenCalledWith('root', {
      message: 'Dados inválidos',
    })
  })

  it('`retry` não vale para erro que não é do servidor', () => {
    const { form, setError } = formStub()

    applyMutationError({
      form,
      error: httpError(undefined, 403),
      fields: FIELDS,
      retry: { id: 'x', onClick: vi.fn() },
    })

    expect(toast.error).not.toHaveBeenCalled()
    expect(setError).toHaveBeenCalledWith('root', {
      message: 'Dados inválidos',
    })
  })
})
