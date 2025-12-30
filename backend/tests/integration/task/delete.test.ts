import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import type { Application } from 'express'
import { Task } from '../../../src/domain/entities/Task'
import { Project } from '../../../src/domain/entities/Project'
import { createMockTaskRepository } from '../../helpers/mockTaskRepository'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createTestAppWithTasks } from '../../helpers/createTestAppWithTasks'
import { generateTestToken } from '../../helpers/generateTestToken'

describe('DELETE /tasks/:id - Delete Task', () => {
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

  it('should delete a task when user is the project creator and return 200', async () => {
    const existingTask = Task.reconstitute({
      id: taskId,
      name: 'Task to Delete',
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
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: taskId,
      message: 'Task deleted successfully',
    })
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
    expect(projectRepository.findById).toHaveBeenCalledWith(projectId)
    expect(taskRepository.save).toHaveBeenCalled()
  })

  it('should return 404 when task does not exist', async () => {
    taskRepository.findById.mockResolvedValue(null)

    const response = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Task not found')
  })

  it('should return 404 when task is already deleted', async () => {
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
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

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
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
    expect(response.body.error.message).toBe('Project not found')
  })

  it('should return 403 when user is not the project creator', async () => {
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
      memberIds: [userId], // Current user is only a member
      taskIds: [taskId],
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(existingTask)
    projectRepository.findById.mockResolvedValue(project)

    const response = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(403)
    expect(response.body.error.message).toBe('Only the project creator can delete tasks')
  })

  it('should return 401 when no authorization token is provided', async () => {
    const response = await request(app).delete(`/tasks/${taskId}`)

    expect(response.status).toBe(401)
  })

  it('should return 400 when task ID parameter is invalid', async () => {
    const response = await request(app)
      .delete('/tasks/invalid-id')
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
  })
})
