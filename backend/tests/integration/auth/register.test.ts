import type { Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Person } from '../../../src/domain/entities/Person'
import { User } from '../../../src/domain/entities/User'
import { createMockPersonRepository, type MockPersonRepository } from '../../helpers/mockPersonRepository'
import { createMockUserRepository, type MockUserRepository } from '../../helpers/mockUserRepository'
import { createTestApp } from '../../helpers/testApp'

describe('POST /auth/register', () => {
  let mockUserRepository: MockUserRepository
  let mockPersonRepository: MockPersonRepository
  let app: Express

  beforeEach(() => {
    mockUserRepository = createMockUserRepository()
    mockPersonRepository = createMockPersonRepository()
    app = createTestApp(mockUserRepository as any, mockPersonRepository as any)
  })

  describe('Happy Path', () => {
    it('should return 201 with tokens and user data on successful registration', async () => {
      // Mock: email and username don't exist
      mockUserRepository.existsByEmail.mockResolvedValue(false)
      mockUserRepository.existsByUsername.mockResolvedValue(false)

      // Mock: Person save returns saved person with ID
      const mockPerson = Person.reconstitute({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: null,
      })
      mockPersonRepository.save.mockResolvedValue(mockPerson)

      // Mock: User save returns saved user with ID
      const mockUser = User.reconstitute({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashedpassword123', // This would be the hashed version
        personId: 1,
        person: mockPerson,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: null,
      })
      mockUserRepository.save.mockResolvedValue(mockUser)

      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('accessToken')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user).toMatchObject({
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
      })
      // Ensure password is NOT returned
      expect(response.body.user).not.toHaveProperty('password')

      // Verify repository methods were called
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('test@example.com')
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith('testuser')
      expect(mockPersonRepository.save).toHaveBeenCalled()
      expect(mockUserRepository.save).toHaveBeenCalled()
    })
  })

  describe('Business Logic Errors', () => {
    it('should return 400 when email already exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true)

      const response = await request(app).post('/auth/register').send({
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toBe('Email already in use')
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('existing@example.com')
    })

    it('should return 400 when username already exists', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false)
      mockUserRepository.existsByUsername.mockResolvedValue(true)

      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'existinguser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toBe('Username already in use')
      expect(mockUserRepository.existsByUsername).toHaveBeenCalledWith('existinguser')
    })
  })

  describe('Validation Errors - Email', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app).post('/auth/register').send({
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toContain('Invalid email format')
    })
  })

  describe('Validation Errors - Username', () => {
    it('should return 400 when username is missing', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 when username is too short', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'ab', // Only 2 characters
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toContain('Username must be at least 3 characters')
    })

    it('should return 400 when username is too long', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'a'.repeat(51), // 51 characters
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toContain('Username cannot exceed 50 characters')
    })
  })

  describe('Validation Errors - Password', () => {
    it('should return 400 when password is missing', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 when password is too short', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'short', // Only 5 characters
        firstName: 'John',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toContain('Password must be at least 8 characters')
    })
  })

  describe('Validation Errors - First Name', () => {
    it('should return 400 when firstName is missing', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 when firstName is too long', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'a'.repeat(101), // 101 characters
        lastName: 'Doe',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toContain('First name cannot exceed 100 characters')
    })
  })

  describe('Validation Errors - Last Name', () => {
    it('should return 400 when lastName is missing', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })

    it('should return 400 when lastName is too long', async () => {
      const response = await request(app).post('/auth/register').send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'a'.repeat(101), // 101 characters
      })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
      expect(response.body.error.message).toContain('Last name cannot exceed 100 characters')
    })
  })
})
