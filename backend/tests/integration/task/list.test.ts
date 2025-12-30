import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import type { Application } from 'express'
import { Task } from '../../../src/domain/entities/Task'
import { Project } from '../../../src/domain/entities/Project'
import { createMockTaskRepository } from '../../helpers/mockTaskRepository'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockUserRepository } from '../../helpers/mockUserRepository'
import { createTestAppWithTasks } from '../../helpers/createTestAppWithTasks'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('GET /tasks - List Tasks', () => {
  let app: Application
  let taskRepository: ReturnType<typeof createMockTaskRepository>
  let projectRepository: ReturnType<typeof createMockProjectRepository>
  let userRepository: ReturnType<typeof createMockUserRepository>
  let token: string
  const userId = 1
  const projectId = 1

  beforeEach(() => {
    taskRepository = createMockTaskRepository()
    projectRepository = createMockProjectRepository()
    userRepository = createMockUserRepository()
    app = createTestAppWithTasks(taskRepository, projectRepository, userRepository)
    token = generateTestToken(userId, 'test@example.com')
  })

  it('should return a list of tasks with pagination', async () => {
    const tasks = [
      Task.reconstitute({
        id: 1,
        name: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        priority: 'high',
        projectId,
        assignedUserIds: [1, 2],
        deletedAt: null,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      }),
      Task.reconstitute({
        id: 2,
        name: 'Task 2',
        description: 'Description 2',
        status: 'in_progress',
        priority: 'medium',
        projectId,
        assignedUserIds: [],
        deletedAt: null,
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
      }),
    ]

    taskRepository.findAll.mockResolvedValue({
      tasks,
      total: 2,
    })

    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: '10', offset: '0' })

    expect(response.status).toBe(200)
    expect(response.body.tasks).toHaveLength(2)
    expect(response.body.total).toBe(2)
    expect(response.body.tasks[0]).toEqual({
      id: 1,
      name: 'Task 1',
      description: 'Description 1',
      status: 'pending',
      priority: 'high',
      assignedUserCount: 2,
      createdAt: tasks[0].createdAt.toISOString(),
      updatedAt: tasks[0].updatedAt.toISOString(),
    })
  })

  it('should filter tasks by projectId when provided', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: userId,
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const tasks = [
      Task.reconstitute({
        id: 1,
        name: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        priority: 'high',
        projectId,
        assignedUserIds: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    projectRepository.findById.mockResolvedValue(project)
    taskRepository.findAll.mockResolvedValue({
      tasks,
      total: 1,
    })

    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ projectId: projectId.toString() })

    expect(response.status).toBe(200)
    expect(response.body.tasks).toHaveLength(1)
    expect(projectRepository.findById).toHaveBeenCalledWith(projectId)
  })

  it('should return 404 when filtering by non-existent projectId', async () => {
    projectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ projectId: '999' })

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Project not found')
  })

  it('should return 403 when user does not have access to the project', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: 999, // Different user
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    projectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ projectId: projectId.toString() })

    expect(response.status).toBe(403)
    expect(response.body.error.message).toBe('You do not have access to this project')
  })

  it('should return empty list when no tasks match filters', async () => {
    taskRepository.findAll.mockResolvedValue({
      tasks: [],
      total: 0,
    })

    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ status: 'completed' })

    expect(response.status).toBe(200)
    expect(response.body.tasks).toHaveLength(0)
    expect(response.body.total).toBe(0)
  })

  it('should apply sorting parameters', async () => {
    taskRepository.findAll.mockResolvedValue({
      tasks: [],
      total: 0,
    })

    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ sortBy: 'priority', sortOrder: 'asc' })

    expect(response.status).toBe(200)
    expect(taskRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'priority',
        sortOrder: 'asc',
      })
    )
  })

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app).get('/tasks')

    expect(response.status).toBe(401)
  })

  it('should return 400 when query parameters are invalid', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ limit: 'invalid' })

    expect(response.status).toBe(400)
  })
})
