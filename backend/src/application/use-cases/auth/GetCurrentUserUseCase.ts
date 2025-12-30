import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { GetCurrentUserResponseDto } from '../../dtos/auth/GetCurrentUserDto'

export class GetCurrentUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: number): Promise<GetCurrentUserResponseDto> {
    // Find user by ID
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new UnauthorizedError('User account is inactive')
    }

    // Return user data
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }
}
