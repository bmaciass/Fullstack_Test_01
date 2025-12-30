import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  assignUserToTaskSchema,
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamSchema,
  updateTaskSchema,
} from '../validators/task.validator'
import {
  assignUserToTaskResponseSchema,
  createTaskResponseSchema,
  deleteTaskResponseSchema,
  errorResponseSchema,
  getTaskAssignedUsersResponseSchema,
  getTaskByIdResponseSchema,
  listTasksResponseSchema,
  unassignUserFromTaskResponseSchema,
  updateTaskResponseSchema,
} from './schemas'

const c = initContract()

// Path params for unassign endpoint (includes both id and email)
const unassignPathParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number'),
  email: z.string().email('Invalid email format'),
})

export const taskContract = c.router(
  {
    list: {
      method: 'GET',
      path: '/',
      responses: {
        200: listTasksResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      query: listTasksQuerySchema,
      summary: 'List tasks',
      description: 'Get a paginated list of tasks with optional filtering by project, status, priority, and assigned user',
      metadata: {
        auth: 'required',
      } as const,
    },
    getById: {
      method: 'GET',
      path: '/:id',
      responses: {
        200: getTaskByIdResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: taskIdParamSchema,
      summary: 'Get task by ID',
      description: 'Get detailed information about a specific task',
      metadata: {
        auth: 'required',
      } as const,
    },
    create: {
      method: 'POST',
      path: '/',
      responses: {
        201: createTaskResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      body: createTaskSchema,
      summary: 'Create task',
      description: 'Create a new task within a project',
      metadata: {
        auth: 'required',
      } as const,
    },
    update: {
      method: 'PATCH',
      path: '/:id',
      responses: {
        200: updateTaskResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: taskIdParamSchema,
      body: updateTaskSchema,
      summary: 'Update task',
      description: 'Update an existing task (project members can update)',
      metadata: {
        auth: 'required',
      } as const,
    },
    delete: {
      method: 'DELETE',
      path: '/:id',
      responses: {
        200: deleteTaskResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: taskIdParamSchema,
      body: z.object({}),
      summary: 'Delete task',
      description: 'Soft delete a task (only project creator can delete)',
      metadata: {
        auth: 'required',
      } as const,
    },
    getAssignedUsers: {
      method: 'GET',
      path: '/:id/assigned-users',
      responses: {
        200: getTaskAssignedUsersResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: taskIdParamSchema,
      summary: 'Get assigned users',
      description: 'Get all users assigned to a task',
      metadata: {
        auth: 'required',
      } as const,
    },
    assignUser: {
      method: 'POST',
      path: '/:id/assign',
      responses: {
        201: assignUserToTaskResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        409: errorResponseSchema,
      },
      pathParams: taskIdParamSchema,
      body: assignUserToTaskSchema,
      summary: 'Assign user to task',
      description: 'Assign a user to a task (user must be a project member)',
      metadata: {
        auth: 'required',
      } as const,
    },
    unassignUser: {
      method: 'DELETE',
      path: '/:id/unassign/:email',
      responses: {
        200: unassignUserFromTaskResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: unassignPathParamsSchema,
      body: z.object({}),
      summary: 'Unassign user from task',
      description: 'Remove a user assignment from a task',
      metadata: {
        auth: 'required',
      } as const,
    },
  }
)
