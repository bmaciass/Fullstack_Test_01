import type { BaseError } from './BaseError'

export class UnauthorizedError extends Error implements BaseError {
  readonly statusCode = 401
  readonly code = 'UNAUTHORIZED'
  readonly isOperational = true

  constructor(
    message: string = 'Authentication required',
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = 'UnauthorizedError'
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