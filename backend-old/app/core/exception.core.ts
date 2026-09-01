export class HTTPException {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {}

  static BadRequest(message: string, cause?: unknown) {
    return new HTTPException(400, message, 'E_BAD_REQUEST', cause)
  }

  static Unauthorized(message: string, cause?: unknown) {
    return new HTTPException(401, message, 'E_UNAUTHORIZED', cause)
  }

  static Forbidden(message: string, cause?: unknown) {
    return new HTTPException(403, message, 'E_FORBIDDEN', cause)
  }

  static NotFound(message: string, cause?: unknown) {
    return new HTTPException(404, message, 'E_NOT_FOUND', cause)
  }

  static Conflict(message: string, cause?: unknown) {
    return new HTTPException(409, message, 'E_CONFLICT', cause)
  }

  static UnprocessableEntity(message: string, cause?: unknown) {
    return new HTTPException(422, message, 'E_UNPROCESSABLE_ENTITY', cause)
  }

  static TooManyRequests(message: string, cause?: unknown) {
    return new HTTPException(429, message, 'E_TOO_MANY_REQUESTS', cause)
  }

  static InternalServerError(message: string, cause?: unknown) {
    return new HTTPException(500, message, 'E_INTERNAL_SERVER_ERROR', cause)
  }

  static ServiceUnavailable(message: string, cause?: unknown) {
    return new HTTPException(503, message, 'E_SERVICE_UNAVAILABLE', cause)
  }

  // ─── Domain-specific errors ──────────────────────────────────────────────

  static InvalidCredentials(message: string, cause?: unknown) {
    return new HTTPException(401, message, 'INVALID_CREDENTIALS', cause)
  }

  static ProductHasActiveOrders(message: string, cause?: unknown) {
    return new HTTPException(409, message, 'PRODUCT_HAS_ACTIVE_ORDERS', cause)
  }

  static InsufficientStock(message: string, cause?: unknown) {
    return new HTTPException(422, message, 'INSUFFICIENT_STOCK', cause)
  }

  static DateBlocked(message: string, cause?: unknown) {
    return new HTTPException(422, message, 'DATE_BLOCKED', cause)
  }

  static MinimumDateNotMet(message: string, cause?: unknown) {
    return new HTTPException(422, message, 'MINIMUM_DATE_NOT_MET', cause)
  }

  static ProductWhatsappOnly(message: string, cause?: unknown) {
    return new HTTPException(422, message, 'PRODUCT_WHATSAPP_ONLY', cause)
  }

  static InvalidStatusTransition(message: string, cause?: unknown) {
    return new HTTPException(422, message, 'INVALID_STATUS_TRANSITION', cause)
  }

  toJSON() {
    return {
      message: this.message,
      code: this.code,
      cause: this.cause,
    }
  }
}
