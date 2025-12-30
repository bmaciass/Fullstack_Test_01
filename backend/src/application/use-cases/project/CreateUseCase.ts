import { Project } from '../../../domain/entities/Project'
import type { ProjectRepository } from '../../../domain/repositories'
import type {
  CreateProjectRequestDto,
  CreateProjectResponseDto,
} from '../../dtos/project/CreateDto'

export class CreateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(request: CreateProjectRequestDto, createdById: number): Promise<CreateProjectResponseDto> {
    const project = await this.projectRepository.save(
      Project.create({
        ...request,
        createdById,
      })
    )
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
    }
  }
}
