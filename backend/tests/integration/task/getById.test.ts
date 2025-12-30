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

describe('GET /tasks/:id - Get Task By ID', () => {
  let app: Application
  let taskRepository: ReturnType<typeof createMockTaskRepository>
  let projectRepository: ReturnType<typeof createMockProjectRepository>
  let userRepository: ReturnType<typeof createMockUserRepository>
  let token: string
  const userId = 1
  const taskId = 1
  const projectId = 1

  beforeEach(() => {
    taskRepository = createMockTaskRepository()
    projectRepository = createMockProjectRepository()
    userRepository = createMockUserRepository()
    app = createTestAppWithTasks(taskRepository, projectRepository, userRepository)
    token = generateTestToken(userId, 'test@example.com')
  })

  it('should return task when user is the project creator', async () => {
    const task = Task.reconstitute({
      id: taskId,
      name: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'high',
      projectId,
      assignedUserIds: [1, 2],
      deletedAt: null,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
    })

    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: userId,
      memberIds: [],
      taskIds: [taskId],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(task)
    projectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: taskId,
      name: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'high',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    })
  })

  it('should return task when user is a project member', async () => {
    const task = Task.reconstitute({
      id: taskId,
      name: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'high',
      projectId,
      assignedUserIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: 999, // Different user
      memberIds: [userId], // Current user is a member
      taskIds: [taskId],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(task)
    projectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(taskId)
  })

  it('should return 404 when task does not exist', async () => {
    taskRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Task not found')
  })

  it('should return 404 when task is deleted', async () => {
    const deletedTask = Task.reconstitute({
      id: taskId,
      name: 'Deleted Task',
      description: 'Description',
      status: 'pending',
      priority: 'low',
      projectId,
      assignedUserIds: [],
      deletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(deletedTask)

    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Task not found')
  })

  it('should return 404 when project does not exist', async () => {
    const task = Task.reconstitute({
      id: taskId,
      name: 'Task',
      description: 'Description',
      status: 'pending',
      priority: 'low',
      projectId,
      assignedUserIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(task)
    projectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Project not found')
  })

  it('should return 403 when user does not have access to the project', async () => {
    const task = Task.reconstitute({
      id: taskId,
      name: 'Task',
      description: 'Description',
      status: 'pending',
      priority: 'low',
      projectId,
      assignedUserIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: null,
      createdById: 999, // Different user
      memberIds: [], // Current user is not a member
      taskIds: [taskId],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(task)
    projectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .get(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.error.message).toBe('You do not have access to this task')
  })

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app).get(`/tasks/${taskId}`)

    expect(response.status).toBe(401)
  })

  it('should return 400 when task ID parameter is invalid', async () => {
    const response = await request(app)
      .get('/tasks/invalid-id')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
  })
})
