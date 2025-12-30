import type { ProjectRepository } from '../../../domain/repositories'
import type { ListProjectsRequestDto, ListProjectsResponseDto } from '../../dtos/project/ListDto'

export class ListProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute(request: ListProjectsRequestDto, userId: number): Promise<ListProjectsResponseDto> {
    const {
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeDeleted,
    } = request

    const result = await this.projectRepository.findAll({
      limit,
      offset,
      sortBy,
      sortOrder,
      memberId: userId,
      includeDeleted,
    })

    return {
      projects: result.projects.map(project => ({
        id: project.id,
        name: project.name,
        slug: project.slug,
        description: project.description,
        memberCount: project.getMemberCount(),
        taskCount: project.getTaskCount(),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      })),
      total: result.total,
    }
  }
}
