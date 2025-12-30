import type { Application } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { Task } from '../../../src/domain/entities/Task'
import { createTestAppWithTasks } from '../../helpers/createTestAppWithTasks'
import { generateTestToken } from '../../helpers/generateTestToken'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockTaskRepository } from '../../helpers/mockTaskRepository'

describe('PATCH /tasks/:id - Update Task', () => {
  let app: Application
  let taskRepository: ReturnType<typeof createMockTaskRepository>
  let projectRepository: ReturnType<typeof createMockProjectRepository>
  let token: string
  const userId = 1
  const taskId = 1
  const projectId = 1

  beforeEach(() => {
    taskRepository = createMockTaskRepository()
    projectRepository = createMockProjectRepository()
    app = createTestAppWithTasks(taskRepository, projectRepository)
    token = generateTestToken(userId, 'test@example.com')
  })

  it('should update a task when user has access to the project and return 200', async () => {
    const existingTask = Task.reconstitute({
      id: taskId,
      name: 'Old Task Name',
      description: 'Old description',
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
      createdById: userId,
      memberIds: [],
      taskIds: [taskId],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const updatedTask = Task.reconstitute({
      id: existingTask.id,
      name: 'Updated Task Name',
      description: existingTask.description,
      status: 'in_progress',
      priority: existingTask.priority,
      projectId: existingTask.projectId,
      assignedUserIds: existingTask.assignedUserIds,
      deletedAt: existingTask.deletedAt,
      createdAt: existingTask.createdAt,
      updatedAt: existingTask.updatedAt,
    })

    taskRepository.findById.mockResolvedValue(existingTask)
    projectRepository.findById.mockResolvedValue(project)
    taskRepository.save.mockResolvedValue(updatedTask)

    const response = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Task Name',
        status: 'in_progress',
      })

    expect(response.status).toBe(200)
    expect(response.body.name).toBe('Updated Task Name')
    expect(response.body.status).toBe('in_progress')
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
    expect(projectRepository.findById).toHaveBeenCalledWith(projectId)
    expect(taskRepository.save).toHaveBeenCalled()
  })

  it('should return 404 when task does not exist', async () => {
    taskRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Task Name',
      })

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Task not found')
  })

  it('should return 404 when task is deleted', async () => {
    const deletedTask = Task.reconstitute({
      id: taskId,
      name: 'Deleted Task',
      description: 'Deleted',
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
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Task Name',
      })

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Task not found')
  })

  it('should return 404 when project does not exist', async () => {
    const existingTask = Task.reconstitute({
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

    taskRepository.findById.mockResolvedValue(existingTask)
    projectRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Task Name',
      })

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Project not found')
  })

  it('should return 403 when user does not have access to the project', async () => {
    const existingTask = Task.reconstitute({
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
      memberIds: [],
      taskIds: [taskId],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(existingTask)
    projectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Task Name',
      })

    expect(response.status).toBe(403)
    expect(response.body.error.message).toBe('You do not have access to this task')
  })

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app).patch(`/tasks/${taskId}`).send({
      name: 'Updated Task Name',
    })

    expect(response.status).toBe(401)
  })

  it('should return 400 when task ID parameter is invalid', async () => {
    const response = await request(app)
      .patch('/tasks/invalid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Task Name',
      })

    expect(response.status).toBe(400)
  })

  it('should return 400 when validation fails', async () => {
    const response = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'a'.repeat(256), // Exceeds max length
      })

    expect(response.status).toBe(400)
  })

  it('should allow partial updates', async () => {
    const existingTask = Task.reconstitute({
      id: taskId,
      name: 'Task Name',
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
      createdById: userId,
      memberIds: [],
      taskIds: [taskId],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(existingTask)
    projectRepository.findById.mockResolvedValue(project)
    taskRepository.save.mockResolvedValue(existingTask)

    const response = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        priority: 'high', // Only update priority
      })

    expect(response.status).toBe(200)
    expect(taskRepository.save).toHaveBeenCalled()
  })
})
