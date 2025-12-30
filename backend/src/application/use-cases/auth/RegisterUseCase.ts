import { BadRequestError } from '../../../domain/errors/BadRequestError'
import { Person } from '../../../domain/entities/Person'
import { User } from '../../../domain/entities/User'
import type { PersonRepository } from '../../../domain/repositories/PersonRepository'
import type { UserRepository } from '../../../domain/repositories/UserRepository'
import type { JwtService } from '../../../infrastructure/services/JwtService'
import type { PasswordHashService } from '../../../infrastructure/services/PasswordHashService'
import type { RegisterRequestDto, RegisterResponseDto } from '../../dtos/auth/RegisterDto'

export class RegisterUseCase {
  constructor(
    private userRepository: UserRepository,
    private personRepository: PersonRepository,
    private passwordHashService: PasswordHashService,
    private jwtService: JwtService
  ) {}

  async execute(request: RegisterRequestDto): Promise<RegisterResponseDto> {
    // Check if email already exists
    const emailExists = await this.userRepository.existsByEmail(request.email)
    if (emailExists) {
      throw new BadRequestError('Email already in use')
    }

    // Check if username already exists
    const usernameExists = await this.userRepository.existsByUsername(request.username)
    if (usernameExists) {
      throw new BadRequestError('Username already in use')
    }

    // Hash password
    const hashedPassword = await this.passwordHashService.hash(request.password)

    // Create and save Person
    const person = Person.create({
      firstName: request.firstName,
      lastName: request.lastName,
    })
    const savedPerson = await this.personRepository.save(person)

    // Create and save User
    const user = User.create({
      email: request.email,
      username: request.username,
      password: hashedPassword,
      personId: savedPerson.id,
    })
    const savedUser = await this.userRepository.save(user)

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken(savedUser.id, savedUser.email)
    const refreshToken = this.jwtService.generateRefreshToken(savedUser.id)

    // Return response
    return {
      accessToken,
      refreshToken,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        firstName: savedPerson.firstName,
        lastName: savedPerson.lastName,
      },
    }
  }
}
