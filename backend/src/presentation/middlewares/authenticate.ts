import type { NextFunction, Response } from 'express'
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError'
import { JwtService } from '../../infrastructure/services/JwtService'
import type { AuthenticatedRequest } from '../types/AuthenticatedRequest'

const jwtService = new JwtService()

export const authenticate = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided')
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Invalid authorization header format')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    const payload = jwtService.verifyAccessToken(token)

    req.user = {
      userId: payload.userId,
      email: payload.email,
    }

    next()
  } catch (error) {
    next(error)
  }
}