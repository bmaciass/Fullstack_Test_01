import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name is required')
    .max(255, 'Project name cannot exceed 255 characters'),
  slug: z
    .string()
    .min(1, 'Project slug is required')
    .max(255, 'Project slug cannot exceed 255 characters'),
  description: z.string().max(5000, 'Project description cannot exceed 5000 characters').optional(),
})

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, 'Project name must not be empty')
    .max(255, 'Project name cannot exceed 255 characters')
    .optional(),
  slug: z
    .string()
    .min(1, 'Project slug must not be empty')
    .max(255, 'Project slug cannot exceed 255 characters')
    .optional(),
  description: z.string().max(5000, 'Project description cannot exceed 5000 characters').optional(),
})

export const projectIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid project ID'),
})

export const listProjectsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/).optional(),
  offset: z.string().regex(/^\d+$/).optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  includeDeleted: z.enum(['true', 'false']).optional(),
})

export const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const removeMemberQuerySchema = z.object({
  email: z.string().email('Invalid email address'),
})

export type CreateProjectRequest = z.infer<typeof createProjectSchema>
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>
export type ProjectIdParam = z.infer<typeof projectIdParamSchema>
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>
export type AddMemberRequest = z.infer<typeof addMemberSchema>
export type RemoveMemberQuery = z.infer<typeof removeMemberQuerySchema>
