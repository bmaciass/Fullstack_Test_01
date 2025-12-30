import type { BaseError } from './BaseError'

export class BadRequestError extends Error implements BaseError {
  readonly statusCode = 400
  readonly code = 'BAD_REQUEST'
  readonly isOperational = true

  constructor(
    message: string = 'Bad request',
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = 'BadRequestError'
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