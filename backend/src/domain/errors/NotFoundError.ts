import type { BaseError } from './BaseError'

export class NotFoundError extends Error implements BaseError {
  readonly statusCode = 404
  readonly code = 'NOT_FOUND'
  readonly isOperational = true

  constructor(
    message: string = 'Resource not found',
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = 'NotFoundError'
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
