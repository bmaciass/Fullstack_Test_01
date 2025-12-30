import { NotFoundError } from '../../../domain/errors/NotFoundError'
import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { JwtService } from '../../../infrastructure/services/JwtService'
import type { RefreshRequestDto, RefreshResponseDto } from '../../dtos/auth/LoginDto'

export class RefreshTokenUseCase {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  async execute(request: RefreshRequestDto): Promise<RefreshResponseDto> {
    // Verify refresh token
    const payload = this.jwtService.verifyRefreshToken(request.refreshToken)

    // Check if user still exists
    const user = await this.userRepository.findById(payload.userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new UnauthorizedError('User account is deleted')
    }

    // Generate new access token
    const accessToken = this.jwtService.generateAccessToken(user.id, user.email)

    return {
      accessToken,
    }
  }
}
