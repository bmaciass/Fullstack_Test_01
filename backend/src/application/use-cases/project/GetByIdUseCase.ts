import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories'
import type { GetProjectByIdResponseDto } from '../../dtos/project/GetByIdDto'

export class GetProjectByIdUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(projectId: number, userId: number): Promise<GetProjectByIdResponseDto> {
    const project = await this.projectRepository.findById(projectId)

    if (!project) {
      throw new NotFoundError('Project not found')
    }

    if (project.isDeleted) {
      throw new NotFoundError('Project not found')
    }

    if (!project.canUserView(userId)) {
      throw new ForbiddenError('You do not have permission to view this project')
    }

    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      memberCount: project.memberIds.length,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }
  }
}
