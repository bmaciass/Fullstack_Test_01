import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createTestAppWithProjects } from '../../helpers/createTestAppWithProjects'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('GET /projects/:id - Get Project By ID', () => {
  const mockProjectRepository = createMockProjectRepository()
  const app = createTestAppWithProjects(mockProjectRepository)

  beforeEach(() => {
    mockProjectRepository.findById.mockReset()
  })

  it('should return 200 and project details when user is creator', async () => {
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

    mockProjectRepository.findById.mockResolvedValue(mockProject)

    const response = await request(app)
      .get('/projects/1')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: 1,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
    })
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(1)
  })

  it('should return 200 and project details when user is a member', async () => {
    const token = generateTestToken(2, 'member@example.com')
    const mockProject = Project.reconstitute({
      id: 1,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
      createdById: 1,
      memberIds: [2],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })

    mockProjectRepository.findById.mockResolvedValue(mockProject)

    const response = await request(app)
      .get('/projects/1')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: 1,
      name: 'Test Project',
      slug: 'test-project',
    })
  })

  it('should return 404 when project does not exist', async () => {
    const token = generateTestToken(1, 'user@example.com')
    mockProjectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .get('/projects/999')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
  })

  it('should return 404 when project is deleted', async () => {
    const token = generateTestToken(1, 'user@example.com')
    const mockProject = Project.reconstitute({
      id: 1,
      name: 'Deleted Project',
      slug: 'deleted-project',
      description: null,
      createdById: 1,
      memberIds: [],
      taskIds: [],
      deletedAt: new Date('2024-01-02'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })

    mockProjectRepository.findById.mockResolvedValue(mockProject)

    const response = await request(app)
      .get('/projects/1')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
  })

  it('should return 403 when user is not creator or member', async () => {
    const token = generateTestToken(3, 'other@example.com')
    const mockProject = Project.reconstitute({
      id: 1,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: 1,
      memberIds: [2],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })

    mockProjectRepository.findById.mockResolvedValue(mockProject)

    const response = await request(app)
      .get('/projects/1')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app).get('/projects/1')

    expect(response.status).toBe(401)
    expect(mockProjectRepository.findById).not.toHaveBeenCalled()
  })

  it('should return 400 when projectId is invalid', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .get('/projects/invalid')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(mockProjectRepository.findById).not.toHaveBeenCalled()
  })
})
