import type { TaskPriority, TaskStatus } from '../../../domain/entities/Task'

export interface ListTasksRequestDto {
  projectId?: number
  status?: TaskStatus
  priority?: TaskPriority
  assignedUserId?: number
  limit?: number
  offset?: number
  sortBy?: 'name' | 'priority' | 'status' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface TaskSummaryDto {
  id: number
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedUserCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ListTasksResponseDto {
  tasks: TaskSummaryDto[]
  total: number
}
