import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createTestAppWithProjects } from '../../helpers/createTestAppWithProjects'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('GET /projects - List Projects', () => {
  const mockProjectRepository = createMockProjectRepository()
  const app = createTestAppWithProjects(mockProjectRepository)

  beforeEach(() => {
    mockProjectRepository.findAll.mockReset()
  })

  it('should return 200 and list of projects user has access to', async () => {
    const token = generateTestToken(1, 'user@example.com')
    const mockProjects = [
      Project.reconstitute({
        id: 1,
        name: 'Project 1',
        slug: 'project-1',
        description: 'Description 1',
        createdById: 1,
        memberIds: [],
        taskIds: [1, 2],
        deletedAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }),
      Project.reconstitute({
        id: 2,
        name: 'Project 2',
        slug: 'project-2',
        description: null,
        createdById: 2,
        memberIds: [1],
        taskIds: [],
        deletedAt: null,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      }),
    ]

    mockProjectRepository.findAll.mockResolvedValue({
      projects: mockProjects,
      total: 2,
    })

    const response = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(2)
    expect(response.body.projects).toHaveLength(2)
    expect(response.body.projects[0]).toMatchObject({
      id: 1,
      name: 'Project 1',
      slug: 'project-1',
      description: 'Description 1',
      memberCount: 0,
      taskCount: 2,
    })
    expect(mockProjectRepository.findAll).toHaveBeenCalledWith({
      limit: 20,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      memberId: 1,
    })
  })

  it('should return 200 with pagination parameters', async () => {
    const token = generateTestToken(1, 'user@example.com')

    mockProjectRepository.findAll.mockResolvedValue({
      projects: [],
      total: 0,
    })

    const response = await request(app)
      .get('/projects?limit=10&offset=5&sortBy=name&sortOrder=asc')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(mockProjectRepository.findAll).toHaveBeenCalledWith({
      limit: 10,
      offset: 5,
      sortBy: 'name',
      sortOrder: 'asc',
      memberId: 1,
    })
  })

  it('should return 200 with empty array when no projects found', async () => {
    const token = generateTestToken(1, 'user@example.com')

    mockProjectRepository.findAll.mockResolvedValue({
      projects: [],
      total: 0,
    })

    const response = await request(app)
      .get('/projects')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.total).toBe(0)
    expect(response.body.projects).toHaveLength(0)
  })

  it('should return 401 when no token is provided', async () => {
    const response = await request(app).get('/projects')

    expect(response.status).toBe(401)
    expect(mockProjectRepository.findAll).not.toHaveBeenCalled()
  })

  it('should return 400 when invalid sortBy parameter', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .get('/projects?sortBy=invalid')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(mockProjectRepository.findAll).not.toHaveBeenCalled()
  })

  it('should return 400 when invalid limit parameter', async () => {
    const token = generateTestToken(1, 'user@example.com')

    const response = await request(app)
      .get('/projects?limit=invalid')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(mockProjectRepository.findAll).not.toHaveBeenCalled()
  })
})
