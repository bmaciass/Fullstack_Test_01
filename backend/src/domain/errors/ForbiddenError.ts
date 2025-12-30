import type { BaseError } from './BaseError'

export class ForbiddenError extends Error implements BaseError {
  readonly statusCode = 403
  readonly code = 'FORBIDDEN'
  readonly isOperational = true

  constructor(
    message: string = 'Access denied',
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ForbiddenError'
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    }
  }
}