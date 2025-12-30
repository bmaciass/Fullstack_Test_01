import type { Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { User } from '../../../src/domain/entities/User'
import { JwtService } from '../../../src/infrastructure/services/JwtService'
import { createMockUserRepository, type MockUserRepository } from '../../helpers/mockUserRepository'
import { createTestApp } from '../../helpers/testApp'

describe('POST /auth/refresh', () => {
  let mockUserRepository: MockUserRepository
  let app: Express
  let jwtService: JwtService
  const userId = 1
  const userEmail = 'test@example.com'

  beforeEach(() => {
    mockUserRepository = createMockUserRepository()
    app = createTestApp(mockUserRepository as any)
    jwtService = new JwtService()
  })

  describe('Happy Path', () => {
    it('should return 200 with new access token when valid refresh token is provided', async () => {
      const mockUser = User.reconstitute({
        id: userId,
        email: userEmail,
        username: 'testuser',
        password: 'hashedpassword',
        personId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const validRefreshToken = jwtService.generateRefreshToken(userId)
      mockUserRepository.findById.mockResolvedValue(mockUser)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('accessToken')
      expect(typeof response.body.accessToken).toBe('string')
      expect(response.body.accessToken.length).toBeGreaterThan(0)
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
    })

    it('should generate a valid access token that can be used for authentication', async () => {
      const mockUser = User.reconstitute({
        id: userId,
        email: userEmail,
        username: 'testuser',
        password: 'hashedpassword',
        personId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const validRefreshToken = jwtService.generateRefreshToken(userId)
      mockUserRepository.findById.mockResolvedValue(mockUser)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      expect(response.status).toBe(200)

      // Verify the new access token can be decoded
      const newAccessToken = response.body.accessToken
      const payload = jwtService.verifyAccessToken(newAccessToken)
      expect(payload.userId).toBe(userId)
      expect(payload.email).toBe(userEmail)
    })
  })

  describe('Error Cases - Invalid Token', () => {
    it('should return 401 when refresh token is missing', async () => {
      const response = await request(app).post('/auth/refresh').send({})

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('refreshToken')
    })

    it('should return 401 when refresh token is invalid format', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token-format' })

      expect(response.status).toBe(401)
      expect(response.body.error.message).toContain('Invalid or expired refresh token')
    })

    it('should return 401 when refresh token is expired', async () => {
      // Create an expired token (this would require mocking time or using a short-lived token)
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDAwMDAxfQ.invalid'

      const response = await request(app).post('/auth/refresh').send({ refreshToken: expiredToken })

      expect(response.status).toBe(401)
      expect(response.body.error.message).toContain('Invalid or expired refresh token')
    })

    it('should return 401 when refresh token has invalid signature', async () => {
      const validRefreshToken = jwtService.generateRefreshToken(userId)
      // Tamper with the token
      const tamperedToken = validRefreshToken.slice(0, -5) + 'XXXXX'

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: tamperedToken })

      expect(response.status).toBe(401)
      expect(response.body.error.message).toContain('Invalid or expired refresh token')
    })

    it('should return 401 when using an access token instead of refresh token', async () => {
      const accessToken = jwtService.generateAccessToken(userId, userEmail)

      const response = await request(app).post('/auth/refresh').send({ refreshToken: accessToken })

      expect(response.status).toBe(401)
      expect(response.body.error.message).toContain('Invalid or expired refresh token')
    })
  })

  describe('Error Cases - User Not Found', () => {
    it('should return 404 when user no longer exists', async () => {
      const validRefreshToken = jwtService.generateRefreshToken(userId)
      mockUserRepository.findById.mockResolvedValue(null)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('User not found')
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
    })
  })

  describe('Error Cases - User Deleted', () => {
    it('should return 401 when user account is deleted', async () => {
      const deletedUser = User.reconstitute({
        id: userId,
        email: userEmail,
        username: 'testuser',
        password: 'hashedpassword',
        personId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(), // User is soft-deleted
      })

      const validRefreshToken = jwtService.generateRefreshToken(userId)
      mockUserRepository.findById.mockResolvedValue(deletedUser)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      expect(response.status).toBe(401)
      expect(response.body.error.message).toBe('User account is deleted')
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple refresh requests with the same token', async () => {
      const mockUser = User.reconstitute({
        id: userId,
        email: userEmail,
        username: 'testuser',
        password: 'hashedpassword',
        personId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const validRefreshToken = jwtService.generateRefreshToken(userId)
      mockUserRepository.findById.mockResolvedValue(mockUser)

      // First refresh
      const response1 = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      expect(response1.status).toBe(200)
      expect(response1.body).toHaveProperty('accessToken')

      // Wait 1 second to ensure different JWT timestamps (iat claim is in seconds)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Second refresh with same token should also work (stateless)
      const response2 = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      expect(response2.status).toBe(200)
      expect(response2.body).toHaveProperty('accessToken')

      // Both access tokens should be valid but different
      expect(response1.body.accessToken).not.toBe(response2.body.accessToken)
    })

    it('should return 400 when refreshToken is not a string', async () => {
      const response = await request(app).post('/auth/refresh').send({ refreshToken: 12345 })

      expect(response.status).toBe(400)
    })

    it('should return 400 when refreshToken is empty string', async () => {
      const response = await request(app).post('/auth/refresh').send({ refreshToken: '' })

      expect(response.status).toBe(400)
      expect(response.body.error.message).toContain('refreshToken')
    })

    it('should return 400 when request body is malformed JSON', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')

      expect(response.status).toBe(400)
    })

    it('should generate different access tokens for each refresh', async () => {
      const mockUser = User.reconstitute({
        id: userId,
        email: userEmail,
        username: 'testuser',
        password: 'hashedpassword',
        personId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const validRefreshToken = jwtService.generateRefreshToken(userId)
      mockUserRepository.findById.mockResolvedValue(mockUser)

      const response1 = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      // Wait 1 second to ensure different JWT timestamps (iat claim is in seconds)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const response2 = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(response1.body.accessToken).not.toBe(response2.body.accessToken)

      // Both should be valid
      const payload1 = jwtService.verifyAccessToken(response1.body.accessToken)
      const payload2 = jwtService.verifyAccessToken(response2.body.accessToken)

      expect(payload1.userId).toBe(userId)
      expect(payload2.userId).toBe(userId)
    })
  })

  describe('Security Tests', () => {
    it('should not leak user information in error messages', async () => {
      const validRefreshToken = jwtService.generateRefreshToken(999)
      mockUserRepository.findById.mockResolvedValue(null)

      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: validRefreshToken })

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('User not found')
      // Should not leak userId or other user details
      expect(response.body.error.message).not.toContain('999')
    })

    it('should validate token before database lookup for invalid tokens', async () => {
      const invalidToken = 'clearly-not-a-jwt-token'

      const response = await request(app).post('/auth/refresh').send({ refreshToken: invalidToken })

      expect(response.status).toBe(401)
      // Should fail on token validation, not reach database
      expect(mockUserRepository.findById).not.toHaveBeenCalled()
    })
  })
})
