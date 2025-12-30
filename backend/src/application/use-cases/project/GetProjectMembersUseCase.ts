import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { GetProjectMembersResponseDto } from '../../dtos/project/GetProjectMembersDto'

export class GetProjectMembersUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(projectId: number, currentUserId: number): Promise<GetProjectMembersResponseDto> {
    const project = await this.projectRepository.findById(projectId)

    if (!project || project.deletedAt) {
      throw new NotFoundError('Project not found')
    }

    // Only members and creator can view the member list
    if (!project.canUserView(currentUserId)) {
      throw new ForbiddenError('You do not have access to view this project')
    }

    // Fetch all members
    const members: GetProjectMembersResponseDto = []

    for (const memberId of project.memberIds) {
      const user = await this.userRepository.findById(memberId)
      if (user && !user.isDeleted) {
        members.push({
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
        })
      }
    }

    return members
  }
}
