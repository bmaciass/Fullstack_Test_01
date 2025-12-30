import type { Express } from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import { Project } from '../../../src/domain/entities/Project'
import { Task } from '../../../src/domain/entities/Task'
import { User } from '../../../src/domain/entities/User'
import { generateTestToken } from '../../helpers/generateTestToken'
import { createMockProjectRepository, type MockProjectRepository } from '../../helpers/mockProjectRepository'
import { createMockTaskRepository, type MockTaskRepository } from '../../helpers/mockTaskRepository'
import { createMockUserRepository, type MockUserRepository } from '../../helpers/mockUserRepository'
import { createTestAppWithStats } from '../../helpers/testAppWithStats'

describe('GET /auth/stats', () => {
  let mockUserRepository: MockUserRepository
  let mockProjectRepository: MockProjectRepository
  let mockTaskRepository: MockTaskRepository
  let app: Express
  const userId = 1
  const userEmail = 'user@example.com'

  beforeEach(() => {
    mockUserRepository = createMockUserRepository()
    mockProjectRepository = createMockProjectRepository()
    mockTaskRepository = createMockTaskRepository()
    app = createTestAppWithStats(mockUserRepository, mockProjectRepository, mockTaskRepository)
  })

  describe('Happy Path', () => {
    it('should return 200 with user stats when user has projects and tasks', async () => {
      const token = generateTestToken(userId, userEmail)

      // Mock projects where user is creator or member
      const project1 = Project.reconstitute({
        id: 1,
        name: 'Project 1',
        slug: 'project-1',
        description: 'Description',
        createdById: userId, // User is creator
        memberIds: [],
        taskIds: [1, 2],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const project2 = Project.reconstitute({
        id: 2,
        name: 'Project 2',
        slug: 'project-2',
        description: null,
        createdById: 2, // Different creator
        memberIds: [userId], // User is member
        taskIds: [3],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const project3 = Project.reconstitute({
        id: 3,
        name: 'Deleted Project',
        slug: 'deleted-project',
        description: null,
        createdById: userId,
        memberIds: [],
        taskIds: [],
        deletedAt: new Date(), // Deleted project - should be excluded
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Mock tasks where user is assigned
      const task1 = Task.reconstitute({
        id: 1,
        name: 'Task 1',
        description: 'Description',
        status: 'pending',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const task2 = Task.reconstitute({
        id: 2,
        name: 'Task 2',
        description: 'Description',
        status: 'pending',
        priority: 'medium',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const task3 = Task.reconstitute({
        id: 3,
        name: 'Task 3',
        description: 'Description',
        status: 'in_progress',
        priority: 'low',
        projectId: 2,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const task4 = Task.reconstitute({
        id: 4,
        name: 'Task 4',
        description: 'Description',
        status: 'completed',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId], // Completed task
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const task5 = Task.reconstitute({
        id: 5,
        name: 'Task 5',
        description: 'Description',
        status: 'pending',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [2], // Not assigned to current user
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const task6 = Task.reconstitute({
        id: 6,
        name: 'Task 6',
        description: 'Description',
        status: 'pending',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: new Date(), // Deleted task - should be excluded
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockProjectRepository.findAll.mockResolvedValue({
        projects: [project1, project2, project3],
        total: 3,
      })
      mockTaskRepository.findAll.mockResolvedValue({
        tasks: [task1, task2, task3, task4, task5, task6],
        total: 6,
      })

      const response = await request(app)
        .get('/auth/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        projectsCount: 2, // project1 (creator) + project2 (member), excluding deleted project3
        pendingTasksCount: 2, // task1 + task2 (both pending and assigned to user)
        inProgressTasksCount: 1, // task3 (in_progress and assigned to user)
      })
    })

    it('should return 200 with zero stats when user has no projects or tasks', async () => {
      const token = generateTestToken(userId, userEmail)

      mockProjectRepository.findAll.mockResolvedValue({ projects: [], total: 0 })
      mockTaskRepository.findAll.mockResolvedValue({ tasks: [], total: 0 })

      const response = await request(app)
        .get('/auth/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        projectsCount: 0,
        pendingTasksCount: 0,
        inProgressTasksCount: 0,
      })
    })

    it('should only count projects where user is creator or member', async () => {
      const token = generateTestToken(userId, userEmail)

      const ownProject = Project.reconstitute({
        id: 1,
        name: 'Own Project',
        slug: 'own-project',
        description: null,
        createdById: userId, // User is creator
        memberIds: [],
        taskIds: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const memberProject = Project.reconstitute({
        id: 2,
        name: 'Member Project',
        slug: 'member-project',
        description: null,
        createdById: 2,
        memberIds: [userId], // User is member
        taskIds: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const otherProject = Project.reconstitute({
        id: 3,
        name: 'Other Project',
        slug: 'other-project',
        description: null,
        createdById: 3, // Different creator
        memberIds: [2, 4], // User is NOT a member
        taskIds: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockProjectRepository.findAll.mockResolvedValue({
        projects: [ownProject, memberProject, otherProject],
        total: 3,
      })
      mockTaskRepository.findAll.mockResolvedValue({ tasks: [], total: 0 })

      const response = await request(app)
        .get('/auth/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.projectsCount).toBe(2) // Only ownProject and memberProject
    })

    it('should only count tasks where user is assigned', async () => {
      const token = generateTestToken(userId, userEmail)

      const assignedTask1 = Task.reconstitute({
        id: 1,
        name: 'Assigned Task 1',
        description: null,
        status: 'pending',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const assignedTask2 = Task.reconstitute({
        id: 2,
        name: 'Assigned Task 2',
        description: null,
        status: 'in_progress',
        priority: 'medium',
        projectId: 1,
        assignedUserIds: [userId, 2], // Multiple assignees including user
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const unassignedTask = Task.reconstitute({
        id: 3,
        name: 'Unassigned Task',
        description: null,
        status: 'pending',
        priority: 'low',
        projectId: 1,
        assignedUserIds: [2, 3], // User is NOT assigned
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockProjectRepository.findAll.mockResolvedValue({ projects: [], total: 0 })
      mockTaskRepository.findAll.mockResolvedValue({
        tasks: [assignedTask1, assignedTask2, unassignedTask],
        total: 3,
      })

      const response = await request(app)
        .get('/auth/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        projectsCount: 0,
        pendingTasksCount: 1, // Only assignedTask1
        inProgressTasksCount: 1, // Only assignedTask2
      })
    })

    it('should correctly categorize tasks by status', async () => {
      const token = generateTestToken(userId, userEmail)

      const pendingTask1 = Task.reconstitute({
        id: 1,
        name: 'Pending Task 1',
        description: null,
        status: 'pending',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const pendingTask2 = Task.reconstitute({
        id: 2,
        name: 'Pending Task 2',
        description: null,
        status: 'pending',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const inProgressTask1 = Task.reconstitute({
        id: 3,
        name: 'In Progress Task 1',
        description: null,
        status: 'in_progress',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const completedTask = Task.reconstitute({
        id: 4,
        name: 'Completed Task',
        description: null,
        status: 'completed',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const reviewingTask = Task.reconstitute({
        id: 5,
        name: 'Reviewing Task',
        description: null,
        status: 'reviewing',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockProjectRepository.findAll.mockResolvedValue({ projects: [], total: 0 })
      mockTaskRepository.findAll.mockResolvedValue({
        tasks: [pendingTask1, pendingTask2, inProgressTask1, completedTask, reviewingTask],
        total: 5,
      })

      const response = await request(app)
        .get('/auth/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        projectsCount: 0,
        pendingTasksCount: 2, // pendingTask1, pendingTask2
        inProgressTasksCount: 1, // inProgressTask1
      })
    })

    it('should exclude deleted projects and tasks from stats', async () => {
      const token = generateTestToken(userId, userEmail)

      const activeProject = Project.reconstitute({
        id: 1,
        name: 'Active Project',
        slug: 'active-project',
        description: null,
        createdById: userId,
        memberIds: [],
        taskIds: [],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const deletedProject = Project.reconstitute({
        id: 2,
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

      const activeTask = Task.reconstitute({
        id: 1,
        name: 'Active Task',
        description: null,
        status: 'pending',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const deletedTask = Task.reconstitute({
        id: 2,
        name: 'Deleted Task',
        description: null,
        status: 'pending',
        priority: 'high',
        projectId: 1,
        assignedUserIds: [userId],
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockProjectRepository.findAll.mockResolvedValue({
        projects: [activeProject, deletedProject],
        total: 2,
      })
      mockTaskRepository.findAll.mockResolvedValue({
        tasks: [activeTask, deletedTask],
        total: 2,
      })

      const response = await request(app)
        .get('/auth/stats')
        .set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        projectsCount: 1, // Only activeProject
        pendingTasksCount: 1, // Only activeTask
        inProgressTasksCount: 0,
      })
    })
  })

  describe('Error Cases', () => {
    it('should return 401 when no authorization token is provided', async () => {
      const response = await request(app).get('/auth/stats')

      expect(response.status).toBe(401)
    })

    it('should return 401 when invalid token is provided', async () => {
      const response = await request(app)
        .get('/auth/stats')
        .set('Authorization', 'Bearer invalid-token')

      expect(response.status).toBe(401)
    })

    it('should return 401 when token is malformed', async () => {
      const response = await request(app)
        .get('/auth/stats')
        .set('Authorization', 'InvalidFormat')

      expect(response.status).toBe(401)
    })
  })
})