import type { BaseError } from './BaseError'

export class InternalServerError extends Error implements BaseError {
  readonly statusCode = 500
  readonly code = 'INTERNAL_SERVER_ERROR'
  readonly isOperational = false

  constructor(
    message: string = 'Internal server error',
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = 'InternalServerError'
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