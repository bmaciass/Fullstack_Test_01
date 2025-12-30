import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import {
  addMemberSchema,
  createProjectSchema,
  listProjectsQuerySchema,
  projectIdParamSchema,
  removeMemberQuerySchema,
  updateProjectSchema,
} from '../validators/project.validator'
import {
  addMemberResponseSchema,
  createProjectResponseSchema,
  deleteProjectResponseSchema,
  errorResponseSchema,
  getProjectByIdResponseSchema,
  getProjectMembersResponseSchema,
  listProjectsResponseSchema,
  removeMemberResponseSchema,
  updateProjectResponseSchema,
} from './schemas'

const c = initContract()

export const projectContract = c.router(
  {
    list: {
      method: 'GET',
      path: '/',
      responses: {
        200: listProjectsResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
      },
      query: listProjectsQuerySchema,
      summary: 'List projects',
      description: 'Get a paginated list of projects the user has access to',
      metadata: {
        auth: 'required',
      } as const,
    },
    getById: {
      method: 'GET',
      path: '/:id',
      responses: {
        200: getProjectByIdResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: projectIdParamSchema,
      summary: 'Get project by ID',
      description: 'Get detailed information about a specific project',
      metadata: {
        auth: 'required',
      } as const,
    },
    getMembers: {
      method: 'GET',
      path: '/:id/members',
      responses: {
        200: getProjectMembersResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: projectIdParamSchema,
      summary: 'Get project members',
      description: 'Get a list of all members in a project',
      metadata: {
        auth: 'required',
      } as const,
    },
    create: {
      method: 'POST',
      path: '/',
      responses: {
        201: createProjectResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        409: errorResponseSchema,
      },
      body: createProjectSchema,
      summary: 'Create project',
      description: 'Create a new project',
      metadata: {
        auth: 'required',
      } as const,
    },
    update: {
      method: 'PATCH',
      path: '/:id',
      responses: {
        200: updateProjectResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        409: errorResponseSchema,
      },
      pathParams: projectIdParamSchema,
      body: updateProjectSchema,
      summary: 'Update project',
      description: 'Update an existing project (only creator can update)',
      metadata: {
        auth: 'required',
      } as const,
    },
    delete: {
      method: 'DELETE',
      path: '/:id',
      responses: {
        200: deleteProjectResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: projectIdParamSchema,
      body: z.object({}),
      summary: 'Delete project',
      description: 'Soft delete a project (only creator can delete)',
      metadata: {
        auth: 'required',
      } as const,
    },
    addMember: {
      method: 'POST',
      path: '/:id/members',
      responses: {
        201: addMemberResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        409: errorResponseSchema,
      },
      pathParams: projectIdParamSchema,
      body: addMemberSchema,
      summary: 'Add member to project',
      description: 'Add a user to the project (only creator can add members)',
      metadata: {
        auth: 'required',
      } as const,
    },
    removeMember: {
      method: 'DELETE',
      path: '/:id/members',
      responses: {
        200: removeMemberResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      pathParams: projectIdParamSchema,
      query: removeMemberQuerySchema,
      summary: 'Remove member from project',
      description: 'Remove a user from the project (only creator can remove members)',
      metadata: {
        auth: 'required',
      } as const,
    },
  }
)
