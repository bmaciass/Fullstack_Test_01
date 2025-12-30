import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { ListUsersRequestDto, ListUsersResponseDto } from '../../dtos/user/ListDto'

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: ListUsersRequestDto): Promise<ListUsersResponseDto> {
    const { limit = 20, offset = 0, sortBy = 'email', sortOrder = 'asc', search } = request

    const result = await this.userRepository.findAll({
      limit,
      offset,
      sortBy,
      sortOrder,
      email: search, // If search is provided, filter by email
      includeDeleted: false, // Exclude deleted users
    })

    return {
      users: result.users.map(user => ({
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
      })),
      total: result.total,
    }
  }
}
