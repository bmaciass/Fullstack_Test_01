import type { Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Person } from '../../../src/domain/entities/Person'
import { User } from '../../../src/domain/entities/User'
import { generateTestToken } from '../../helpers/generateTestToken'
import { createMockUserRepository, type MockUserRepository } from '../../helpers/mockUserRepository'
import { createTestApp } from '../../helpers/testApp'

describe('GET /auth/me', () => {
  let mockUserRepository: MockUserRepository
  let app: Express

  beforeEach(() => {
    mockUserRepository = createMockUserRepository()
    app = createTestApp(mockUserRepository as any)
  })

  describe('Happy Path', () => {
    it('should return 200 with user data when authenticated', async () => {
      const mockPerson = Person.reconstitute({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: null,
      })
      const mockUser = User.reconstitute({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword123',
        personId: 1,
        person: mockPerson,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: null,
      })

      mockUserRepository.findById.mockResolvedValue(mockUser)

      const token = generateTestToken(1, 'test@example.com')

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
      })
      // Ensure password is NOT returned
      expect(response.body).not.toHaveProperty('password')
      expect(mockUserRepository.findById).toHaveBeenCalledWith(1)
    })
  })

  describe('Authentication Errors', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await request(app).get('/auth/me')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toBe('No authorization header provided')
    })

    it('should return 401 when authorization header format is invalid', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'InvalidFormat token123')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toBe('Invalid authorization header format')
    })

    it('should return 401 when token is invalid', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 401 when user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null)

      const token = generateTestToken(999, 'nonexistent@example.com')

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toBe('User not found')
      expect(mockUserRepository.findById).toHaveBeenCalledWith(999)
    })

    it('should return 401 when user is deleted', async () => {
      const mockUser = User.reconstitute({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword123',
        personId: 1,
        deletedAt: new Date(), // User is deleted
        createdAt: new Date(),
        updatedAt: null,
      })

      mockUserRepository.findById.mockResolvedValue(mockUser)

      const token = generateTestToken(1, 'test@example.com')

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toBe('User account is inactive')
    })
  })
})
