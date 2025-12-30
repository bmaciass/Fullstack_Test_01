import { JwtService } from '../../src/infrastructure/services/JwtService'

const jwtService = new JwtService()

export const generateTestToken = (userId: number, email: string): string => {
  return jwtService.generateAccessToken(userId, email)
}
