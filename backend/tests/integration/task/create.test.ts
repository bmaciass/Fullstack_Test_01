import type { Application } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { Task } from '../../../src/domain/entities/Task'
import { createTestAppWithTasks } from '../../helpers/createTestAppWithTasks'
import { generateTestToken } from '../../helpers/generateTestToken'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockTaskRepository } from '../../helpers/mockTaskRepository'
import { createMockUserRepository } from '../../helpers/mockUserRepository'

describe('POST /tasks - Create Task', () => {
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

  it('should create a task with valid input and return 201', async () => {
    const project = Project.reconstitute({
      id: projectId,
      name: 'Test Project',
      slug: 'test-project',
      description: 'A test project',
      createdById: userId,
      memberIds: [],
      taskIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newTask = Task.create({
      name: 'New Task',
      description: 'A new task',
      status: 'pending',
      priority: 'medium',
      projectId,
    })

    const savedTask = Task.reconstitute({
      id: 1,
      name: newTask.name,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      projectId: newTask.projectId,
      assignedUserIds: [],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    projectRepository.findById.mockResolvedValue(project)
    taskRepository.save.mockResolvedValue(savedTask)

    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Task',
        description: 'A new task',
        status: 'pending',
        priority: 'medium',
        projectId,
      })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      id: savedTask.id,
      name: savedTask.name,
      description: savedTask.description,
      status: savedTask.status,
      priority: savedTask.priority,
      createdAt: savedTask.createdAt.toISOString(),
      updatedAt: savedTask.updatedAt.toISOString(),
      assignedMembers: [],
    })
    expect(projectRepository.findById).toHaveBeenCalledWith(projectId)
    expect(taskRepository.save).toHaveBeenCalled()
  })

  it('should return 404 when project does not exist', async () => {
    projectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Task',
        description: 'A new task',
        status: 'pending',
        priority: 'medium',
        projectId: 999,
      })

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Project not found')
  })

  it('should return 404 when project is deleted', async () => {
    const deletedProject = Project.reconstitute({
      id: projectId,
      name: 'Deleted Project',
      slug: 'deleted-project',
      description: null,
      createdById: userId,
      memberIds: [],
      taskIds: [],
      deletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    projectRepository.findById.mockResolvedValue(deletedProject)

    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Task',
        description: 'A new task',
        status: 'pending',
        priority: 'medium',
        projectId,
      })

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
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Task',
        description: 'A new task',
        status: 'pending',
        priority: 'medium',
        projectId,
      })

    expect(response.status).toBe(403)
    expect(response.body.error.message).toBe('You do not have access to this project')
  })

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app).post('/tasks').send({
      name: 'New Task',
      description: 'A new task',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId,
    })

    expect(response.status).toBe(401)
  })

  it('should return 400 when required fields are missing', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Missing name and other fields',
      })

    expect(response.status).toBe(400)
  })

  it('should return 400 when status is invalid', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Task',
        description: 'A new task',
        status: 'INVALID_STATUS' as any,
        priority: 'medium',
        projectId,
      })

    expect(response.status).toBe(400)
  })

  it('should return 400 when priority is invalid', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Task',
        description: 'A new task',
        status: 'pending',
        priority: 'INVALID_PRIORITY' as any,
        projectId,
      })

    expect(response.status).toBe(400)
  })

  it('should return 400 when name exceeds max length', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'a'.repeat(256),
        description: 'A new task',
        status: 'pending',
        priority: 'medium',
        projectId,
      })

    expect(response.status).toBe(400)
  })

  it('should return 400 when description exceeds max length', async () => {
    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Task',
        description: 'a'.repeat(5001),
        status: 'pending',
        priority: 'medium',
        projectId,
      })

    expect(response.status).toBe(400)
  })
})
