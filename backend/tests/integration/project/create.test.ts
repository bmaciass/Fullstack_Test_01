import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockUserRepository } from "../../helpers/mockUserRepository"
import { createTestAppWithProjects } from '../../helpers/createTestAppWithProjects'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('POST /projects - Create Project', () => {
  const mockProjectRepository = createMockProjectRepository()
  const mockUserRepository = createMockUserRepository()
  const app = createTestAppWithProjects(mockProjectRepository, mockUserRepository)

  beforeEach(() => {
    mockProjectRepository.save.mockReset()
  })

  it('should return 201 and create project on valid input', async () => {
    const token = generateTestToken(1, 'user@example.com')
    const mockProject = Project.reconstitute({
      id: 1,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
      createdById: 1,
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })

    mockProjectRepository.save.mockResolvedValue(mockProject)

    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        slug: 'test-project',
        description: 'A test project',
      })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      id: 1,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
    })
    expect(mockProjectRepository.save).toHaveBeenCalledOnce()
  })

  it('should return 201 and create project without description', async () => {
    const token = generateTestToken(1, 'user@example.com')
    const mockProject = Project.reconstitute({
      id: 2,
      name: 'Test Project 2',
      slug: 'test-project-2',
      description: null,
      createdById: 1,
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })

    mockProjectRepository.save.mockResolvedValue(mockProject)

    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project 2',
        slug: 'test-project-2',
      })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      id: 2,
      name: 'Test Project 2',
      slug: 'test-project-2',
      description: null,
    })
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app).post('/projects').send({
      name: 'Test Project',
      slug: 'test-project',
    })

    expect(response.status).toBe(401)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 401 when invalid token is provided', async () => {
    const response = await request(app)
      .post('/projects')
      .set('Authorization', 'Bearer invalid-token')
      .send({
        name: 'Test Project',
        slug: 'test-project',
      })

    expect(response.status).toBe(401)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 400 when name is missing', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        slug: 'test-project',
      })

    expect(response.status).toBe(400)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 400 when slug is missing', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
      })

    expect(response.status).toBe(400)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 400 when name exceeds max length', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'a'.repeat(256),
        slug: 'test-project',
      })

    expect(response.status).toBe(400)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 400 when description exceeds max length', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .post('/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        slug: 'test-project',
        description: 'a'.repeat(5001),
      })

    expect(response.status).toBe(400)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })
})
