import type { TaskPriority, TaskStatus } from '../../../domain/entities/Task'
import type { User } from '../../../domain/entities/User'

export interface CreateTaskRequestDto {
  name: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  projectId: number
  assignTo?: Pick<User, 'username'>[]
}

export interface CreateTaskResponseDto {
  id: number
  name: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assignedMembers: Pick<User, 'username'>[]
  createdAt: Date
  updatedAt: Date
}
