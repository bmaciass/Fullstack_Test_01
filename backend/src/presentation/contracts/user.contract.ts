import { initContract } from '@ts-rest/core'
import { listUsersQuerySchema } from '../validators/user.validator'
import { errorResponseSchema, listUsersResponseSchema } from './schemas'

const c = initContract()

export const userContract = c.router(
  {
    list: {
      method: 'GET',
      path: '/',
      responses: {
        200: listUsersResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
      },
      query: listUsersQuerySchema,
      summary: 'List users',
      description: 'Get a paginated list of users with optional filtering and sorting',
      metadata: {
        auth: 'required',
      } as const,
    },
  }
)