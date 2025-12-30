import { UnauthorizedError } from '../../../domain/errors/UnauthorizedError'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { JwtService } from '../../../infrastructure/services/JwtService'
import type { PasswordHashService } from '../../../infrastructure/services/PasswordHashService'
import type { LoginRequestDto, LoginResponseDto } from '../../dtos/auth/LoginDto'

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordHashService: PasswordHashService,
    private jwtService: JwtService
  ) {}

  async execute(request: LoginRequestDto): Promise<LoginResponseDto> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email)
    if (!user) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Check if user is deleted
    if (user.isDeleted) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await this.passwordHashService.compare(request.password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials')
    }

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken(user.id, user.email)
    const refreshToken = this.jwtService.generateRefreshToken(user.id)

    // Return response
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }
  }
}
