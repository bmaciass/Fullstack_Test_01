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

describe('POST /tasks/:id/assign - Assign User to Task', () => {
  let app: Application
  let taskRepository: ReturnType<typeof createMockTaskRepository>
  let projectRepository: ReturnType<typeof createMockProjectRepository>
  let userRepository: ReturnType<typeof createMockUserRepository>
  let token: string
  const currentUserId = 1
  const taskId = 1
  const projectId = 1

  beforeEach(() => {
    taskRepository = createMockTaskRepository()
    projectRepository = createMockProjectRepository()
    userRepository = createMockUserRepository()
    app = createTestAppWithTasks(taskRepository, projectRepository, userRepository)
    token = generateTestToken(currentUserId, 'current@example.com')
  })

  describe('Happy Path', () => {
    it('should assign user to task successfully when user is project member', async () => {
      const userToAssign = User.reconstitute({
        id: 2,
        email: 'member@example.com',
        username: 'member',
        password: 'hashedpassword',
        personId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
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
        createdById: currentUserId,
        memberIds: [2], // userToAssign is a member
        taskIds: [taskId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const updatedTask = Task.reconstitute({
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        assignedUserIds: [2],
        deletedAt: task.deletedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(userToAssign)
      taskRepository.save.mockResolvedValue(updatedTask)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(taskId)
      expect(response.body.message).toBe('User assigned to task successfully')
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
      expect(projectRepository.findById).toHaveBeenCalledWith(projectId)
      expect(userRepository.findByEmail).toHaveBeenCalledWith('member@example.com')
      expect(taskRepository.save).toHaveBeenCalled()
    })

    it('should assign user when current user is project creator', async () => {
      const userToAssign = User.reconstitute({
        id: 2,
        email: 'member@example.com',
        username: 'member',
        password: 'hashedpassword',
        personId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
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
        createdById: currentUserId, // Current user is creator
        memberIds: [2],
        taskIds: [taskId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(userToAssign)
      taskRepository.save.mockResolvedValue(task)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User assigned to task successfully')
    })

    it('should assign user when current user is project member', async () => {
      const userToAssign = User.reconstitute({
        id: 2,
        email: 'member@example.com',
        username: 'member',
        password: 'hashedpassword',
        personId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
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
        createdById: 999, // Different creator
        memberIds: [currentUserId, 2], // Current user is member
        taskIds: [taskId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(userToAssign)
      taskRepository.save.mockResolvedValue(task)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User assigned to task successfully')
    })
  })

  describe('Error Cases - Task Not Found', () => {
    it('should return 404 when task does not exist', async () => {
      taskRepository.findById.mockResolvedValue(null)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('Task not found')
    })

    it('should return 404 when task is deleted', async () => {
      const deletedTask = Task.reconstitute({
        id: taskId,
        name: 'Deleted Task',
        description: null,
        status: 'pending',
        priority: 'medium',
        projectId,
        assignedUserIds: [],
        deletedAt: new Date(), // Soft deleted
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(deletedTask)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('Task not found')
    })
  })

  describe('Error Cases - Project Not Found', () => {
    it('should return 404 when project does not exist', async () => {
      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
        projectId,
        assignedUserIds: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(null)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('Project not found')
    })

    it('should return 404 when project is deleted', async () => {
      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
        projectId,
        assignedUserIds: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const deletedProject = Project.reconstitute({
        id: projectId,
        name: 'Deleted Project',
        slug: 'deleted-project',
        description: null,
        createdById: currentUserId,
        memberIds: [],
        taskIds: [taskId],
        deletedAt: new Date(), // Soft deleted
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(deletedProject)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('Project not found')
    })
  })

  describe('Error Cases - Access Control', () => {
    it('should return 403 when current user does not have access to project', async () => {
      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
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
        createdById: 999, // Different creator
        memberIds: [2, 3], // Current user NOT a member
        taskIds: [taskId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(403)
      expect(response.body.error.message).toBe('You do not have access to this project')
    })
  })

  describe('Error Cases - User Not Found', () => {
    it('should return 404 when user to assign does not exist', async () => {
      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
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
        createdById: currentUserId,
        memberIds: [],
        taskIds: [taskId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(null)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'nonexistent@example.com' })

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('User not found')
    })

    it('should return 404 when user to assign is deleted', async () => {
      const deletedUser = User.reconstitute({
        id: 2,
        email: 'deleted@example.com',
        username: 'deleted',
        password: 'hashedpassword',
        personId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(), // User is deleted
      })

      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
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
        createdById: currentUserId,
        memberIds: [2],
        taskIds: [taskId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(deletedUser)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'deleted@example.com' })

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('User not found')
    })
  })

  describe('Error Cases - User Not Project Member', () => {
    it('should return 400 when user to assign is not a project member', async () => {
      const userToAssign = User.reconstitute({
        id: 2,
        email: 'outsider@example.com',
        username: 'outsider',
        password: 'hashedpassword',
        personId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
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
        createdById: currentUserId,
        memberIds: [3, 4], // userToAssign (id=2) is NOT a member
        taskIds: [taskId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(userToAssign)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'outsider@example.com' })

      expect(response.status).toBe(400)
      expect(response.body.error.message).toBe('User must be a member of the project to be assigned to tasks')
    })

    it('should allow assigning project creator to task', async () => {
      const projectCreator = User.reconstitute({
        id: 5,
        email: 'creator@example.com',
        username: 'creator',
        password: 'hashedpassword',
        personId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })

      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
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
        createdById: 5, // Creator
        memberIds: [currentUserId], // Current user is member
        taskIds: [taskId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(projectCreator)
      taskRepository.save.mockResolvedValue(task)

      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'creator@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User assigned to task successfully')
    })
  })

  describe('Error Cases - Validation', () => {
    it('should return 401 when no authorization token is provided', async () => {
      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(401)
    })

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(response.status).toBe(400)
    })

    it('should return 400 when email is invalid format', async () => {
      const response = await request(app)
        .post(`/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'invalid-email' })

      expect(response.status).toBe(400)
    })

    it('should return 400 when task ID is invalid', async () => {
      const response = await request(app)
        .post('/tasks/invalid-id/assign')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com' })

      expect(response.status).toBe(400)
    })
  })
})