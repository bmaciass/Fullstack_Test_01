import { generateOpenApi } from '@ts-rest/open-api'
import { apiContract } from '../../presentation/contracts'

export const openApiDocument = generateOpenApi(
  apiContract,
  {
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: `
# Task Management API

A RESTful API for managing projects, tasks, and team collaboration.

## Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Project Management**: Create, update, and manage projects
- **Task Management**: Full CRUD operations for tasks with status and priority tracking
- **Team Collaboration**: Assign users to projects and tasks
- **Role-based Access**: Project creators have elevated permissions

## Authentication

Most endpoints require authentication. Include the JWT access token in the Authorization header:

\`\`\`
Authorization: Bearer <your_access_token>
\`\`\`

Tokens can be obtained through the \`/auth/login\` or \`/auth/register\` endpoints.
      `.trim(),
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  {
    jsonQuery: true,
    operationMapper: (operation, appRoute) => {
      // Add security requirement to endpoints that need auth
      if (appRoute.metadata?.auth === 'required') {
        return {
          ...operation,
          security: [{ bearerAuth: [] }],
        }
      }
      // Remove security for public endpoints
      return {
        ...operation,
        security: [],
      }
    },
  }
)
