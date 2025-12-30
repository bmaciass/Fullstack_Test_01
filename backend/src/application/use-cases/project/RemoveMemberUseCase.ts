import { BadRequestError } from '../../../domain/errors/BadRequestError'
import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { RemoveMemberRequestDto, RemoveMemberResponseDto } from '../../dtos/project/RemoveMemberDto'

export class RemoveMemberUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    projectId: number,
    request: RemoveMemberRequestDto,
    currentUserId: number
  ): Promise<RemoveMemberResponseDto> {
    const project = await this.projectRepository.findById(projectId)

    if (!project || project.deletedAt) {
      throw new NotFoundError('Project not found')
    }

    // Only the project creator can remove members
    if (!project.canUserEdit(currentUserId)) {
      throw new ForbiddenError('Only the project creator can remove members')
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(request.email)
    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found')
    }

    // Cannot remove if not a member
    if (!project.hasMember(user.id)) {
      throw new BadRequestError('User is not a member of this project')
    }

    // Remove member using domain logic (this will throw if trying to remove creator)
    project.removeMember(user.id)

    await this.projectRepository.save(project)

    return {
      id: project.id,
      message: 'Member removed successfully',
    }
  }
}
