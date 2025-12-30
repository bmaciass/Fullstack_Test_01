import type { TaskPriority, TaskStatus } from '../../../domain/entities/Task'

export interface GetTaskByIdResponseDto {
  id: number
  name: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: Date
  updatedAt: Date
}
