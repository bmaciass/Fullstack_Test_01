import { compact } from 'lodash-es'
import { Task } from '../../../domain/entities/Task'
import { BadRequestError } from '../../../domain/errors/BadRequestError'
import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { UserRepository } from '../../../domain/repositories'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { TaskRepository } from '../../../domain/repositories/TaskRepository'
import type { CreateTaskRequestDto, CreateTaskResponseDto } from '../../dtos/task/CreateDto'

export class CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(request: CreateTaskRequestDto, userId: number): Promise<CreateTaskResponseDto> {
    // Check if project exists
    const project = await this.projectRepository.findById(request.projectId)
    if (!project || project.deletedAt) {
      throw new NotFoundError('Project not found')
    }

    // Check if user has access to the project (must be creator or member)
    if (!project.canUserView(userId)) {
      throw new ForbiddenError('You do not have access to this project')
    }

    const assignTo = request.assignTo
      ? compact(
          await Promise.all(
            request.assignTo.map(({ username }) => this.userRepository.findByUsername(username))
          )
        )
      : undefined

    // Validate that all users to be assigned are project members
    if (assignTo && assignTo.length > 0) {
      for (const user of assignTo) {
        if (!project.canUserView(user.id)) {
          throw new BadRequestError('All assigned users must be members of the project')
        }
      }
    }

    const task = Task.create({
      name: request.name,
      description: request.description ?? null,
      status: request.status,
      priority: request.priority,
      projectId: request.projectId,
      assignedUserIds: assignTo?.map(user => user.id),
    })

    const savedTask = await this.taskRepository.save(task)

    project.addTask(savedTask.id)
    await this.projectRepository.save(project)

    return {
      id: savedTask.id,
      name: savedTask.name,
      description: savedTask.description,
      status: savedTask.status,
      priority: savedTask.priority,
      createdAt: savedTask.createdAt,
      updatedAt: savedTask.updatedAt,
      assignedMembers: assignTo?.map(user => ({ username: user.username })) ?? [],
    }
  }
}
