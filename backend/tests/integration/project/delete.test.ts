import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { createTestAppWithProjects } from '../../helpers/createTestAppWithProjects'
import { generateTestToken } from '../../helpers/generateTestToken'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockUserRepository } from "../../helpers/mockUserRepository"

describe('DELETE /projects/:id - Delete Project', () => {
  const mockProjectRepository = createMockProjectRepository()
  const mockUserRepository = createMockUserRepository()
  const app = createTestAppWithProjects(mockProjectRepository, mockUserRepository)

  beforeEach(() => {
    mockProjectRepository.findById.mockReset()
    mockProjectRepository.save.mockReset()
  })

  it('should return 200 and delete project when user is creator', async () => {
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
    mockProjectRepository.save.mockResolvedValue(mockProject)

    const response = await request(app)
      .delete('/projects/1')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: 1,
      message: 'Project deleted successfully',
    })
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(1)
    expect(mockProjectRepository.save).toHaveBeenCalledOnce()
  })

  it('should return 404 when project does not exist', async () => {
    const token = generateTestToken(1, 'user@example.com')
    mockProjectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .delete('/projects/999')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 404 when project is already deleted', async () => {
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
      .delete('/projects/1')
      .set('Authorization', `Bearer ${token}`)

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
      .delete('/projects/1')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(mockProjectRepository.save).not.toHaveBeenCalled()
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app).delete('/projects/1')

    expect(response.status).toBe(401)
    expect(mockProjectRepository.findById).not.toHaveBeenCalled()
  })

  it('should return 400 when projectId is invalid', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .delete('/projects/invalid')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(mockProjectRepository.findById).not.toHaveBeenCalled()
  })
})
