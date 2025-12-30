import { z } from 'zod'

export const listUsersQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
  sortBy: z.enum(['email', 'username', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>
