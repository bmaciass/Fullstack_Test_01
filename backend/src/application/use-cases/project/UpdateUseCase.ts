import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories'
import type {
  UpdateProjectRequestDto,
  UpdateProjectResponseDto,
} from '../../dtos/project/UpdateDto'

export class UpdateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(
    projectId: number,
    request: UpdateProjectRequestDto,
    userId: number
  ): Promise<UpdateProjectResponseDto> {
    const project = await this.projectRepository.findById(projectId)

    if (!project) {
      throw new NotFoundError('Project not found')
    }

    if (project.isDeleted) {
      throw new NotFoundError('Project not found')
    }

    if (!project.canUserEdit(userId)) {
      throw new ForbiddenError('You do not have permission to edit this project')
    }

    if (request.name !== undefined) {
      project.updateName(request.name)
    }

    if (request.description !== undefined) {
      project.updateDescription(request.description)
    }

    // Note: Slug updates require special handling for uniqueness
    // For now, we'll skip slug updates or handle in a future iteration

    const updatedProject = await this.projectRepository.save(project)

    return {
      id: updatedProject.id,
      name: updatedProject.name,
      slug: updatedProject.slug,
      description: updatedProject.description,
    }
  }
}