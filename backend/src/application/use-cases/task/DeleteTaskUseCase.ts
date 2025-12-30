import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { DeleteTaskResponseDto } from '../../dtos/task/DeleteDto'

export class DeleteTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  async execute(taskId: number, userId: number): Promise<DeleteTaskResponseDto> {
    const task = await this.taskRepository.findById(taskId)
    if (!task || task.deletedAt) {
      throw new NotFoundError('Task not found')
    }

    // Get the project to check authorization
    const project = await this.projectRepository.findById(task.projectId)
    if (!project || project.deletedAt) {
      throw new NotFoundError('Project not found')
    }

    // Only project creator can delete tasks
    if (!project.canUserEdit(userId)) {
      throw new ForbiddenError('Only the project creator can delete tasks')
    }

    task.delete()
    await this.taskRepository.save(task)

    return {
      id: task.id,
      message: 'Task deleted successfully',
    }
  }
}
