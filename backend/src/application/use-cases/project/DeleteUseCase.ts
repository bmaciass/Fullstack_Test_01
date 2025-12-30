import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories'
import type { DeleteProjectResponseDto } from '../../dtos/project/DeleteDto'

export class DeleteProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(projectId: number, userId: number): Promise<DeleteProjectResponseDto> {
    const project = await this.projectRepository.findById(projectId)

    if (!project) {
      throw new NotFoundError('Project not found')
    }

    if (project.isDeleted) {
      throw new NotFoundError('Project not found')
    }

    if (!project.canUserDelete(userId)) {
      throw new ForbiddenError('You do not have permission to delete this project')
    }

    project.delete()
    await this.projectRepository.save(project)

    return {
      id: project.id,
      message: 'Project deleted successfully',
    }
  }
}