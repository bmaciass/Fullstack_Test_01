import { z } from 'zod'

// Common error response schema
export const errorResponseSchema = z.object({
  error: z.object({
    message: z.string(),
    details: z.array(z.any()).optional(),
  }),
})

// Auth response schemas
export const authUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export const registerResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
})

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
})

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const currentUserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export const userStatsResponseSchema = z.object({
  projectsCount: z.number(),
  pendingTasksCount: z.number(),
  inProgressTasksCount: z.number(),
})

// User response schemas
export const userSummarySchema = z.object({
  email: z.string().email(),
  username: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fullName: z.string().optional(),
})

export const listUsersResponseSchema = z.object({
  users: z.array(userSummarySchema),
  total: z.number(),
})

// Project response schemas
export const createProjectResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
})

export const updateProjectResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
})

export const projectSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  memberCount: z.number(),
  taskCount: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const listProjectsResponseSchema = z.object({
  projects: z.array(projectSummarySchema),
  total: z.number(),
})

export const getProjectByIdResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  memberCount: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const deleteProjectResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
})

export const addMemberResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
})

export const removeMemberResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
})

export const getProjectMembersResponseSchema = z.array(userSummarySchema)

// Task response schemas
const taskStatusEnum = z.enum(['pending', 'in_progress', 'reviewing', 'completed', 'archived'])
const taskPriorityEnum = z.enum(['low', 'medium', 'high'])

export const assignedMemberSchema = z.object({
  username: z.string(),
})

export const createTaskResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  assignedMembers: z.array(assignedMemberSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const updateTaskResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  assignedMembers: z.array(assignedMemberSchema),
})

export const taskSummarySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  assignedUserCount: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const listTasksResponseSchema = z.object({
  tasks: z.array(taskSummarySchema),
  total: z.number(),
})

export const getTaskByIdResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  status: taskStatusEnum,
  priority: taskPriorityEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const deleteTaskResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
})

export const assignUserToTaskResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
})

export const unassignUserFromTaskResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
})

export const taskAssignedUserSchema = z.object({
  email: z.string().email(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
})

export const getTaskAssignedUsersResponseSchema = z.object({
  users: z.array(taskAssignedUserSchema),
})
