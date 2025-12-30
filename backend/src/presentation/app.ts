import cors from 'cors'
import express, { type Application } from 'express'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { openApiDocument } from '../infrastructure/openapi/generator'
import { errorHandler } from './middlewares/errorHandler'
import { authRouter } from './routes/auth.routes'
import { projectRouter } from './routes/project.routes'
import taskRouter from './routes/task.routes'
import { userRouter } from './routes/user.routes'

const app: Application = express()

// Middleware
app.use(cors())
app.use(helmet())
app.use(express.json())

app.disable('x-powered-by')

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task Management API Documentation',
}))

// Routes
app.use('/auth', authRouter)
app.use('/projects', projectRouter)
app.use('/tasks', taskRouter)
app.use('/users', userRouter)

// Error handler (must be last)
app.use(errorHandler)

export { app }
