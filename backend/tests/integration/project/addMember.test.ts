import type { Application } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { User } from '../../../src/domain/entities/User'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockUserRepository } from '../../helpers/mockUserRepository'
import { createTestAppWithProjects } from '../../helpers/createTestAppWithProjects'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('POST /projects/:id/members - Add Member to Project', () => {
  let app: Application
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>
  let mockUserRepository: ReturnType<typeof createMockUserRepository>
  let token: string
  const creatorId = 1
  const projectId = 1
  const newMemberId = 2
  const newMemberEmail = 'newmember@example.com'

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository()
    mockUserRepository = createMockUserRepository()
    app = createTestAppWithProjects(mockProjectRepository, mockUserRepository)
    token = generateTestToken(creatorId, 'creator@example.com')
  })

  it('should return 200 when creator adds a member to their project', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: creatorId,
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newMemberUser = User.reconstitute({
      id: newMemberId,
      email: newMemberEmail,
      username: 'newmember',
      password: 'hashedpassword',
      personId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    mockProjectRepository.findById.mockResolvedValue(project)
    mockUserRepository.findByEmail.mockResolvedValue(newMemberUser)
    mockProjectRepository.save.mockResolvedValue(project)

    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newMemberEmail })

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: projectId,
      message: 'Member added successfully',
    })
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId)
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(newMemberEmail)
  })

  it('should return 404 when project does not exist', async () => {
    mockProjectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newMemberEmail })

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
      deletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(deletedProject)

    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newMemberEmail })

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Project not found')
  })

  it('should return 403 when user is not the project creator', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: 999, // Different creator
      memberIds: [creatorId], // Current user is just a member
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newMemberEmail })

    expect(response.status).toBe(403)
    expect(response.body.error.message).toBe('Only the project creator can add members')
  })

  it('should return 400 when user is already a member', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: creatorId,
      memberIds: [newMemberId], // User is already a member
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newMemberUser = User.reconstitute({
      id: newMemberId,
      email: newMemberEmail,
      username: 'newmember',
      password: 'hashedpassword',
      personId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    mockProjectRepository.findById.mockResolvedValue(project)
    mockUserRepository.findByEmail.mockResolvedValue(newMemberUser)

    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newMemberEmail })

    expect(response.status).toBe(400)
    expect(response.body.error.message).toContain('already a member')
  })

  it('should return 400 when trying to add the creator as a member', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: creatorId,
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const creatorUser = User.reconstitute({
      id: creatorId,
      email: 'creator@example.com',
      username: 'creator',
      password: 'hashedpassword',
      personId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    mockProjectRepository.findById.mockResolvedValue(project)
    mockUserRepository.findByEmail.mockResolvedValue(creatorUser)

    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'creator@example.com' })

    expect(response.status).toBe(400)
    expect(response.body.error.message).toContain('creator')
  })

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .send({ email: newMemberEmail })

    expect(response.status).toBe(401)
  })

  it('should return 400 when email is missing', async () => {
    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(response.status).toBe(400)
  })

  it('should return 400 when email is invalid', async () => {
    const response = await request(app)
      .post(`/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invalid' })

    expect(response.status).toBe(400)
  })

  it('should return 400 when project ID parameter is invalid', async () => {
    const response = await request(app)
      .post('/projects/invalid-id/members')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: newMemberEmail })

    expect(response.status).toBe(400)
  })
})