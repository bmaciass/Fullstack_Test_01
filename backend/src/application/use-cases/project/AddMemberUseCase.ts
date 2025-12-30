import { BadRequestError } from '../../../domain/errors/BadRequestError'
import { ForbiddenError } from '../../../domain/errors/ForbiddenError'
import { NotFoundError } from '../../../domain/errors/NotFoundError'
import type { ProjectRepository } from '../../../domain/repositories/ProjectRepository'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { AddMemberRequestDto, AddMemberResponseDto } from '../../dtos/project/AddMemberDto'

export class AddMemberUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(
    projectId: number,
    request: AddMemberRequestDto,
    currentUserId: number
  ): Promise<AddMemberResponseDto> {
    const project = await this.projectRepository.findById(projectId)

    if (!project || project.deletedAt) {
      throw new NotFoundError('Project not found')
    }

    // Only the project creator can add members
    if (!project.canUserEdit(currentUserId)) {
      throw new ForbiddenError('Only the project creator can add members')
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(request.email)

    if (!user || user.isDeleted) {
      throw new NotFoundError('User not found')
    }

    // Cannot add the creator as a member
    if (user.id === project.createdById) {
      throw new BadRequestError('Cannot add the project creator as a member')
    }

    // Cannot add if already a member
    if (project.hasMember(user.id)) {
      throw new BadRequestError('User is already a member of this project')
    }

    // Add member using domain logic
    project.addMember(user.id)

    await this.projectRepository.save(project)

    return {
      id: project.id,
      message: 'Member added successfully',
    }
  }
}
