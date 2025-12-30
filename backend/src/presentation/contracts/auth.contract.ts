import { initContract } from '@ts-rest/core'
import { z } from 'zod'
import { loginSchema, refreshSchema, registerSchema } from '../validators/auth.validator'
import {
  currentUserResponseSchema,
  errorResponseSchema,
  loginResponseSchema,
  refreshResponseSchema,
  registerResponseSchema,
  userStatsResponseSchema,
} from './schemas'

const c = initContract()

export const authContract = c.router(
  {
    register: {
      method: 'POST',
      path: '/register',
      responses: {
        201: registerResponseSchema,
        400: errorResponseSchema,
        409: errorResponseSchema,
      },
      body: registerSchema,
      summary: 'Register a new user',
      description: 'Create a new user account with email, username, password, and personal information',
    },
    login: {
      method: 'POST',
      path: '/login',
      responses: {
        200: loginResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
      },
      body: loginSchema,
      summary: 'Login user',
      description: 'Authenticate a user with email and password, returns access and refresh tokens',
    },
    refresh: {
      method: 'POST',
      path: '/refresh',
      responses: {
        200: refreshResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
      },
      body: refreshSchema,
      summary: 'Refresh access token',
      description: 'Get a new access token using a valid refresh token',
    },
    logout: {
      method: 'POST',
      path: '/logout',
      responses: {
        204: z.void(),
      },
      body: z.object({}),
      summary: 'Logout user',
      description: 'Logout the current user (currently a placeholder endpoint)',
    },
    me: {
      method: 'GET',
      path: '/me',
      responses: {
        200: currentUserResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
      },
      summary: 'Get current user',
      description: 'Get the authenticated user\'s profile information',
      metadata: {
        auth: 'required',
      } as const,
    },
    getStats: {
      method: 'GET',
      path: '/stats',
      responses: {
        200: userStatsResponseSchema,
        401: errorResponseSchema,
      },
      summary: 'Get user statistics',
      description: 'Get statistics about user\'s projects and tasks',
      metadata: {
        auth: 'required',
      } as const,
    },
  }
)