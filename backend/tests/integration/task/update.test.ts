import type { Application } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { Task } from '../../../src/domain/entities/Task'
import { User } from '../../../src/domain/entities/User'
import { createTestAppWithTasks } from '../../helpers/createTestAppWithTasks'
import { generateTestToken } from '../../helpers/generateTestToken'
import { createMockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockTaskRepository } from '../../helpers/mockTaskRepository'
import { createMockUserRepository } from '../../helpers/mockUserRepository'

describe('PATCH /tasks/:id - Update Task', () => {
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

  it('should update task description successfully', async () => {
    const existingTask = Task.reconstitute({
      id: taskId,
      name: 'Task Name',
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
      name: existingTask.name,
      description: 'Updated description with more details',
      status: existingTask.status,
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
        description: 'Updated description with more details',
      })

    expect(response.status).toBe(200)
    expect(response.body.description).toBe('Updated description with more details')
    expect(taskRepository.save).toHaveBeenCalled()
  })

  it('should not update task when trying to set description to null', async () => {
    const existingTask = Task.reconstitute({
      id: taskId,
      name: 'Task Name',
      description: 'Some description',
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
      name: existingTask.name,
      description: null,
      status: existingTask.status,
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
        description: null,
      })

    expect(response.status).toBe(400)
  })

  it('should assign users to task when updating', async () => {
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

    const updatedTask = Task.reconstitute({
      id: existingTask.id,
      name: existingTask.name,
      description: existingTask.description,
      status: existingTask.status,
      priority: existingTask.priority,
      projectId: existingTask.projectId,
      assignedUserIds: [2, 3],
      deletedAt: existingTask.deletedAt,
      createdAt: existingTask.createdAt,
      updatedAt: existingTask.updatedAt,
    })

    taskRepository.findById.mockResolvedValue(existingTask)
    projectRepository.findById.mockResolvedValue(project)
    userRepository.findByUsername.mockImplementation(async (username: string) => {
      if (username === 'member1') return member1
      if (username === 'member2') return member2
      return null
    })
    taskRepository.save.mockResolvedValue(updatedTask)

    const response = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        assignTo: [{ username: 'member1' }, { username: 'member2' }],
      })

    expect(response.status).toBe(200)
    expect(response.body.assignedMembers).toHaveLength(2)
    expect(response.body.assignedMembers).toEqual([
      { username: 'member1' },
      { username: 'member2' },
    ])
    expect(userRepository.findByUsername).toHaveBeenCalledWith('member1')
    expect(userRepository.findByUsername).toHaveBeenCalledWith('member2')
    expect(taskRepository.save).toHaveBeenCalled()
  })

  it('should update task name, description, and assign users in single request', async () => {
    const assignedUser = User.reconstitute({
      id: 2,
      email: 'assignee@example.com',
      username: 'assignee',
      password: 'hashedpassword',
      personId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

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
      id: taskId,
      name: 'New Task Name',
      description: 'New detailed description',
      status: 'in_progress',
      priority: 'high',
      projectId,
      assignedUserIds: [2],
      deletedAt: null,
      createdAt: existingTask.createdAt,
      updatedAt: new Date(),
    })

    taskRepository.findById.mockResolvedValue(existingTask)
    projectRepository.findById.mockResolvedValue(project)
    userRepository.findByUsername.mockResolvedValue(assignedUser)
    taskRepository.save.mockResolvedValue(updatedTask)

    const response = await request(app)
      .patch(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Task Name',
        description: 'New detailed description',
        status: 'in_progress',
        priority: 'high',
        assignTo: [{ username: 'assignee' }],
      })

    expect(response.status).toBe(200)
    expect(response.body.name).toBe('New Task Name')
    expect(response.body.description).toBe('New detailed description')
    expect(response.body.status).toBe('in_progress')
    expect(response.body.priority).toBe('high')
    expect(response.body.assignedMembers).toHaveLength(1)
    expect(response.body.assignedMembers[0].username).toBe('assignee')
    expect(taskRepository.save).toHaveBeenCalled()
  })

  it('should handle empty assignTo array', async () => {
    const existingTask = Task.reconstitute({
      id: taskId,
      name: 'Task Name',
      description: 'Description',
      status: 'pending',
      priority: 'low',
      projectId,
      assignedUserIds: [2, 3], // Previously had assignments
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
        assignTo: [], // Empty array
      })

    expect(response.status).toBe(200)
    expect(response.body.assignedMembers).toEqual([])
    expect(taskRepository.save).toHaveBeenCalled()
  })
})
