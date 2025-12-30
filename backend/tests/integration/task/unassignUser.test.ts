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

describe('DELETE /tasks/:id/unassign/:email - Unassign User from Task', () => {
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
    it('should unassign user from task successfully', async () => {
      const userToUnassign = User.reconstitute({
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
        assignedUserIds: [2], // User is currently assigned
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

      const updatedTask = Task.reconstitute({
        id: task.id,
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        assignedUserIds: [], // User removed
        deletedAt: task.deletedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(userToUnassign)
      taskRepository.save.mockResolvedValue(updatedTask)

      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(taskId)
      expect(response.body.message).toBe('User unassigned from task successfully')
      expect(taskRepository.findById).toHaveBeenCalledWith(taskId)
      expect(projectRepository.findById).toHaveBeenCalledWith(projectId)
      expect(userRepository.findByEmail).toHaveBeenCalledWith('member@example.com')
      expect(taskRepository.save).toHaveBeenCalled()
    })

    it('should unassign user when current user is project creator', async () => {
      const userToUnassign = User.reconstitute({
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
        assignedUserIds: [2],
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
      userRepository.findByEmail.mockResolvedValue(userToUnassign)
      taskRepository.save.mockResolvedValue(task)

      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User unassigned from task successfully')
    })

    it('should unassign user when current user is project member', async () => {
      const userToUnassign = User.reconstitute({
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
        assignedUserIds: [2],
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
      userRepository.findByEmail.mockResolvedValue(userToUnassign)
      taskRepository.save.mockResolvedValue(task)

      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User unassigned from task successfully')
    })

    it('should unassign user from task with multiple assigned users', async () => {
      const userToUnassign = User.reconstitute({
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
        assignedUserIds: [2, 3, 4], // Multiple users assigned
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
        memberIds: [2, 3, 4],
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
        assignedUserIds: [3, 4], // Only user 2 removed
        deletedAt: task.deletedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(project)
      userRepository.findByEmail.mockResolvedValue(userToUnassign)
      taskRepository.save.mockResolvedValue(updatedTask)

      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User unassigned from task successfully')
    })
  })

  describe('Error Cases - Task Not Found', () => {
    it('should return 404 when task does not exist', async () => {
      taskRepository.findById.mockResolvedValue(null)

      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

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
        assignedUserIds: [2],
        deletedAt: new Date(), // Soft deleted
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(deletedTask)

      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

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
        assignedUserIds: [2],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      taskRepository.findById.mockResolvedValue(task)
      projectRepository.findById.mockResolvedValue(null)

      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

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
        assignedUserIds: [2],
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
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

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
        assignedUserIds: [2],
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
        .delete(`/tasks/${taskId}/unassign/member@example.com`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(403)
      expect(response.body.error.message).toBe('You do not have access to this project')
    })
  })

  describe('Error Cases - User Not Found', () => {
    it('should return 404 when user to unassign does not exist', async () => {
      const task = Task.reconstitute({
        id: taskId,
        name: 'Task Name',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
        projectId,
        assignedUserIds: [2],
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
        .delete(`/tasks/${taskId}/unassign/nonexistent@example.com`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('User not found')
    })

    it('should return 404 when user to unassign is deleted', async () => {
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
        assignedUserIds: [2],
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
        .delete(`/tasks/${taskId}/unassign/deleted@example.com`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(404)
      expect(response.body.error.message).toBe('User not found')
    })
  })

  describe('Error Cases - Validation', () => {
    it('should return 401 when no authorization token is provided', async () => {
      const response = await request(app).delete(`/tasks/${taskId}/unassign/member@example.com`)

      expect(response.status).toBe(401)
    })

    it('should return 400 when task ID is invalid', async () => {
      const response = await request(app)
        .delete('/tasks/invalid-id/unassign/member@example.com')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
    })

    it('should return 400 when email format is invalid', async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/invalid-email`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(400)
    })
  })

  describe('Edge Cases', () => {
    it('should handle URL encoded email addresses', async () => {
      const userToUnassign = User.reconstitute({
        id: 2,
        email: 'member+test@example.com',
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
        assignedUserIds: [2],
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
      userRepository.findByEmail.mockResolvedValue(userToUnassign)
      taskRepository.save.mockResolvedValue(task)

      // Email with + character needs URL encoding
      const encodedEmail = encodeURIComponent('member+test@example.com')
      const response = await request(app)
        .delete(`/tasks/${taskId}/unassign/${encodedEmail}`)
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('User unassigned from task successfully')
      expect(userRepository.findByEmail).toHaveBeenCalledWith('member+test@example.com')
    })
  })
})