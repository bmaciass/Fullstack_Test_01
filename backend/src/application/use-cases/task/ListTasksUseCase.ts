import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { ListTasksRequestDto, ListTasksResponseDto } from '../../dtos/task/ListDto'

export class ListTasksUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository
  ) {}

  async execute(request: ListTasksRequestDto, userId: number): Promise<ListTasksResponseDto> {
    // If projectId is provided, verify access to that project
    if (request.projectId !== undefined) {
      const project = await this.projectRepository.findById(request.projectId)
      if (!project || project.deletedAt) {
        throw new NotFoundError('Project not found')
      }

      if (!project.canUserView(userId)) {
        throw new ForbiddenError('You do not have access to this project')
      }
    }

    const result = await this.taskRepository.findAll({
      projectId: request.projectId,
      status: request.status,
      priority: request.priority,
      assignedUserId: request.assignedUserId,
      limit: request.limit ?? 10,
      offset: request.offset ?? 0,
      sortBy: request.sortBy ?? 'createdAt',
      sortOrder: request.sortOrder ?? 'desc',
    })

    return {
      tasks: result.tasks.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedUserCount: task.assignedUserIds.length,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      total: result.total,
    }
  }
}
