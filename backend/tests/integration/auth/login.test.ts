import bcrypt from 'bcrypt'
import type { Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Person } from '../../../src/domain/entities/Person'
import { User } from '../../../src/domain/entities/User'
import { createMockUserRepository, type MockUserRepository } from '../../helpers/mockUserRepository'
import { createTestApp } from '../../helpers/testApp'

describe('POST /auth/login', () => {
  let mockUserRepository: MockUserRepository
  let app: Express

  beforeEach(() => {
    mockUserRepository = createMockUserRepository()
    app = createTestApp(mockUserRepository as any)
  })

  it('should return 200 with tokens and user data on successful login', async () => {
    // Create a mock user with hashed password
    const hashedPassword = await bcrypt.hash('password123', 10)
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
      password: hashedPassword,
      personId: 1,
      person: mockPerson,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: null,
    })

    mockUserRepository.findByEmail.mockResolvedValue(mockUser)

    const response = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(200)
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
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com')
  })

  it('should return 401 when user is not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)

    const response = await request(app).post('/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error.message).toBe('Invalid credentials')
  })

  it('should return 401 when password is incorrect', async () => {
    const hashedPassword = await bcrypt.hash('correctpassword', 10)
    const mockUser = User.reconstitute({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      personId: 1,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: null,
    })

    mockUserRepository.findByEmail.mockResolvedValue(mockUser)

    const response = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error.message).toBe('Invalid credentials')
  })

  it('should return 401 when user is deleted', async () => {
    const hashedPassword = await bcrypt.hash('password123', 10)
    const mockUser = User.reconstitute({
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      password: hashedPassword,
      personId: 1,
      deletedAt: new Date(), // User is deleted
      createdAt: new Date(),
      updatedAt: null,
    })

    mockUserRepository.findByEmail.mockResolvedValue(mockUser)

    const response = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error.message).toBe('Invalid credentials')
  })

  it('should return 400 when email is missing', async () => {
    const response = await request(app).post('/auth/login').send({
      password: 'password123',
    })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 400 when password is missing', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'test@example.com',
    })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
  })

  it('should return 400 when email format is invalid', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'invalid-email',
      password: 'password123',
    })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error')
    expect(response.body.error.message).toContain('Invalid email format')
  })
})
