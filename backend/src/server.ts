import { prisma } from './infrastructure/prisma/prismaClient'
import { app } from './presentation/app'

const PORT = process.env.PORT ?? 3000

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\nShutting down gracefully...')

  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed')
  })

  // Disconnect Prisma
  await prisma.$disconnect()
  console.log('Database disconnected')

  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
