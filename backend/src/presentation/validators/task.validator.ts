import { z } from 'zod'

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be at most 255 characters'),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  status: z
    .enum(['pending', 'in_progress', 'reviewing', 'completed', 'archived'], {
      error:
        'Status must be pending, in_progress, reviewing, completed, or archived. Defaults to pending',
    })
    .optional()
    .default('pending'),
  priority: z
    .enum(['low', 'medium', 'high'], {
      error: 'Priority must be low, medium, or high. Defaults to low',
    })
    .optional()
    .default('low'),
  projectId: z.number().int().positive('Project ID must be a positive integer'),
})

export const updateTaskSchema = z.object({
  name: z
    .string()
    .min(1, 'Name cannot be empty')
    .max(255, 'Name must be at most 255 characters')
    .optional(),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  status: z
    .enum(['pending', 'in_progress', 'reviewing', 'completed', 'archived'], {
      error: 'Status must be pending, in_progress, reviewing, completed, or archived',
    })
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'], {
      error: 'Priority must be low, medium, or high',
    })
    .optional(),
})

export const taskIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number'),
})

export const listTasksQuerySchema = z.object({
  projectId: z.string().regex(/^\d+$/, 'Project ID must be a number').optional(),
  status: z.enum(['pending', 'in_progress', 'reviewing', 'completed', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedUserId: z.string().regex(/^\d+$/, 'Assigned user ID must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  offset: z.string().regex(/^\d+$/, 'Offset must be a number').optional(),
  sortBy: z.enum(['name', 'priority', 'status', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const assignUserToTaskSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export const unassignUserParamSchema = z.object({
  email: z.string().email('Invalid email format'),
})

// Type inference
export type CreateTaskRequest = z.infer<typeof createTaskSchema>
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>
export type TaskIdParam = z.infer<typeof taskIdParamSchema>
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>
export type AssignUserToTaskRequest = z.infer<typeof assignUserToTaskSchema>
export type UnassignUserParam = z.infer<typeof unassignUserParamSchema>
