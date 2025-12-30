import type { BaseError } from './BaseError'

export class ValidationError extends Error implements BaseError {
  readonly statusCode = 400
  readonly code = 'VALIDATION_ERROR'
  readonly isOperational = true

  constructor(
    message: string = 'Validation failed',
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = 'ValidationError'
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