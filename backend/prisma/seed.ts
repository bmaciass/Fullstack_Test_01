import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcrypt'
import { PrismaClient } from '../generated/prisma/client'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seeding...')

  // Hash the password
  const hashedPassword = await bcrypt.hash('Admin123!', 10)

  // Create Person
  console.log('Creating person...')
  const person = await prisma.person.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
    },
  })
  console.log(`✅ Created person: ${person.firstName} ${person.lastName}`)

  // Create User
  console.log('Creating user...')
  const user = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      username: 'admin',
      password: hashedPassword,
      personId: person.id,
    },
  })
  console.log(`✅ Created user: ${user.username} (${user.email})`)

  // Create Project
  console.log('Creating project...')
  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      slug: 'demo-project',
      description: 'A demo project for local development',
      createdById: user.id,
      members: {
        connect: { id: user.id },
      },
    },
  })
  console.log(`✅ Created project: ${project.name} (${project.slug})`)

  // Create Tasks
  console.log('Creating tasks...')

  const task1 = await prisma.task.create({
    data: {
      name: 'Setup Development Environment',
      description:
        'Install and configure all necessary tools, dependencies, and environment variables for local development.',
      status: 'pending',
      priority: 'high',
      projectId: project.id,
      assignedUsers: {
        connect: { id: user.id },
      },
    },
  })
  console.log(`✅ Created task 1: ${task1.name} [${task1.status}/${task1.priority}]`)

  const task2 = await prisma.task.create({
    data: {
      name: 'Implement Authentication',
      description:
        'Build user authentication system with login, registration, and JWT token management.',
      status: 'in_progress',
      priority: 'medium',
      projectId: project.id,
      assignedUsers: {
        connect: { id: user.id },
      },
    },
  })
  console.log(`✅ Created task 2: ${task2.name} [${task2.status}/${task2.priority}]`)

  const task3 = await prisma.task.create({
    data: {
      name: 'Write Documentation',
      description:
        'Create comprehensive documentation for API endpoints, setup instructions, and usage examples.',
      status: 'completed',
      priority: 'low',
      projectId: project.id,
      assignedUsers: {
        connect: { id: user.id },
      },
    },
  })
  console.log(`✅ Created task 3: ${task3.name} [${task3.status}/${task3.priority}]`)

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - 1 Person created`)
  console.log(`   - 1 User created (${user.email})`)
  console.log(`   - 1 Project created (${project.name})`)
  console.log(`   - 3 Tasks created`)
  console.log('\n🔑 Login credentials:')
  console.log(`   Email: admin@test.com`)
  console.log(`   Password: Admin123!`)
}

main()
  .catch(error => {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
