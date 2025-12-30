import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockUserRepository } from "../../helpers/mockUserRepository"
import { createTestAppWithProjects } from '../../helpers/createTestAppWithProjects'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('PATCH /projects/:id - Update Project', () => {
  const mockProjectRepository = createMockProjectRepository()
  const mockUserRepository = createMockUserRepository()
  const app = createTestAppWithProjects(mockProjectRepository, mockUserRepository)

  beforeEach(() => {
    mockProjectRepository.findById.mockReset()
    mockProjectRepository.save.mockReset()
  })

  it('should return 200 and update project when user is creator', async () => {
    const token = generateTestToken(1, 'user@example.com')
    const mockProject = Project.reconstitute({
      id: 1,
      name: 'Original Name',
      slug: 'original-slug',
      description: 'Original description',
      createdById: 1,
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })

    mockProjectRepository.findById.mockResolvedValue(mockProject)
    mockProjectRepository.save.mockResolvedValue(mockProject)

    const response = await request(app)
      .patch('/projects/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
        description: 'Updated description',
      })

    expect(response.status).toBe(200)
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(1)
    expect(mockProjectRepository.save).toHaveBeenCalledOnce()
  })

  it('should return 200 and update only name', async () => {
    const token = generateTestToken(1, 'user@example.com')
    const mockProject = Project.reconstitute({
      id: 1,
      name: 'Original Name',
      slug: 'original-slug',
      description: 'Original description',
      createdById: 1,
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    })

    mockProjectRepository.findById.mockResolvedValue(mockProject)
    mockProjectRepository.save.mockResolvedValue(mockProject)

    const response = await request(app)
      .patch('/projects/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
      })

    expect(response.status).toBe(200)
  })

  it('should return 404 when project does not exist', async () => {
    const token = generateTestToken(1, 'user@example.com')
    mockProjectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .patch('/projects/999')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
      })

    expect(response.status).toBe(404)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
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
      .patch('/projects/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
      })

    expect(response.status).toBe(404)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 403 when user is not the creator', async () => {
    const token = generateTestToken(2, 'other@example.com')
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
      .patch('/projects/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
      })

    expect(response.status).toBe(403)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app).patch('/projects/1').send({
      name: 'Updated Name',
    })

    expect(response.status).toBe(401)
    expect(mockProjectRepository.findById).not.toHaveBeenCalled()
  })

  it('should return 400 when projectId is invalid', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .patch('/projects/invalid')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
      })

    expect(response.status).toBe(400)
    expect(mockProjectRepository.findById).not.toHaveBeenCalled()
  })

  it('should return 400 when name exceeds max length', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .patch('/projects/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'a'.repeat(256),
      })

    expect(response.status).toBe(400)
    expect(mockProjectRepository.findById).not.toHaveBeenCalled()
  })
})
