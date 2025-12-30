import type { NextFunction, Response } from 'express'
import type { ListUsersRequestDto } from '../../application/dtos/user/ListDto'
import type { ListUsersUseCase } from '../../application/use-cases/user/ListUsersUseCase'
import { BadRequestError } from '../../domain/errors/BadRequestError'
import type { AuthenticatedRequest } from '../types/AuthenticatedRequest'
import type { ListUsersQuery } from '../validators/user.validator'

type UserUseCases = {
  list: ListUsersUseCase
}

export class UserController {
  constructor(private useCases: UserUseCases) {}

  async list(
    req: AuthenticatedRequest<unknown, unknown, ListUsersQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const query: ListUsersRequestDto = {}

      // Parse numeric query params
      if (req.query.limit !== undefined) {
        const limit = Number(req.query.limit)
        if (Number.isNaN(limit)) {
          throw new BadRequestError('Invalid limit format')
        }
        query.limit = limit
      }
      if (req.query.offset !== undefined) {
        const offset = Number(req.query.offset)
        if (Number.isNaN(offset)) {
          throw new BadRequestError('Invalid offset format')
        }
        query.offset = offset
      }

      // Add sortBy and sortOrder
      if (req.query.sortBy) {
        query.sortBy = req.query.sortBy
      }
      if (req.query.sortOrder) {
        query.sortOrder = req.query.sortOrder
      }

      // Add search
      if (req.query.search) {
        query.search = req.query.search
      }

      const result = await this.useCases.list.execute(query)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
