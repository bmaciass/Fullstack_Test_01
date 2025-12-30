import type { Application } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { User } from '../../../src/domain/entities/User'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockUserRepository } from '../../helpers/mockUserRepository'
import { createTestAppWithProjects } from '../../helpers/createTestAppWithProjects'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('DELETE /projects/:id/members - Remove Member from Project', () => {
  let app: Application
  let mockProjectRepository: ReturnType<typeof createMockProjectRepository>
  let mockUserRepository: ReturnType<typeof createMockUserRepository>
  let token: string
  const creatorId = 1
  const projectId = 1
  const memberId = 2
  const memberEmail = 'member@example.com'

  beforeEach(() => {
    mockProjectRepository = createMockProjectRepository()
    mockUserRepository = createMockUserRepository()
    app = createTestAppWithProjects(mockProjectRepository, mockUserRepository)
    token = generateTestToken(creatorId, 'creator@example.com')
  })

  it('should return 200 when creator removes a member from their project', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: creatorId,
      memberIds: [memberId],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const memberUser = User.reconstitute({
      id: memberId,
      email: memberEmail,
      username: 'member',
      password: 'hashedpassword',
      personId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    mockProjectRepository.findById.mockResolvedValue(project)
    mockUserRepository.findByEmail.mockResolvedValue(memberUser)
    mockProjectRepository.save.mockResolvedValue(project)

    const response = await request(app)
      .delete(`/projects/${projectId}/members?email=${memberEmail}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: projectId,
      message: 'Member removed successfully',
    })
    expect(mockProjectRepository.findById).toHaveBeenCalledWith(projectId)
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(memberEmail)
  })

  it('should return 404 when project does not exist', async () => {
    mockProjectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .delete(`/projects/${projectId}/members?email=${memberEmail}`)
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
      memberIds: [memberId],
      taskIds: [],
      deletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(deletedProject)

    const response = await request(app)
      .delete(`/projects/${projectId}/members?email=${memberEmail}`)
      .set('Authorization', `Bearer ${token}`)

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
      memberIds: [creatorId, memberId], // Current user is just a member
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockProjectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .delete(`/projects/${projectId}/members?email=${memberEmail}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.error.message).toBe('Only the project creator can remove members')
  })

  it('should return 400 when user is not a member', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: creatorId,
      memberIds: [], // Member is not in the list
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const memberUser = User.reconstitute({
      id: memberId,
      email: memberEmail,
      username: 'member',
      password: 'hashedpassword',
      personId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    mockProjectRepository.findById.mockResolvedValue(project)
    mockUserRepository.findByEmail.mockResolvedValue(memberUser)

    const response = await request(app)
      .delete(`/projects/${projectId}/members?email=${memberEmail}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body.error.message).toContain('not a member')
  })

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app).delete(`/projects/${projectId}/members?email=${memberEmail}`)

    expect(response.status).toBe(401)
  })

  it('should return 400 when email parameter is invalid', async () => {
    const response = await request(app)
      .delete(`/projects/${projectId}/members?email=invalid-email`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
  })

  it('should return 400 when project ID parameter is invalid', async () => {
    const response = await request(app)
      .delete(`/projects/invalid-id/members?email=${memberEmail}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
  })
})