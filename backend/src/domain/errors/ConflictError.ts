import type { BaseError } from './BaseError'

export class ConflictError extends Error implements BaseError {
  readonly statusCode = 409
  readonly code = 'CONFLICT'
  readonly isOperational = true

  constructor(
    message: string = 'Resource conflict',
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ConflictError'
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