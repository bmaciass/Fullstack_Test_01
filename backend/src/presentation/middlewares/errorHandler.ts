import type { Request, Response, NextFunction } from 'express'
import { BaseError } from '../../domain/errors'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error for debugging
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Handle custom errors
  if ('statusCode' in err && 'code' in err && 'isOperational' in err) {
    const customError = err as BaseError
    res.status(customError.statusCode).json({
      success: false,
      error: {
        code: customError.code,
        message: customError.message,
        details: customError.details,
      },
    })
    return
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any

    // Unique constraint violation
    if (prismaError.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A record with this value already exists',
          details: { fields: prismaError.meta?.target },
        },
      })
      return
    }

    // Foreign key constraint violation
    if (prismaError.code === 'P2003') {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Related record not found',
          details: { field: prismaError.meta?.field_name },
        },
      })
      return
    }

    // Record not found
    if (prismaError.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      })
      return
    }
  }

  // Handle validation errors (e.g., from Zod or class-validator)
  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: (err as any).errors,
      },
    })
    return
  }

  // Default to 500 Internal Server Error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  })
}