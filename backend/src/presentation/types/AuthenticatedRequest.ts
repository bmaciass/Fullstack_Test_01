import type { Request } from 'express'

export interface AuthenticatedUser {
  userId: number
  email: string
}

export interface AuthenticatedRequest<
  TBody = unknown,
  TParams = unknown,
  TQuery = unknown
> extends Request<TParams, unknown, TBody, TQuery> {
  user?: AuthenticatedUser
}