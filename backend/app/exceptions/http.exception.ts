import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * O corpo JSON que toda falha da API devolve. Segue a convenção do AdonisJS:
 * `status` é o número HTTP e `code` é o código de máquina - o inverso do
 * padrão original em Fastify, onde `code` era o número e `cause` o código.
 */
export type HTTPExceptionPayload = {
  message: string
  status: number
  code: string
  errors?: Record<string, string>
}

/**
 * Falha de negócio pronta para virar resposta HTTP. Construída só pelas
 * fábricas estáticas - a assinatura posicional é a mesma do projeto de
 * origem: `(message, code, errors?)`.
 *
 * O `handle()` faz esta exceção se resolver sozinha: o AdonisJS o chama
 * quando a exceção sobe de um controller, sem passar pelo handler global.
 */
export default class HTTPException extends Exception {
  declare code: string
  errors?: Record<string, string>

  protected constructor(payload: HTTPExceptionPayload) {
    super(payload.message, { status: payload.status, code: payload.code })

    if (payload.errors) {
      this.errors = payload.errors
    }
  }

  /**
   * O corpo da resposta. `errors` só aparece quando existe - erro sem detalhe
   * por campo não inventa uma chave vazia.
   */
  toResponse(): HTTPExceptionPayload {
    const body: HTTPExceptionPayload = {
      message: this.message,
      status: this.status,
      code: this.code,
    }

    if (this.errors) {
      body.errors = this.errors
    }

    return body
  }

  handle(error: this, { response }: HttpContext) {
    return response.status(error.status).send(error.toResponse())
  }

  // 4xx - erros do cliente

  static Unauthorized(
    message = 'Não autorizado',
    code = 'AUTHENTICATION_REQUIRED',
    errors?: Record<string, string>
  ): HTTPException {
    return new HTTPException({ message, status: 401, code, errors })
  }

  static Forbidden(
    message = 'Acesso negado',
    code = 'ACCESS_DENIED',
    errors?: Record<string, string>
  ): HTTPException {
    return new HTTPException({ message, status: 403, code, errors })
  }

  static NotFound(
    message = 'Recurso não encontrado',
    code = 'RESOURCE_NOT_FOUND',
    errors?: Record<string, string>
  ): HTTPException {
    return new HTTPException({ message, status: 404, code, errors })
  }

  static Conflict(
    message = 'Conflito na requisição',
    code = 'CONFLICT_IN_REQUEST',
    errors?: Record<string, string>
  ): HTTPException {
    return new HTTPException({ message, status: 409, code, errors })
  }

  static UnprocessableEntity(
    message = 'Dados inválidos',
    code = 'UNPROCESSABLE_ENTITY',
    errors?: Record<string, string>
  ): HTTPException {
    return new HTTPException({ message, status: 422, code, errors })
  }

  // 5xx - erros do servidor

  static InternalServerError(
    message = 'Erro interno do servidor',
    code = 'SERVER_ERROR'
  ): HTTPException {
    return new HTTPException({ message, status: 500, code })
  }

  static ServiceUnavailable(
    message = 'Serviço indisponível',
    code = 'SERVICE_UNAVAILABLE'
  ): HTTPException {
    return new HTTPException({ message, status: 503, code })
  }
}
