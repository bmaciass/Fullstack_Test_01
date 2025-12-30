import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { BadRequestError } from '../../domain/errors/BadRequestError'

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        next(new BadRequestError(messages.join(', ')))
      } else {
        next(error)
      }
    }
  }
}

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      // req.params = result as typeof req.params
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        next(new BadRequestError(messages.join(', ')))
      } else {
        next(error)
      }
    }
  }
}

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query)
      // req.query = result as typeof req.query
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map(err => `${err.path.join('.')}: ${err.message}`)
        next(new BadRequestError(messages.join(', ')))
      } else {
        next(error)
      }
    }
  }
}
