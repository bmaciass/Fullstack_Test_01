import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { GetTaskByIdResponseDto } from '../../dtos/task/GetByIdDto'

export class GetTaskByIdUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  async execute(taskId: number, userId: number): Promise<GetTaskByIdResponseDto> {
    const task = await this.taskRepository.findById(taskId)
    if (!task || task.deletedAt) {
      throw new NotFoundError('Task not found')
    }

    // Get the project to check authorization
    const project = await this.projectRepository.findById(task.projectId)
    if (!project || project.deletedAt) {
      throw new NotFoundError('Project not found')
    }

    // User must have access to the project (creator or member)
    if (!project.canUserView(userId)) {
      throw new ForbiddenError('You do not have access to this task')
    }

    return {
      id: task.id,
      name: task.name,
      description: task.description,
      status: task.status,
      priority: task.priority,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
