export abstract class BaseError extends Error {
  abstract readonly statusCode: number
  abstract readonly code: string
  abstract readonly isOperational: boolean

  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
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
