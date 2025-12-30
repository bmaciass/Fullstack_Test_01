import jwt from 'jsonwebtoken'
import ms from 'ms'
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError'

type AccessTokenPayload = {
  userId: number
  email: string
}

type RefreshTokenPayload = {
  userId: number
}

export class JwtService {
  private readonly accessSecret: string
  private readonly refreshSecret: string
  private readonly accessExpiry: number
  private readonly refreshExpiry: number

  constructor() {
    this.accessSecret = process.env.JWT_SECRET ?? 'default-access-secret'
    this.refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret'
    this.accessExpiry = ms((process.env.JWT_ACCESS_EXPIRY as ms.StringValue | undefined) ?? '15m')
    this.refreshExpiry = ms((process.env.JWT_REFRESH_EXPIRY as ms.StringValue | undefined) ?? '7d')
  }

  generateAccessToken(userId: number, email: string): string {
    const payload: AccessTokenPayload = { userId, email }
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiry,
    })
  }

  generateRefreshToken(userId: number): string {
    const payload: RefreshTokenPayload = { userId }
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiry,
    })
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, this.accessSecret) as AccessTokenPayload
    } catch (error: unknown) {
      throw new UnauthorizedError('Invalid or expired access token')
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as RefreshTokenPayload
    } catch (error: unknown) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }
  }
}
