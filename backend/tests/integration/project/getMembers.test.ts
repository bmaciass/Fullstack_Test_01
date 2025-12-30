import type { Application } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { User } from '../../../src/domain/entities/User'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockUserRepository } from '../../helpers/mockUserRepository'
import { createTestAppWithProjects } from '../../helpers/createTestAppWithProjects'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('GET /projects/:id/members - Get Project Members', () => {
  let app: Application
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>
  let mockUserRepository: ReturnType<typeof createMockUserRepository>
  let token: string
  const creatorId = 1
  const projectId = 1

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository()
    mockUserRepository = createMockUserRepository()
    app = createTestAppWithProjects(mockProjectRepository, mockUserRepository)
    token = generateTestToken(creatorId, 'creator@example.com')
  })

  it('should return 200 with list of members when user is project creator', async () => {
    const member1 = User.reconstitute({
      id: 2,
      email: 'member1@example.com',
      username: 'member1',
      password: 'hashedpassword',
      personId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const member2 = User.reconstitute({
      id: 3,
      email: 'member2@example.com',
      username: 'member2',
      password: 'hashedpassword',
      personId: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
      createdById: creatorId,
      memberIds: [2, 3],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(project)
    mockUserRepository.findById.mockImplementation(async (id: number) => {
      if (id === 2) return member1
      if (id === 3) return member2
      return null
    })

    const response = await request(app)
      .get(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
    expect(response.body).toEqual([
      {
        email: 'member1@example.com',
        username: 'member1',
        firstName: member1.firstName,
        lastName: member1.lastName,
        fullName: member1.fullName,
      },
      {
        email: 'member2@example.com',
        username: 'member2',
        firstName: member2.firstName,
        lastName: member2.lastName,
        fullName: member2.fullName,
      },
    ])
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId)
    expect(mockUserRepository.findById).toHaveBeenCalledTimes(2)
  })

  it('should return 200 with list of members when user is a project member', async () => {
    const member1 = User.reconstitute({
      id: 2,
      email: 'member1@example.com',
      username: 'member1',
      password: 'hashedpassword',
      personId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
      createdById: 999, // Different creator
      memberIds: [creatorId, 2], // Current user is a member
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(project)
    mockUserRepository.findById.mockImplementation(async (id: number) => {
      if (id === creatorId) {
        return User.reconstitute({
          id: creatorId,
          email: 'creator@example.com',
          username: 'creator',
          password: 'hashedpassword',
          personId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        })
      }
      if (id === 2) return member1
      return null
    })

    const response = await request(app)
      .get(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(2)
  })

  it('should return 200 with empty array when project has no members', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
      createdById: creatorId,
      memberIds: [], // No members
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .get(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
    expect(mockUserRepository.findById).not.toHaveBeenCalled()
  })

  it('should filter out deleted users from member list', async () => {
    const activeMember = User.reconstitute({
      id: 2,
      email: 'active@example.com',
      username: 'active',
      password: 'hashedpassword',
      personId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const deletedMember = User.reconstitute({
      id: 3,
      email: 'deleted@example.com',
      username: 'deleted',
      password: 'hashedpassword',
      personId: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(), // Deleted user
    })

    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
      createdById: creatorId,
      memberIds: [2, 3], // Both active and deleted members
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(project)
    mockUserRepository.findById.mockImplementation(async (id: number) => {
      if (id === 2) return activeMember
      if (id === 3) return deletedMember
      return null
    })

    const response = await request(app)
      .get(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1) // Only active member
    expect(response.body[0].email).toBe('active@example.com')
  })

  it('should return 404 when project does not exist', async () => {
    mockProjectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .get(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Project not found')
  })

  it('should return 404 when project is deleted', async () => {
    const deletedProject = Project.reconstitute({
      id: projectId,
      name: 'Deleted Project',
      slug: 'deleted-project',
      description: null,
      createdById: creatorId,
      memberIds: [],
      taskIds: [],
      deletedAt: new Date(), // Project is deleted
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(deletedProject)

    const response = await request(app)
      .get(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Project not found')
  })

  it('should return 403 when user does not have access to the project', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: 999, // Different creator
      memberIds: [2, 3], // Current user is NOT a member
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .get(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.error.message).toBe('You do not have access to view this project')
  })

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app).get(`/projects/${projectId}/members`)

    expect(response.status).toBe(401)
  })

  it('should return 400 when project ID parameter is invalid', async () => {
    const response = await request(app)
      .get('/projects/invalid-id/members')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
  })
})